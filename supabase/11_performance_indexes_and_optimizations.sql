-- ==============================================================================
-- 11. TELEFON MAĞAZASI YÖNETİM SİSTEMİ - PERFORMANS OPTİMİZASYONU VE İNDEKSLER
-- ==============================================================================
-- Hafta 7, Gün 33: Performans Optimizasyonu (Performance Optimization)
--
-- Bu SQL betiği; sistemdeki en sık kullanılan sorguların (POS hızlı satış, barkod/IMEI
-- tarama, teknik servis Kanban panosu, düşük stok uyarı RPC'si, global command palette
-- arama ve analitik raporları) mikro-saniyeler seviyesinde yanıt vermesini sağlamak
-- amacıyla optimize edilmiş B-Tree, Bileşik (Composite), Kısmi (Partial) ve
-- Trigram (GIN pg_trgm) indekslerini oluşturur.
-- ==============================================================================

-- 0. Gerekli Eklentilerin Etkinleştirilmesi
-- Metin tabanlı hızlı benzerlik ve arama (ILIKE '%query%') optimizasyonu için pg_trgm
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==============================================================================
-- 1. ÜRÜNLER (PRODUCTS) TABLOSU İNDEKS OPTİMİZASYONLARI
-- ==============================================================================

-- 1.1. Düşük Stok RPC & Bildirim Çanı İçin Kısmi İndeks (Partial Index)
-- Sadece aktif olan ve stok miktarı 10'un altında bulunan ürünleri hedefler.
-- Tüm tabloyu taramak yerine (Seq Scan) doğrudan indeks üzerinden anlık sonuç döner.
CREATE INDEX IF NOT EXISTS idx_products_low_stock_active 
ON public.products (stock_quantity ASC, name ASC) 
WHERE is_active = TRUE AND stock_quantity < 10;

-- 1.2. 15 Haneli IMEI Arama ve Doğrulama Kısmi İndeksi
-- Telefonların IMEI sorgulamalarını (satış, servis, envanter) mikro-saniyeye indirir.
CREATE INDEX IF NOT EXISTS idx_products_imei_active 
ON public.products (imei) 
WHERE imei IS NOT NULL AND is_active = TRUE;

-- 1.3. Kategori + Aktiflik + Sıralama Bileşik İndeksi (Composite Index)
-- Envanter filtreleme ve POS kategori sekmelerinde sıfır maliyetli indeks erişimi sağlar.
CREATE INDEX IF NOT EXISTS idx_products_category_active_created 
ON public.products (category_id, is_active, created_at DESC);

-- 1.4. Barkod Okuyucu Kısmi İndeksi
CREATE INDEX IF NOT EXISTS idx_products_barcode_active 
ON public.products (barcode) 
WHERE barcode IS NOT NULL AND is_active = TRUE;

