-- ==============================================================================
-- DATABASE ARCHITECTURE: PERFORMANCE & FOREIGN KEY INDEXES
-- ==============================================================================
-- Dosya: docs/database/02_performance_and_foreign_key_indexes.sql
-- Amaç: İlişkisel sorgularda N+1 sorununu ve Seq Scan darboğazlarını ortadan kaldırmak.
-- ==============================================================================

-- 1. FOREIGN KEY VE İLİŞKİSEL İNDEKSLEME
CREATE INDEX IF NOT EXISTS idx_service_tickets_customer_status_created 
ON public.service_tickets(customer_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_service_tickets_technician_status 
ON public.service_tickets(technician_id, status)
WHERE technician_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_customer_type_created 
ON public.transactions(customer_id, transaction_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transaction_items_tx_product 
ON public.transaction_items(transaction_id, product_id);

CREATE INDEX IF NOT EXISTS idx_products_category_active_stock 
ON public.products(category_id, is_active, stock_quantity);

-- 2. FİLTRELEME & SIRALAMA HIZLANDIRICILARI
CREATE INDEX IF NOT EXISTS idx_products_brand_model_condition 
ON public.products(brand, model, condition) 
WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_products_barcode_fast_lookup 
ON public.products(barcode) 
WHERE barcode IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_imei_fast_lookup 
ON public.products(imei) 
WHERE imei IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customers_phone_fast_lookup 
ON public.customers(phone);

CREATE INDEX IF NOT EXISTS idx_customers_balance_created 
ON public.customers(balance, created_at DESC);

-- 3. TRIGRAM GIN ARAMA İNDEKSLEME
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_products_name_trgm 
ON public.products USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_service_tickets_number_trgm 
ON public.service_tickets USING gin (ticket_number gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_customers_name_trgm 
ON public.customers USING gin (full_name gin_trgm_ops);

ANALYZE public.products;
ANALYZE public.service_tickets;
ANALYZE public.transactions;
ANALYZE public.transaction_items;
ANALYZE public.customers;
