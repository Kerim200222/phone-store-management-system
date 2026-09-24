-- ==============================================================================
-- 3. TELEFON MAĞAZASI YÖNETİM SİSTEMİ - MÜŞTERİLER VE KASA / İŞLEMLER (SUPABASE)
-- Day 4: Müşteri ve Kasa (İşlem) Şeması (Closes #43)
-- ==============================================================================

-- Gerekli eklentilerin etkinleştirildiğinden emin olalım
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. MÜŞTERİLER (CUSTOMERS) TABLOSU
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    identity_number VARCHAR(11), -- T.C. Kimlik / Pasaport / Vergi No
    address TEXT,
    notes TEXT,
    -- Cari Bakiye (TL): Pozitif (+) ise müşterinin alacağı/avansı, Negatif (-) ise mağazaya borcu (Veresiye)
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Tablo ve Kolon Açıklamaları
COMMENT ON TABLE public.customers IS 'Telefon mağazası müşterileri ve cari hesap kayıtları';
COMMENT ON COLUMN public.customers.full_name IS 'Müşteri adı ve soyadı veya firma unvanı';
COMMENT ON COLUMN public.customers.phone IS 'İletişim ve SMS doğrulama telefon numarası';
COMMENT ON COLUMN public.customers.identity_number IS 'Fatura ve ikinci el cihaz alımları için TCKN / Pasaport No';
COMMENT ON COLUMN public.customers.balance IS 'Cari bakiye: eksi (-) ise müşterinin borcu, artı (+) ise alacağı';

-- Müşteri Arama ve Performans İndeksleri
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_full_name ON public.customers(full_name);
CREATE INDEX IF NOT EXISTS idx_customers_identity_number ON public.customers(identity_number) WHERE identity_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON public.customers(is_active);

-- Müşteriler updated_at Tetikleyicisi
DROP TRIGGER IF EXISTS trigger_customers_updated_at ON public.customers;
CREATE TRIGGER trigger_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 2. KASA VE İŞLEMLER (TRANSACTIONS) TABLOSU
-- ------------------------------------------------------------------------------
-- Alış, Satış, İade ve Servis Ödemelerini kayıt altına alan ana kasa tablosu
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Benzersiz İşlem / Fiş Numarası (Örn: TRX-20260924-001)
    transaction_number VARCHAR(50) NOT NULL UNIQUE,
    -- Müşteri Referansı (Ayaküstü / Anonim nakit satışlar için NULL olabilir)
    customer_id UUID REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL,
    -- İşlem Türü: sale (satış), purchase (alım / ikinci el alım), return (iade), repair_payment (servis ödemesi)
    type VARCHAR(30) NOT NULL CHECK (type IN ('sale', 'purchase', 'return', 'repair_payment')),
    -- Ödeme Yöntemi: cash (nakit), credit_card (kredi kartı), bank_transfer (havale/EFT), on_account (veresiye/cari), split (parçalı)
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'bank_transfer', 'on_account', 'split')),
    -- Brüt Toplam (TL)
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    -- İndirim / İskonto Tutarı (TL)
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    -- Net Tutar (total_amount - discount_amount)
    net_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (net_amount >= 0),
    -- Fiili Tahsil Edilen / Ödenen Tutar
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
    -- İşlem Durumu: completed (tamamlandı), pending (bekliyor), cancelled (iptal edildi)
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
    notes TEXT,
    -- İşlemi Yapan Personel / Profil
    created_by UUID REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Tablo ve Kolon Açıklamaları
COMMENT ON TABLE public.transactions IS 'Kasa hareketleri, satış ve alım işlemleri ana tablosu';
COMMENT ON COLUMN public.transactions.transaction_number IS 'Benzersiz işlem / fiş kodu';
COMMENT ON COLUMN public.transactions.type IS 'İşlem türü: sale (satış), purchase (alış), return (iade), repair_payment (servis tahsilatı)';
COMMENT ON COLUMN public.transactions.payment_method IS 'Ödeme türü: cash, credit_card, bank_transfer, on_account, split';
COMMENT ON COLUMN public.transactions.net_amount IS 'İndirim sonrası nihai işlem tutarı';
COMMENT ON COLUMN public.transactions.paid_amount IS 'Kasa tarafından fiilen tahsil edilen tutar';

-- Kasa ve İşlemler İndeksleri
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON public.transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON public.transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON public.transactions(created_by);