-- 1.5. Ürün Adı, Marka ve Model İçin Trigram (GIN) İndeksleri
-- CMD+K Global Arama ve POS arama kutusunda LIKE/ILIKE aramalarını 50-100 kat hızlandırır.
CREATE INDEX IF NOT EXISTS idx_products_name_trgm 
ON public.products USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_model_trgm 
ON public.products USING gin (model gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_products_brand_trgm 
ON public.products USING gin (brand gin_trgm_ops);


-- ==============================================================================
-- 2. MÜŞTERİLER (CUSTOMERS) TABLOSU İNDEKS OPTİMİZASYONLARI
-- ==============================================================================

-- 2.1. Aktif Müşteriler & Alfabetik İsim Bileşik İndeksi
-- POS müşteri seçimi ve müşteri rehberini anlık listelemek için.
CREATE INDEX IF NOT EXISTS idx_customers_active_name 
ON public.customers (is_active, full_name ASC);

-- 2.2. Aktif Telefon Numarası Kısmi İndeksi (Benzersiz ve Hızlı Müşteri Eşleştirme)
CREATE INDEX IF NOT EXISTS idx_customers_active_phone 
ON public.customers (phone) 
WHERE is_active = TRUE;

-- 2.3. Müşteri Adı ve Telefonu İçin Trigram (GIN) İndeksleri
-- Command Palette üzerinden müşteri arandığında anlık arama desteği.
CREATE INDEX IF NOT EXISTS idx_customers_full_name_trgm 
ON public.customers USING gin (full_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_customers_phone_trgm 
ON public.customers USING gin (phone gin_trgm_ops);


-- ==============================================================================
-- 3. KASA & İŞLEMLER (TRANSACTIONS & TRANSACTION_ITEMS) İNDEKS OPTİMİZASYONLARI
-- ==============================================================================

-- 3.1. Müşteri Bazlı İşlem Geçmişi Bileşik İndeksi
-- Müşteri detay sayfasındaki tüm geçmiş alışveriş ve bakiye hareketlerini anında çeker.
CREATE INDEX IF NOT EXISTS idx_transactions_customer_date 
ON public.transactions (customer_id, created_at DESC);

-- 3.2. Finansal Raporlama ve Dashboard Analitik Bileşik İndeksi
-- 7 Günlük trend ve pasta grafik RPC fonksiyonlarında (type, status, created_at) filtrelerini hızlandırır.
CREATE INDEX IF NOT EXISTS idx_transactions_type_status_date 
ON public.transactions (type, status, created_at DESC);

-- 3.3. İşlem Kalemleri Bileşik İndeksi (Transaction Items Lookup)
CREATE INDEX IF NOT EXISTS idx_transaction_items_tx_prod 
ON public.transaction_items (transaction_id, product_id);


-- ==============================================================================
-- 4. TEKNİK SERVİS (REPAIR_TICKETS & REPAIR_TICKET_PARTS) İNDEKS OPTİMİZASYONLARI
-- ==============================================================================

-- 4.1. Kanban Panosu Durum ve Güncelleme Tarihi Bileşik İndeksi
-- Kanban panosunun 4 sütununun (bekliyor, islemde, parca_bekliyor, tamamlandi) anlık yüklenmesi için.
CREATE INDEX IF NOT EXISTS idx_repair_tickets_status_updated 
ON public.repair_tickets (status, updated_at DESC);

-- 4.2. Teknisyen İş Yükü ve Görev Takip Bileşik İndeksi
CREATE INDEX IF NOT EXISTS idx_repair_tickets_assigned_status 
ON public.repair_tickets (assigned_to, status);

-- 4.3. Müşteri Servis Geçmişi Bileşik İndeksi
CREATE INDEX IF NOT EXISTS idx_repair_tickets_customer_created 
ON public.repair_tickets (customer_id, created_at DESC);

-- 4.4. Takip / Fiş Numarası Trigram İndeksi
-- Bilet no (SRV-202610-001) aramalarında anlık eşleştirme.
CREATE INDEX IF NOT EXISTS idx_repair_tickets_ticket_number_trgm 
ON public.repair_tickets USING gin (ticket_number gin_trgm_ops);

-- 4.5. Cihaz Modeli Trigram İndeksi
CREATE INDEX IF NOT EXISTS idx_repair_tickets_device_model_trgm 
ON public.repair_tickets USING gin (device_model gin_trgm_ops);


-- ==============================================================================
-- 5. KULLANICI PROFİLLERİ (PROFILES) İNDEKS OPTİMİZASYONLARI
-- ==============================================================================

-- 5.1. Rol ve Aktiflik Bileşik İndeksi
-- Row Level Security (RLS) politikalarında her sorguda çağrılan is_admin ve is_active_staff
-- kontrollerinin maliyetini minimuma indirir.
CREATE INDEX IF NOT EXISTS idx_profiles_role_active 
ON public.profiles (role, is_active);


-- ==============================================================================
-- 6. PERFORMANS İZLEME VE İNDEKS KULLANIM GÖRÜNÜMÜ (MONITORING VIEW)
-- ==============================================================================

-- Veritabanı yöneticisinin indekslerin verimliliğini ve kullanım istatistiklerini
-- izleyebilmesi için dinamik görünüm.
CREATE OR REPLACE VIEW public.v_index_performance_stats AS
SELECT
    schemaname AS schema_name,
    relname AS table_name,
    indexrelname AS index_name,
    idx_scan AS number_of_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

COMMENT ON VIEW public.v_index_performance_stats IS 
'Public şemasındaki tüm indekslerin kullanım sıklığı ve disk boyutunu gösteren performans analiz görünümü.';


-- ==============================================================================
-- 7. SORGULAYICI İSTATİSTİKLERİNİN GÜNCELLENMESİ (ANALYZE)
-- ==============================================================================
-- PostgreSQL Query Planner motorunun en optimize yürütme planlarını (Cost-Based Optimizer)
-- seçebilmesi için güncel dağılım istatistiklerini topla.

ANALYZE public.products;
ANALYZE public.customers;
ANALYZE public.transactions;
ANALYZE public.transaction_items;
ANALYZE public.repair_tickets;
ANALYZE public.repair_ticket_parts;
ANALYZE public.profiles;
