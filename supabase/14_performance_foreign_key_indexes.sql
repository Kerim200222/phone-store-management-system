-- ==============================================================================
-- 14. DATABASE PERFORMANCE OPTIMIZATION: FOREIGN KEYS, COMPOSITE & FILTER INDEXES
-- ==============================================================================
-- Bu migration; N+1 sorgu gecikmelerini ve tam tablo taramalarını (Seq Scans)
-- önlemek için sık filtrelenen, sıralanan ve FOREIGN KEY ilişkisi içeren
-- tüm kolonlara B-Tree ve Trigram GIN indeksleri ekler.
-- ==============================================================================

-- 1. FOREIGN KEY VE İLİŞKİSEL İNDEKSLEME (N+1 Gecikmelerini Önleme)

-- 1.1 Service Tickets -> Customer & Technician
CREATE INDEX IF NOT EXISTS idx_service_tickets_customer_status_created 
ON public.service_tickets(customer_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_service_tickets_technician_status 
ON public.service_tickets(technician_id, status)
WHERE technician_id IS NOT NULL;

-- 1.2 Transactions -> Customer & Type
CREATE INDEX IF NOT EXISTS idx_transactions_customer_type_created 
ON public.transactions(customer_id, transaction_type, created_at DESC);

-- 1.3 Transaction Items -> Transaction & Product
CREATE INDEX IF NOT EXISTS idx_transaction_items_tx_product 
ON public.transaction_items(transaction_id, product_id);

-- 1.4 Products -> Category & Active Status
CREATE INDEX IF NOT EXISTS idx_products_category_active_stock 
ON public.products(category_id, is_active, stock_quantity);

-- 2. SIK FİLTRELENEN VE SIRALANAN ALANLAR (Filter & Sort Acceleration)

-- 2.1 Products Marka, Model ve Kondisyon Filtreleri
CREATE INDEX IF NOT EXISTS idx_products_brand_model_condition 
ON public.products(brand, model, condition) 
WHERE is_active = TRUE;

-- 2.2 Barkod ve IMEI Hızlı Doğrulama İndeksleri
CREATE INDEX IF NOT EXISTS idx_products_barcode_fast_lookup 
ON public.products(barcode) 
WHERE barcode IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_imei_fast_lookup 
ON public.products(imei) 
WHERE imei IS NOT NULL;

-- 2.3 Customers Telefon ve Bakiye İndeksleri
CREATE INDEX IF NOT EXISTS idx_customers_phone_fast_lookup 
ON public.customers(phone);

CREATE INDEX IF NOT EXISTS idx_customers_balance_created 
ON public.customers(balance, created_at DESC);

-- 3. HIZLI METİN ARAMA İÇİN TRIGRAM GIN İNDEKSLEME
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_products_name_trgm 
ON public.products USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_service_tickets_number_trgm 
ON public.service_tickets USING gin (ticket_number gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_customers_name_trgm 
ON public.customers USING gin (full_name gin_trgm_ops);

-- 4. SİSTEM İSTATİSTİKLERİNİ GÜNCELLEME (Query Planner Optimizasyonu)
ANALYZE public.products;
ANALYZE public.service_tickets;
ANALYZE public.transactions;
ANALYZE public.transaction_items;
ANALYZE public.customers;