-- İşlemler updated_at Tetikleyicisi
DROP TRIGGER IF EXISTS trigger_transactions_updated_at ON public.transactions;
CREATE TRIGGER trigger_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 3. İŞLEM DETAYLARI / KALEMLERİ (TRANSACTION_ITEMS) TABLOSU
-- ------------------------------------------------------------------------------
-- Bir işlemde satılan veya alınan ürünleri (IMEI, adet, birim fiyat) tutan ara tablo
CREATE TABLE IF NOT EXISTS public.transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    -- Telefon satışında veya alımında satılan cihazın IMEI numarası
    imei VARCHAR(15),
    -- Satılan / Alınan Adet
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    -- İşlem Anındaki Birim Fiyat (TL)
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
    -- Kalem Toplam Tutarı (quantity * unit_price)
    total_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_price >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- 15 haneli IMEI doğrulaması
    CONSTRAINT check_item_imei_format CHECK (imei IS NULL OR (length(imei) = 15 AND imei ~ '^[0-9]+$'))
);

-- Tablo ve Kolon Açıklamaları
COMMENT ON TABLE public.transaction_items IS 'İşlemlere bağlı ürün satırları ve satılan cihaz IMEI bilgisi';
COMMENT ON COLUMN public.transaction_items.imei IS 'Satılan veya alınan telefona ait 15 haneli IMEI numarası';
COMMENT ON COLUMN public.transaction_items.unit_price IS 'Satış anında uygulanan birim fiyat';

