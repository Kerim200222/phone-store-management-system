-- ==============================================================================
-- 2. TELEFON MAĞAZASI YÖNETİM SİSTEMİ - KATEGORİLER VE ÜRÜNLER (SUPABASE)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. KATEGORİLER (CATEGORIES) TABLOSU
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Açıklamalar
COMMENT ON TABLE public.categories IS 'Ürün kategorileri (Telefon, Aksesuar, Yedek Parça vb.)';
COMMENT ON COLUMN public.categories.name IS 'Kategori adı';
COMMENT ON COLUMN public.categories.slug IS 'URL veya sistem içi aramalara uygun slug';

-- ------------------------------------------------------------------------------
-- 2. ÜRÜNLER (PRODUCTS) TABLOSU
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    barcode VARCHAR(100) UNIQUE,
    -- Telefonlar için benzersiz 15 haneli IMEI numarası (Aksesuar vb. için NULL olabilir)
    imei VARCHAR(15),
    -- Durum: sıfır veya ikinci el
    condition VARCHAR(20) NOT NULL DEFAULT 'sıfır' CHECK (condition IN ('sıfır', 'ikinci el')),
    -- Alış Fiyatı (TL)
    purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (purchase_price >= 0),
    -- Satış Fiyatı (TL)
    sale_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (sale_price >= 0),
    -- Stok Adedi
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    -- Kritik Stok Seviyesi Bildirimi İçin
    min_stock_level INTEGER NOT NULL DEFAULT 1 CHECK (min_stock_level >= 0),
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- IMEI girildiyse 15 haneli sayısal format doğrulaması
    CONSTRAINT check_imei_format CHECK (imei IS NULL OR (length(imei) = 15 AND imei ~ '^[0-9]+$'))
);

-- Açıklamalar
COMMENT ON TABLE public.products IS 'Telefon mağazası envanter ve ürün tablosu';
COMMENT ON COLUMN public.products.imei IS 'Telefon cihazlarına özel 15 haneli benzersiz IMEI numarası';
COMMENT ON COLUMN public.products.condition IS 'Cihaz kondisyon durumu: sıfır veya ikinci el';
COMMENT ON COLUMN public.products.purchase_price IS 'Ürünün maliyet/alış fiyatı (TL)';
COMMENT ON COLUMN public.products.sale_price IS 'Ürünün mağaza satış fiyatı (TL)';
COMMENT ON COLUMN public.products.stock_quantity IS 'Mevcut stok adedi';

-- ------------------------------------------------------------------------------
-- 3. PERFORMANS VE TEKİLLİK İNDEKSLERİ (INDEXES)
-- ------------------------------------------------------------------------------
-- IMEI NULL olmayan telefonlar için tekillik (UNIQUE) güvencesi
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_imei_unique 
    ON public.products(imei) 
    WHERE imei IS NOT NULL;

-- Hızlı barkod okuyucu sorguları için indeks
CREATE INDEX IF NOT EXISTS idx_products_barcode 
    ON public.products(barcode) 
    WHERE barcode IS NOT NULL;

-- Kategoriye göre listeleme ve filtreleme
CREATE INDEX IF NOT EXISTS idx_products_category_id 
    ON public.products(category_id);

-- Marka, durum ve aktiflik filtreleri
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_condition ON public.products(condition);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- ------------------------------------------------------------------------------
-- 4. OTOMATİK ZAMAN DAMGASI (updated_at) TETİKLEYİCİLERİ
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trigger_categories_updated_at ON public.categories;
CREATE TRIGGER trigger_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 5. KATEGORİ SEED VERİLERİ (Telefon, Aksesuar, Yedek Parça)
-- ------------------------------------------------------------------------------
INSERT INTO public.categories (name, slug, description)
VALUES
    ('Telefon', 'telefon', 'Akıllı telefonlar, tuşlu cihazlar (Sıfır ve İkinci El)'),
    ('Aksesuar', 'aksesuar', 'Kılıf, kırılmaz cam ekran koruyucu, şarj aleti, kablo, kulaklık vb.'),
    ('Yedek Parça', 'yedek-parca', 'Ekran panelleri, bataryalar, şarj soketleri, kamera modülleri vb.')
ON CONFLICT (name) DO UPDATE 
SET description = EXCLUDED.description;

