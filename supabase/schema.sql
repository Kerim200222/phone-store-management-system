-- ==============================================================================
-- TELEFON MAĞAZASI YÖNETİM SİSTEMİ - TÜM VERİTABANI ŞEMASI (SUPABASE SQL EDITOR)
-- ==============================================================================
-- Bu dosya Kullanıcılar, Roller, Kategoriler ve Ürünler tablolarını,
-- trigger'ları, RLS güvenlik politikalarını ve başlangıç verilerini tek seferde kurar.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ROLLER (ROLES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. KULLANICI PROFİLLERİ (PROFILES / USERS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    role VARCHAR(50) NOT NULL DEFAULT 'Personel',
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Kolay sorgulama için users görünümü
CREATE OR REPLACE VIEW public.users AS
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.phone,
    p.role_id,
    r.name AS role_name,
    r.description AS role_description,
    p.avatar_url,
    p.is_active,
    p.created_at,
    p.updated_at
FROM public.profiles p
LEFT JOIN public.roles r ON p.role_id = r.id;

-- ------------------------------------------------------------------------------
-- 3. KATEGORİLER (CATEGORIES)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 4. ÜRÜNLER (PRODUCTS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    barcode VARCHAR(100) UNIQUE,
    imei VARCHAR(15),
    condition VARCHAR(20) NOT NULL DEFAULT 'sıfır' CHECK (condition IN ('sıfır', 'ikinci el')),
    purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (purchase_price >= 0),
    sale_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (sale_price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    min_stock_level INTEGER NOT NULL DEFAULT 1 CHECK (min_stock_level >= 0),
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    CONSTRAINT check_imei_format CHECK (imei IS NULL OR (length(imei) = 15 AND imei ~ '^[0-9]+$'))
);

-- ------------------------------------------------------------------------------
-- 5. İNDEKSLER (INDEXES)
-- ------------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_imei_unique ON public.products(imei) WHERE imei IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_condition ON public.products(condition);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- ------------------------------------------------------------------------------
-- 6. TETİKLEYİCİLER (TRIGGERS)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_categories_updated_at ON public.categories;
CREATE TRIGGER trigger_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Otomatik profil oluşturucu fonksiyon
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id UUID;
    user_role_name VARCHAR(50);
BEGIN
    SELECT id INTO default_role_id FROM public.roles WHERE name = 'Personel' LIMIT 1;
    user_role_name := COALESCE(NEW.raw_user_meta_data->>'role', 'Personel');
    SELECT id INTO default_role_id FROM public.roles WHERE name = user_role_name LIMIT 1;

    INSERT INTO public.profiles (
        id, email, full_name, phone, role_id, role, avatar_url, is_active
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'phone',
        default_role_id,
        user_role_name,
        NEW.raw_user_meta_data->>'avatar_url',
        TRUE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ------------------------------------------------------------------------------
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Roller: Herkes okuyabilir
DROP POLICY IF EXISTS "Roller herkes tarafından okunabilir" ON public.roles;
CREATE POLICY "Roller herkes tarafından okunabilir" ON public.roles FOR SELECT TO authenticated USING (true);

-- Profiller
DROP POLICY IF EXISTS "Kullanıcılar tüm profilleri görüntüleyebilir" ON public.profiles;
CREATE POLICY "Kullanıcılar tüm profilleri görüntüleyebilir" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Kullanıcılar kendi profillerini güncelleyebilir" ON public.profiles;
CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Adminler tüm profilleri yönetebilir" ON public.profiles;
CREATE POLICY "Adminler tüm profilleri yönetebilir" ON public.profiles FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));

-- Kategoriler
DROP POLICY IF EXISTS "Kategoriler tüm kullanıcılar tarafından görüntülenebilir" ON public.categories;
CREATE POLICY "Kategoriler tüm kullanıcılar tarafından görüntülenebilir" ON public.categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Sadece Admin kategorileri değiştirebilir" ON public.categories;
CREATE POLICY "Sadece Admin kategorileri değiştirebilir" ON public.categories FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));