-- İşlem Kalemleri İndeksleri
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction_id ON public.transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product_id ON public.transaction_items(product_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_imei ON public.transaction_items(imei) WHERE imei IS NOT NULL;

-- ------------------------------------------------------------------------------
-- 4. KASA VE İŞLEMLER DETAYLI GÖRÜNÜMÜ (VIEW: v_transactions_summary)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_transactions_summary AS
SELECT 
    t.id,
    t.transaction_number,
    t.type,
    t.payment_method,
    t.total_amount,
    t.discount_amount,
    t.net_amount,
    t.paid_amount,
    t.status,
    t.customer_id,
    c.full_name AS customer_name,
    c.phone AS customer_phone,
    t.created_by,
    p.full_name AS staff_name,
    t.created_at,
    COUNT(ti.id) AS total_items,
    COALESCE(SUM(ti.quantity), 0) AS total_quantity
FROM public.transactions t
LEFT JOIN public.customers c ON t.customer_id = c.id
LEFT JOIN public.profiles p ON t.created_by = p.id
LEFT JOIN public.transaction_items ti ON t.id = ti.transaction_id
GROUP BY t.id, c.full_name, c.phone, p.full_name;

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ------------------------------------------------------------------------------
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- Okuma Politikaları (Giriş yapmış personeller müşterileri ve işlemleri görebilir)
DROP POLICY IF EXISTS "Giriş yapmış kullanıcılar müşterileri görebilir" ON public.customers;
CREATE POLICY "Giriş yapmış kullanıcılar müşterileri görebilir"
    ON public.customers FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Giriş yapmış kullanıcılar işlemleri görebilir" ON public.transactions;
CREATE POLICY "Giriş yapmış kullanıcılar işlemleri görebilir"
    ON public.transactions FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Giriş yapmış kullanıcılar işlem detaylarını görebilir" ON public.transaction_items;
CREATE POLICY "Giriş yapmış kullanıcılar işlem detaylarını görebilir"
    ON public.transaction_items FOR SELECT
    TO authenticated
    USING (true);

-- Ekleme / Güncelleme Politikaları (Personel ve Admin)
DROP POLICY IF EXISTS "Personel ve Admin müşteri ekleyip güncelleyebilir" ON public.customers;
CREATE POLICY "Personel ve Admin müşteri ekleyip güncelleyebilir"
    ON public.customers FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Personel ve Admin işlem ekleyip güncelleyebilir" ON public.transactions;
CREATE POLICY "Personel ve Admin işlem ekleyip güncelleyebilir"
    ON public.transactions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Personel ve Admin işlem kalemi ekleyip güncelleyebilir" ON public.transaction_items;
CREATE POLICY "Personel ve Admin işlem kalemi ekleyip güncelleyebilir"
    ON public.transaction_items FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 6. ÖRNEK MÜŞTERİ VE KASA İŞLEMLERİ (SEED DATA)
-- ------------------------------------------------------------------------------
-- Örnek Müşteriler
INSERT INTO public.customers (id, full_name, phone, email, identity_number, address, balance)
VALUES 
    ('c1111111-1111-1111-1111-111111111111', 'Ahmet Yılmaz', '05321112233', 'ahmet.yilmaz@example.com', '12345678901', 'Kadıköy, İstanbul', 0.00),
    ('c2222222-2222-2222-2222-222222222222', 'Fatma Kaya', '05423334455', 'fatma.kaya@example.com', '23456789012', 'Beşiktaş, İstanbul', 0.00),
    ('c3333333-3333-3333-3333-333333333333', 'Mehmet Öztürk', '05557778899', 'mehmet.ozturk@example.com', '34567890123', 'Çankaya, Ankara', -1200.00), -- 1200 TL veresiye borcu
    ('c4444444-4444-4444-4444-444444444444', 'Zeynep Çelik', '05059990011', 'zeynep.celik@example.com', '45678901234', 'Muratpaşa, Antalya', 500.00) -- 500 TL avansı/alacağı
ON CONFLICT (id) DO NOTHING;

-- Örnek Kasa İşlemleri (Satışlar ve Alımlar)
INSERT INTO public.transactions (id, transaction_number, customer_id, type, payment_method, total_amount, discount_amount, net_amount, paid_amount, status, notes)
VALUES
    -- 1. Ahmet Yılmaz'a iPhone 15 Pro Satışı (Kredi Kartı)
    (
        't1111111-1111-1111-1111-111111111111',
        'TRX-20260924-001',
        'c1111111-1111-1111-1111-111111111111',
        'sale',
        'credit_card',
        68000.00,
        1000.00,
        67000.00,
        67000.00,
        'completed',
        'iPhone 15 Pro 128GB satışı yapıldı, kampanya indirimi uygulandı.'
    ),
    -- 2. Fatma Kaya'ya Hızlı Aksesuar Satışı (Nakit)
    (
        't2222222-2222-2222-2222-222222222222',
        'TRX-20260924-002',
        'c2222222-2222-2222-2222-222222222222',
        'sale',
        'cash',
        1400.00,
        0.00,
        1400.00,
        1400.00,
        'completed',
        '20W USB-C Şarj Adaptörü ve Magsafe Kılıf satışı.'
    ),
    -- 3. Mehmet Öztürk'ten İkinci El Samsung Cihaz Alımı (Havale)
    (
        't3333333-3333-3333-3333-333333333333',
        'TRX-20260924-003',
        'c3333333-3333-3333-3333-333333333333',
        'purchase',
        'bank_transfer',
        42000.00,
        0.00,
        42000.00,
        42000.00,
        'completed',
        'İkinci el Samsung S24 Ultra takas/alım işlemi yapıldı.'
    ),
    -- 4. Zeynep Çelik'e Ekran Koruyucu Satışı (Nakit)
    (
        't4444444-4444-4444-4444-444444444444',
        'TRX-20260924-004',
        'c4444444-4444-4444-4444-444444444444',
        'sale',
        'cash',
        250.00,
        0.00,
        250.00,
        250.00,
        'completed',
        'Kırılmaz cam uygulama ve montaj dahil.'
    )
ON CONFLICT (id) DO NOTHING;

-- Örnek İşlem Kalemleri
INSERT INTO public.transaction_items (id, transaction_id, product_id, imei, quantity, unit_price, total_price, notes)
VALUES
    -- TRX-001: iPhone 15 Pro Satışı
    (
        'i1111111-1111-1111-1111-111111111111',
        't1111111-1111-1111-1111-111111111111',
        'd1111111-1111-1111-1111-111111111111',
        '354892110294812',
        1,
        68000.00,
        68000.00,
        'Siyah Titanyum renk'
    ),
    -- TRX-002: Apple 20W Adaptör
    (
        'i2222222-2222-2222-2222-222222222222',
        't2222222-2222-2222-2222-222222222222',
        'd3333333-3333-3333-3333-333333333333',
        NULL,
        1,
        850.00,
        850.00,
        'Orijinal Apple Türkiye'
    ),
    -- TRX-002: Silikon Kılıf
    (
        'i3333333-3333-3333-3333-333333333333',
        't2222222-2222-2222-2222-222222222222',
        'd4444444-4444-4444-4444-444444444444',
        NULL,
        1,
        550.00,
        550.00,
        'Gece Mavisi'
    ),
    -- TRX-003: İkinci el alım kalemi (Samsung S24 Ultra)
    (
        'i4444444-4444-4444-4444-444444444444',
        't3333333-3333-3333-3333-333333333333',
        'd2222222-2222-2222-2222-222222222222',
        '864920061928475',
        1,
        42000.00,
        42000.00,
        'İkinci el kozmetik durumu 9/10 kutulu'
    )
ON CONFLICT (id) DO NOTHING;
