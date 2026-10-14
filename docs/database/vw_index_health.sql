-- ==============================================================================
-- DATABASE OBSERVABILITY: INDEX HEALTH & BLOAT MONITORING VIEW
-- ==============================================================================
-- Dosya: docs/database/vw_index_health.sql
-- Amaç: 
-- 1. PostgreSQL sistem kataloglarını (pg_stat_user_indexes, pg_statio_user_tables, pg_class)
--    sorgulayarak B-Tree ve GIN indekslerinin şişmesini (Index Bloat) izlemek.
-- 2. Kullanılmayan (unused) indeksleri tespit edip gereksiz yazma maliyetini önlemek.
-- 3. Periyodik REINDEX / VACUUM ANALYZE ihtiyacı olan tabloları otomatik raporlamak.
-- ==============================================================================

-- 1. İNDEKS SAĞLIĞI VE ŞİŞME İZLEME GÖRÜNÜMÜ (VIEW)
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
    -- İndeks Kullanım ve Sağlık Teşhisi
    CASE
        WHEN idx_scan = 0 AND indexrelname NOT LIKE '%_pkey' AND indexrelname NOT LIKE '%_unique' THEN 'UNUSED_INDEX'
        WHEN pg_relation_size(indexrelid) > (pg_relation_size(relid) * 1.5) AND pg_relation_size(relid) > 10485760 THEN 'BLOATED_CRITICAL'
        WHEN idx_scan > 0 AND (pg_relation_size(indexrelid)::numeric / NULLIF(pg_relation_size(relid), 0)::numeric) > 0.8 THEN 'BLOATED_CANDIDATE'
        ELSE 'HEALTHY'
    END AS health_status,
    -- Önerilen Bakım Operasyonu
    CASE
        WHEN idx_scan = 0 AND indexrelname NOT LIKE '%_pkey' AND indexrelname NOT LIKE '%_unique' THEN 'DROP INDEX CONCURRENTLY ' || quote_ident(schemaname) || '.' || quote_ident(indexrelname) || ';'
        WHEN pg_relation_size(indexrelid) > (pg_relation_size(relid) * 1.5) AND pg_relation_size(relid) > 10485760 THEN 'REINDEX INDEX CONCURRENTLY ' || quote_ident(schemaname) || '.' || quote_ident(indexrelname) || ';'
        ELSE 'NO_ACTION_REQUIRED'
    END AS recommended_action
FROM
    pg_stat_user_indexes
ORDER BY
    pg_relation_size(indexrelid) DESC;

COMMENT ON VIEW public.vw_index_health IS 'Tüm veritabanı indekslerinin taranma sıklığı, disk boyutu ve bloat durumunu analiz eden izleme görünümü.';

-- 2. PERİYODİK BAKIM VE DÜZELTME KOMUTLARI (DBA CHECKLIST)

-- 2.1 Kullanılmayan İndeksleri Listeleme Sorgusu
-- SELECT * FROM public.vw_index_health WHERE health_status = 'UNUSED_INDEX';

-- 2.2 Kritik Şişmiş (Bloated) İndeksleri Listeleme
-- SELECT * FROM public.vw_index_health WHERE health_status IN ('BLOATED_CRITICAL', 'BLOATED_CANDIDATE');

-- 2.3 Tabloları Canlı Ortamda Kilitlemeden Reindex Etme (Zero-Downtime)
-- REINDEX TABLE CONCURRENTLY public.products;
-- REINDEX TABLE CONCURRENTLY public.service_tickets;
-- REINDEX TABLE CONCURRENTLY public.transactions;

-- 2.4 İstatistikleri Güncelleme ve Boş Alanları Toplama
-- VACUUM (VERBOSE, ANALYZE) public.products;
-- VACUUM (VERBOSE, ANALYZE) public.service_tickets;
-- VACUUM (VERBOSE, ANALYZE) public.transactions;
