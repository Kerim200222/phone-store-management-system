-- ==============================================================================
-- 13. DATABASE MONITORING: INDEX HEALTH & BLOAT MONITORING VIEW
-- ==============================================================================

CREATE OR REPLACE VIEW public.vw_index_health AS
SELECT
    schemaname AS schema_name,
    relname AS table_name,
    indexrelname AS index_name,
    idx_scan AS total_index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size_pretty,
    pg_relation_size(indexrelid) AS index_size_bytes,
    pg_size_pretty(pg_relation_size(relid)) AS table_size_pretty,
    pg_relation_size(relid) AS table_size_bytes,
    ROUND(
        (pg_relation_size(indexrelid)::numeric / NULLIF(pg_relation_size(relid), 0)::numeric) * 100, 
        2
    ) AS index_to_table_ratio_pct,
    CASE
        WHEN idx_scan = 0 AND indexrelname NOT LIKE '%_pkey' AND indexrelname NOT LIKE '%_unique' THEN 'UNUSED_INDEX'
        WHEN pg_relation_size(indexrelid) > (pg_relation_size(relid) * 1.5) AND pg_relation_size(relid) > 10485760 THEN 'BLOATED_CRITICAL'
        WHEN idx_scan > 0 AND (pg_relation_size(indexrelid)::numeric / NULLIF(pg_relation_size(relid), 0)::numeric) > 0.8 THEN 'BLOATED_CANDIDATE'
        ELSE 'HEALTHY'
    END AS health_status,
    CASE
        WHEN idx_scan = 0 AND indexrelname NOT LIKE '%_pkey' AND indexrelname NOT LIKE '%_unique' THEN 'DROP INDEX CONCURRENTLY ' || quote_ident(schemaname) || '.' || quote_ident(indexrelname) || ';'
        WHEN pg_relation_size(indexrelid) > (pg_relation_size(relid) * 1.5) AND pg_relation_size(relid) > 10485760 THEN 'REINDEX INDEX CONCURRENTLY ' || quote_ident(schemaname) || '.' || quote_ident(indexrelname) || ';'
        ELSE 'NO_ACTION_REQUIRED'
    END AS recommended_action
FROM
    pg_stat_user_indexes
ORDER BY
    pg_relation_size(indexrelid) DESC;

COMMENT ON VIEW public.vw_index_health IS 'Veritabanı indekslerinin kullanım sıklığı, disk boyutu ve şişme (bloat) teşhisini sunan izleme görünümü.';

GRANT SELECT ON public.vw_index_health TO authenticated, service_role;