-- ------------------------------------------------------------------------------
-- 6. ÖRNEK ÜRÜN SEED VERİLERİ (TEST & BAŞLANGIÇ)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    cat_phone UUID;
    cat_accessory UUID;
    cat_part UUID;
BEGIN
    SELECT id INTO cat_phone FROM public.categories WHERE slug = 'telefon';
    SELECT id INTO cat_accessory FROM public.categories WHERE slug = 'aksesuar';
    SELECT id INTO cat_part FROM public.categories WHERE slug = 'yedek-parca';

    -- 1. Sıfır Telefon Örneği (IMEI ile)
    INSERT INTO public.products (
        category_id, name, brand, model, barcode, imei, condition, purchase_price, sale_price, stock_quantity, min_stock_level, description
    ) VALUES (
        cat_phone,
        'Apple iPhone 15 Pro 128GB Naturel Titanyum',
        'Apple',
        'iPhone 15 Pro',
        '195949038241',
        '354892091234567',
        'sıfır',
        64500.00,
        74999.00,
        3,
        1,
        '2 Yıl Apple Türkiye Garantili Sıfır Kapalı Kutu Cihaz'
    ) ON CONFLICT (barcode) DO NOTHING;

    -- 2. İkinci El Telefon Örneği (IMEI ile)
    INSERT INTO public.products (
        category_id, name, brand, model, barcode, imei, condition, purchase_price, sale_price, stock_quantity, min_stock_level, description
    ) VALUES (
        cat_phone,
        'Samsung Galaxy S23 Ultra 256GB Siyah (2. El)',
        'Samsung',
        'Galaxy S23 Ultra',
        '8806094772814',
        '359876098765432',
        'ikinci el',
        34000.00,
        42500.00,
        1,
        1,
        'Temiz kullanılmış, kozmetik 9.5/10, kutulu ve faturalı 2. el cihaz'
    ) ON CONFLICT (barcode) DO NOTHING;

    -- 3. Aksesuar Örneği
    INSERT INTO public.products (
        category_id, name, brand, model, barcode, condition, purchase_price, sale_price, stock_quantity, min_stock_level, description
    ) VALUES (
        cat_accessory,
        'Apple 20W USB-C Güç Adaptörü (Hızlı Şarj)',
        'Apple',
        'MHJE3TU/A',
        '194252157015',
        'sıfır',
        520.00,
        849.00,
        45,
        5,
        'Orijinal Apple Türkiye garantili hızlı şarj başlığı'
    ) ON CONFLICT (barcode) DO NOTHING;

    -- 4. Yedek Parça Örneği
    INSERT INTO public.products (
        category_id, name, brand, model, barcode, condition, purchase_price, sale_price, stock_quantity, min_stock_level, description
    ) VALUES (
        cat_part,
        'iPhone 11 Orijinal Kalite GX OLED Ekran',
        'Apple Uyumlu',
        'iPhone 11',
        '8680001122334',
        'sıfır',
        1100.00,
        1950.00,
        12,
        3,
        'Teknik servis montajına hazır dokunmatik entegreli ekran paneli'
    ) ON CONFLICT (barcode) DO NOTHING;
END $$;

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ------------------------------------------------------------------------------
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Kategoriler Okuma Politikası
CREATE POLICY "Kategoriler tüm kullanıcılar tarafından görüntülenebilir"
    ON public.categories FOR SELECT
    TO authenticated
    USING (true);

-- Kategoriler Yazma Politikası (Sadece Admin)
CREATE POLICY "Sadece Admin kategorileri değiştirebilir"
    ON public.categories FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'Admin'
        )
    );

-- Ürünler Okuma Politikası
CREATE POLICY "Ürünler tüm kullanıcılar tarafından görüntülenebilir"
    ON public.products FOR SELECT
    TO authenticated
    USING (true);

-- Ürünler Ekleme ve Güncelleme Politikası (Admin ve Personel)
CREATE POLICY "Yetkili kullanıcılar ürün ekleyebilir ve güncelleyebilir"
    ON public.products FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('Admin', 'Personel')
        )
    );

CREATE POLICY "Yetkili kullanıcılar ürün güncelleyebilir"
    ON public.products FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('Admin', 'Personel')
        )
    );

-- Ürünler Silme Politikası (Sadece Admin)
CREATE POLICY "Sadece Admin ürün silebilir"
    ON public.products FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'Admin'
        )
    );