-- Ürünler
DROP POLICY IF EXISTS "Ürünler tüm kullanıcılar tarafından görüntülenebilir" ON public.products;
CREATE POLICY "Ürünler tüm kullanıcılar tarafından görüntülenebilir" ON public.products FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Yetkili kullanıcılar ürün ekleyebilir ve güncelleyebilir" ON public.products;
CREATE POLICY "Yetkili kullanıcılar ürün ekleyebilir ve güncelleyebilir" ON public.products FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Personel')));

DROP POLICY IF EXISTS "Yetkili kullanıcılar ürün güncelleyebilir" ON public.products;
CREATE POLICY "Yetkili kullanıcılar ürün güncelleyebilir" ON public.products FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Personel')));

DROP POLICY IF EXISTS "Sadece Admin ürün silebilir" ON public.products;
CREATE POLICY "Sadece Admin ürün silebilir" ON public.products FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));

-- ------------------------------------------------------------------------------
-- 8. BAŞLANGIÇ VERİLERİ (SEED)
-- ------------------------------------------------------------------------------
INSERT INTO public.roles (name, description) VALUES 
    ('Admin', 'Sistem Yöneticisi - Tüm modüllere, ayarlara ve kullanıcı yönetimine tam erişim'),
    ('Personel', 'Mağaza Personeli - Satış, ürün listeleme, stok ve servis kabul yetkileri')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO public.categories (name, slug, description) VALUES
    ('Telefon', 'telefon', 'Akıllı telefonlar, tuşlu cihazlar (Sıfır ve İkinci El)'),
    ('Aksesuar', 'aksesuar', 'Kılıf, kırılmaz cam ekran koruyucu, şarj aleti, kablo, kulaklık vb.'),
    ('Yedek Parça', 'yedek-parca', 'Ekran panelleri, bataryalar, şarj soketleri, kamera modülleri vb.')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

DO $$
DECLARE
    cat_phone UUID;
    cat_accessory UUID;
    cat_part UUID;
BEGIN
    SELECT id INTO cat_phone FROM public.categories WHERE slug = 'telefon';
    SELECT id INTO cat_accessory FROM public.categories WHERE slug = 'aksesuar';
    SELECT id INTO cat_part FROM public.categories WHERE slug = 'yedek-parca';

    INSERT INTO public.products (category_id, name, brand, model, barcode, imei, condition, purchase_price, sale_price, stock_quantity, min_stock_level, description)
    VALUES (cat_phone, 'Apple iPhone 15 Pro 128GB Naturel Titanyum', 'Apple', 'iPhone 15 Pro', '195949038241', '354892091234567', 'sıfır', 64500.00, 74999.00, 3, 1, '2 Yıl Apple Türkiye Garantili Sıfır Kapalı Kutu Cihaz')
    ON CONFLICT (barcode) DO NOTHING;

    INSERT INTO public.products (category_id, name, brand, model, barcode, imei, condition, purchase_price, sale_price, stock_quantity, min_stock_level, description)
    VALUES (cat_phone, 'Samsung Galaxy S23 Ultra 256GB Siyah (2. El)', 'Samsung', 'Galaxy S23 Ultra', '8806094772814', '359876098765432', 'ikinci el', 34000.00, 42500.00, 1, 1, 'Temiz kullanılmış, kozmetik 9.5/10, kutulu ve faturalı 2. el cihaz')
    ON CONFLICT (barcode) DO NOTHING;

    INSERT INTO public.products (category_id, name, brand, model, barcode, condition, purchase_price, sale_price, stock_quantity, min_stock_level, description)
    VALUES (cat_accessory, 'Apple 20W USB-C Güç Adaptörü (Hızlı Şarj)', 'Apple', 'MHJE3TU/A', '194252157015', 'sıfır', 520.00, 849.00, 45, 5, 'Orijinal Apple Türkiye garantili hızlı şarj başlığı')
    ON CONFLICT (barcode) DO NOTHING;

    INSERT INTO public.products (category_id, name, brand, model, barcode, condition, purchase_price, sale_price, stock_quantity, min_stock_level, description)
    VALUES (cat_part, 'iPhone 11 Orijinal Kalite GX OLED Ekran', 'Apple Uyumlu', 'iPhone 11', '8680001122334', 'sıfır', 1100.00, 1950.00, 12, 3, 'Teknik servis montajına hazır dokunmatik entegreli ekran paneli')
    ON CONFLICT (barcode) DO NOTHING;
END $$;
