-- ==============================================================================
-- 1. TELEFON MAĞAZASI YÖNETİM SİSTEMİ - KULLANICILAR VE ROLLER TABLOLARI (SUPABASE)
-- ==============================================================================

-- Gerekli eklentilerin etkinleştirildiğinden emin olalım
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ROLLER (ROLES) TABLOSU
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Açıklamalar
COMMENT ON TABLE public.roles IS 'Kullanıcı yetki seviyeleri (Admin, Personel vb.)';
COMMENT ON COLUMN public.roles.name IS 'Rol adı: Admin veya Personel';

-- ------------------------------------------------------------------------------
-- 2. KULLANICI PROFİLLERİ (PROFILES / USERS) TABLOSU
-- ------------------------------------------------------------------------------
-- Supabase auth.users tablosu ile 1:1 ilişkili genel profil tablosu
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

-- Açıklamalar
COMMENT ON TABLE public.profiles IS 'Kullanıcı profil ve yetki bilgileri tablosu';
COMMENT ON COLUMN public.profiles.id IS 'Supabase Auth User ID referansı';
COMMENT ON COLUMN public.profiles.role IS 'Hızlı erişim için rol adı (Admin / Personel)';

-- ------------------------------------------------------------------------------
-- 3. KULLANICILAR (USERS) GÖRÜNÜMÜ (VIEW)
-- ------------------------------------------------------------------------------
-- Kullanıcı ve rol detaylarını birleştiren hazır görünüm
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
-- 4. OTOMATİK ZAMAN DAMGASI (updated_at) TETİKLEYİCİSİ
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
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 5. VARSAYILAN ROLLERİN EKLENMESİ (SEED DATA)
-- ------------------------------------------------------------------------------
INSERT INTO public.roles (name, description)
VALUES 
    ('Admin', 'Sistem Yöneticisi - Tüm modüllere, ayarlara ve kullanıcı yönetimine tam erişim'),
    ('Personel', 'Mağaza Personeli - Satış, ürün listeleme, stok ve servis kabul yetkileri')
ON CONFLICT (name) DO UPDATE 
SET description = EXCLUDED.description;

-- ------------------------------------------------------------------------------
-- 6. AUTH.USERS YENİ KAYIT TETİKLEYİCİSİ (Otomatik Profil Oluşturma)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role_id UUID;
    user_role_name VARCHAR(50);
BEGIN
    -- Varsayılan olarak Personel rolünü bul
    SELECT id INTO default_role_id FROM public.roles WHERE name = 'Personel' LIMIT 1;
    
    -- Kullanıcı metadata'sında rol belirtilmişse onu kontrol et
    user_role_name := COALESCE(NEW.raw_user_meta_data->>'role', 'Personel');
    
    -- Eğer belirtilen rol varsa onun id'sini al
    SELECT id INTO default_role_id FROM public.roles WHERE name = user_role_name LIMIT 1;

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        phone,
        role_id,
        role,
        avatar_url,
        is_active
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

-- Auth kullanıcısı oluştuğunda profili otomatik oluşturan trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ------------------------------------------------------------------------------
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Roller Politikaları
CREATE POLICY "Roller herkes tarafından okunabilir"
    ON public.roles FOR SELECT
    TO authenticated
    USING (true);

-- Profil Politikaları
CREATE POLICY "Kullanıcılar tüm profilleri görüntüleyebilir"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Adminler tüm profilleri yönetebilir"
    ON public.profiles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'Admin'
        )
    );
