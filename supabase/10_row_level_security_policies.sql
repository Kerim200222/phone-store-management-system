-- ==============================================================================
-- 10. TELEFON MAĞAZASI YÖNETİM SİSTEMİ - SUPABASE ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- Hafta 7: Güvenlik, Test ve Canlıya Alma (Launch)
-- Gün 31: Supabase RLS (Satır Bazlı Güvenlik) Politikaları
-- ==============================================================================
-- Bu migration; veritabanı güvenliğini üretim (production) seviyesine taşımak için:
-- 1. Tüm tablolarda Row Level Security (RLS) ve FORCE ROW LEVEL SECURITY'yi zorunlu kılar.
-- 2. 'anon' (anonim / oturum açmamış) kullanıcıların hassas iş verilerine erişimini tamamen engeller.
-- 3. 'authenticated' (oturum açmış) kullanıcılar için rol bazlı (Admin / Personel) güvenli yetkilendirme sağlar.
-- 4. Güvenlik yardımcı fonksiyonları (is_admin, is_active_staff) ile SQL enjeksiyonu ve yetki atlatmalarını önler.
-- ==============================================================================

-- Gerekli eklentilerin devrede olduğundan emin olalım
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. GÜVENLİK YARDIMCI FONKSİYONLARI (SECURITY DEFINER FUNCTIONS)
-- ------------------------------------------------------------------------------
-- Not: Sonsuz döngü (infinite recursion) ve arama yolu enjeksiyonunu engellemek için
-- SECURITY DEFINER ve SET search_path = public kullanılmaktadır.

-- 1.1 Mevcut kullanıcının Sistem Yöneticisi (Admin) olup olmadığını doğrular
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    current_role VARCHAR(50);
BEGIN
    -- Oturum açmamışsa anında reddet
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Profiles tablosundan aktif kullanıcı rolünü sorgula
    SELECT p.role INTO current_role
    FROM public.profiles p
    WHERE p.id = auth.uid() AND p.is_active = TRUE
    LIMIT 1;

    RETURN (current_role = 'Admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.is_admin() IS 'Oturum açan kullanıcının aktif bir Admin olup olmadığını doğrular.';

-- 1.2 Mevcut kullanıcının aktif bir mağaza personeli (Admin veya Personel) olduğunu doğrular
CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS BOOLEAN AS $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT EXISTS (
        SELECT 1 
        FROM public.profiles p
        WHERE p.id = auth.uid() 
          AND p.is_active = TRUE 
          AND p.role IN ('Admin', 'Personel')
    ) INTO user_exists;

    RETURN user_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.is_active_staff() IS 'Oturum açan kullanıcının aktif ve yetkili mağaza personeli olduğunu doğrular.';

-- 1.3 Mevcut kullanıcının rol adını döner
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS VARCHAR(50) AS $$
DECLARE
    user_role VARCHAR(50);
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN 'anon';
    END IF;

    SELECT p.role INTO user_role
    FROM public.profiles p
    WHERE p.id = auth.uid() AND p.is_active = TRUE
    LIMIT 1;

    RETURN COALESCE(user_role, 'unassigned');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.current_user_role() IS 'Oturum açan kullanıcının güncel yetki rol adını döndürür.';


-- ------------------------------------------------------------------------------
-- 2. TÜM TABLOLARDA RLS'İ AKTİF ETME VE ZORUNLU KILMA (ENABLE & FORCE RLS)
-- ------------------------------------------------------------------------------
-- FORCE ROW LEVEL SECURITY: Tablo sahibi dahi olsa politikaların zorunlu çalışmasını sağlar.

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories FORCE ROW LEVEL SECURITY;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products FORCE ROW LEVEL SECURITY;

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers FORCE ROW LEVEL SECURITY;

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items FORCE ROW LEVEL SECURITY;

ALTER TABLE public.repair_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_tickets FORCE ROW LEVEL SECURITY;

ALTER TABLE public.repair_ticket_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_ticket_parts FORCE ROW LEVEL SECURITY;


-- ------------------------------------------------------------------------------
-- 3. ESKİ VEYA GEVŞEK POLİTİKALARI TEMİZLEME
-- ------------------------------------------------------------------------------
-- 3.1 Roles
DROP POLICY IF EXISTS "Roller herkes tarafından okunabilir" ON public.roles;
DROP POLICY IF EXISTS "roles_select_policy" ON public.roles;
DROP POLICY IF EXISTS "roles_admin_manage" ON public.roles;

-- 3.2 Profiles
DROP POLICY IF EXISTS "Kullanıcılar tüm profilleri görüntüleyebilir" ON public.profiles;
DROP POLICY IF EXISTS "Kullanıcılar kendi profillerini güncelleyebilir" ON public.profiles;
DROP POLICY IF EXISTS "Adminler tüm profilleri yönetebilir" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

-- 3.3 Categories
DROP POLICY IF EXISTS "Kategoriler tüm kullanıcılar tarafından görüntülenebilir" ON public.categories;
DROP POLICY IF EXISTS "Sadece Admin kategorileri değiştirebilir" ON public.categories;
DROP POLICY IF EXISTS "categories_select_authenticated" ON public.categories;
DROP POLICY IF EXISTS "categories_admin_manage" ON public.categories;

-- 3.4 Products
DROP POLICY IF EXISTS "Ürünler tüm kullanıcılar tarafından görüntülenebilir" ON public.products;
DROP POLICY IF EXISTS "Yetkili kullanıcılar ürün ekleyebilir ve güncelleyebilir" ON public.products;
DROP POLICY IF EXISTS "Yetkili kullanıcılar ürün güncelleyebilir" ON public.products;
DROP POLICY IF EXISTS "Sadece Admin ürün silebilir" ON public.products;
DROP POLICY IF EXISTS "products_select_authenticated" ON public.products;
DROP POLICY IF EXISTS "products_insert_staff" ON public.products;
DROP POLICY IF EXISTS "products_update_staff" ON public.products;
DROP POLICY IF EXISTS "products_delete_admin" ON public.products;

-- 3.5 Customers
DROP POLICY IF EXISTS "Yetkili kullanıcılar müşterileri görebilir" ON public.customers;
DROP POLICY IF EXISTS "Yetkili kullanıcılar müşteri yönetebilir" ON public.customers;
DROP POLICY IF EXISTS "customers_select_staff" ON public.customers;
DROP POLICY IF EXISTS "customers_manage_staff" ON public.customers;

-- 3.6 Transactions & Items
DROP POLICY IF EXISTS "Yetkili kullanıcılar işlemleri görebilir" ON public.transactions;
DROP POLICY IF EXISTS "Yetkili kullanıcılar işlem yönetebilir" ON public.transactions;
DROP POLICY IF EXISTS "transactions_select_staff" ON public.transactions;
DROP POLICY IF EXISTS "transactions_manage_staff" ON public.transactions;

DROP POLICY IF EXISTS "Yetkili kullanıcılar işlem detaylarını görebilir" ON public.transaction_items;
DROP POLICY IF EXISTS "Yetkili kullanıcılar işlem detayları yönetebilir" ON public.transaction_items;
DROP POLICY IF EXISTS "transaction_items_select_staff" ON public.transaction_items;
DROP POLICY IF EXISTS "transaction_items_manage_staff" ON public.transaction_items;

-- 3.7 Repair Tickets & Parts
DROP POLICY IF EXISTS "Yetkili kullanıcılar servis kayıtlarını görebilir" ON public.repair_tickets;
DROP POLICY IF EXISTS "Yetkili kullanıcılar servis kayıtlarını yönetebilir" ON public.repair_tickets;
DROP POLICY IF EXISTS "repair_tickets_select_staff" ON public.repair_tickets;
DROP POLICY IF EXISTS "repair_tickets_manage_staff" ON public.repair_tickets;

DROP POLICY IF EXISTS "Yetkili kullanıcılar servis parçalarını görebilir" ON public.repair_ticket_parts;
DROP POLICY IF EXISTS "Yetkili kullanıcılar servis parçalarını yönetebilir" ON public.repair_ticket_parts;
DROP POLICY IF EXISTS "repair_ticket_parts_select_staff" ON public.repair_ticket_parts;
DROP POLICY IF EXISTS "repair_ticket_parts_manage_staff" ON public.repair_ticket_parts;


-- ------------------------------------------------------------------------------
-- 4. ÜRETİM DÜZEYİ (PRODUCTION-GRADE) RLS POLİTİKALARI
-- ------------------------------------------------------------------------------

-- ==============================================================================
-- TABLO 1: ROLES (Roller)
-- ==============================================================================
-- SELECT: Yalnızca oturum açmış aktif personel roller listesini okuyabilir.
CREATE POLICY "roles_select_authenticated"
    ON public.roles FOR SELECT
    TO authenticated
    USING (public.is_active_staff());

-- INSERT / UPDATE / DELETE: Yalnızca Sistem Yöneticisi yeni rol tanımlayabilir veya düzenleyebilir.
CREATE POLICY "roles_admin_manage"
    ON public.roles FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- ==============================================================================
-- TABLO 2: PROFILES (Kullanıcı Profilleri)
-- ==============================================================================
-- SELECT: Oturum açmış aktif kullanıcılar çalışma arkadaşlarının profil bilgilerini görebilir.
CREATE POLICY "profiles_select_authenticated"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (public.is_active_staff());

-- UPDATE (Kendi Profili): Kullanıcı kendi adını, telefonunu, avatarını güncelleyebilir.
-- Güvenlik Koruması: Kendi rolünü (role veya role_id) yükseltemez, bunu sadece Admin yapabilir.
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id AND public.is_active_staff())
    WITH CHECK (
        auth.uid() = id 
        AND (
            public.is_admin() 
            OR (
                role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
                AND role_id = (SELECT p.role_id FROM public.profiles p WHERE p.id = auth.uid())
                AND is_active = TRUE
            )
        )
    );

-- INSERT / UPDATE / DELETE (Admin): Sistem Yöneticisi tüm personelleri yönetebilir.
CREATE POLICY "profiles_admin_all"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- ==============================================================================
-- TABLO 3: CATEGORIES (Kategoriler)
-- ==============================================================================
-- SELECT: Oturum açmış aktif personel kategorileri görebilir (Ürün listeleme ve filtreleme).
CREATE POLICY "categories_select_authenticated"
    ON public.categories FOR SELECT
    TO authenticated
    USING (public.is_active_staff());

-- INSERT / UPDATE / DELETE: Kategori oluşturma ve silme işlemi yalnızca Yöneticiye aittir.
CREATE POLICY "categories_admin_manage"
    ON public.categories FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- ==============================================================================
-- TABLO 4: PRODUCTS (Ürünler ve Stoklar)
-- ==============================================================================
-- SELECT: Oturum açmış personel tüm envanteri, sıfır ve 2. el cihazları görebilir.
CREATE POLICY "products_select_authenticated"
    ON public.products FOR SELECT
    TO authenticated
    USING (public.is_active_staff());

-- INSERT: Yetkili personel ve Admin yeni ürün veya 2. el cihaz kaydı açabilir.
CREATE POLICY "products_insert_staff"
    ON public.products FOR INSERT
    TO authenticated
    WITH CHECK (public.is_active_staff());

-- UPDATE: Personel satış sonrası stok düşümü, fiyat ve açıklama güncelleyebilir.
CREATE POLICY "products_update_staff"
    ON public.products FOR UPDATE
    TO authenticated
    USING (public.is_active_staff())
    WITH CHECK (public.is_active_staff());

-- DELETE: Kritik envanter kayıplarını ve suiistimalleri önlemek için silme YALNIZCA Admin yetkisindedir.
CREATE POLICY "products_delete_admin"
    ON public.products FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- ==============================================================================
-- TABLO 5: CUSTOMERS (Müşteriler)
-- ==============================================================================
-- SELECT: Oturum açmış personel müşteri rehberini arayabilir ve görüntüleyebilir.
CREATE POLICY "customers_select_staff"
    ON public.customers FOR SELECT
    TO authenticated
    USING (public.is_active_staff());

-- INSERT: Satış veya teknik servis kabulü sırasında yeni müşteri eklenebilir.
CREATE POLICY "customers_insert_staff"
    ON public.customers FOR INSERT
    TO authenticated
    WITH CHECK (public.is_active_staff());

-- UPDATE: Müşteri telefon, adres veya bakiye bilgileri güncellenebilir.
CREATE POLICY "customers_update_staff"
    ON public.customers FOR UPDATE
    TO authenticated
    USING (public.is_active_staff())
    WITH CHECK (public.is_active_staff());

-- DELETE: Müşteri verisi silme YALNIZCA Admin yetkisindedir.
CREATE POLICY "customers_delete_admin"
    ON public.customers FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- ==============================================================================
-- TABLO 6: TRANSACTIONS (Kasa ve Finansal Hareketler)
-- ==============================================================================
-- SELECT: Oturum açmış personel satış, alış ve servis tahsilat kayıtlarını görebilir.
CREATE POLICY "transactions_select_staff"
    ON public.transactions FOR SELECT
    TO authenticated
    USING (public.is_active_staff());

-- INSERT: Personel POS satışı veya 2. el cihaz alım işlemi oluşturabilir.
CREATE POLICY "transactions_insert_staff"
    ON public.transactions FOR INSERT
    TO authenticated
    WITH CHECK (public.is_active_staff());

-- UPDATE: İptal / iade işlemleri veya ödeme durumu güncellemeleri.
CREATE POLICY "transactions_update_staff"
    ON public.transactions FOR UPDATE
    TO authenticated
    USING (public.is_active_staff())
    WITH CHECK (public.is_active_staff());

-- DELETE: Kasa kayıtlarının silinmesi mali denetim ve audit log bütünlüğü için YALNIZCA Admin tarafından yapılabilir.
CREATE POLICY "transactions_delete_admin"
    ON public.transactions FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- ==============================================================================
-- TABLO 7: TRANSACTION_ITEMS (İşlem Sepet Kalemleri)
-- ==============================================================================
-- SELECT: İlgili işlem detayları okunabilir.
CREATE POLICY "transaction_items_select_staff"
    ON public.transaction_items FOR SELECT
    TO authenticated
    USING (public.is_active_staff());

-- INSERT: İşlem kalemi eklenebilir.
CREATE POLICY "transaction_items_insert_staff"
    ON public.transaction_items FOR INSERT
    TO authenticated
    WITH CHECK (public.is_active_staff());

-- UPDATE: Satış kalemi düzenleme.
CREATE POLICY "transaction_items_update_staff"
    ON public.transaction_items FOR UPDATE
    TO authenticated
    USING (public.is_active_staff())
    WITH CHECK (public.is_active_staff());

-- DELETE: Yalnızca Admin finansal kalem silebilir.
CREATE POLICY "transaction_items_delete_admin"
    ON public.transaction_items FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- ==============================================================================
-- TABLO 8: REPAIR_TICKETS (Teknik Servis Cihaz Kayıtları)
-- ==============================================================================
-- SELECT: Tüm servis kayıtları personel tarafından görüntülenebilir ve aranabilir.
CREATE POLICY "repair_tickets_select_staff"
    ON public.repair_tickets FOR SELECT
    TO authenticated
    USING (public.is_active_staff());

-- INSERT: Yeni servis fişi oluşturma (arıza kabul).
CREATE POLICY "repair_tickets_insert_staff"
    ON public.repair_tickets FOR INSERT
    TO authenticated
    WITH CHECK (public.is_active_staff());

-- UPDATE: Teknisyen teşhisi, durum değişikliği, maliyet ve parça güncelleme.
CREATE POLICY "repair_tickets_update_staff"
    ON public.repair_tickets FOR UPDATE
    TO authenticated
    USING (public.is_active_staff())
    WITH CHECK (public.is_active_staff());

-- DELETE: Müşteriye ait servis fişlerinin silinmesi YALNIZCA Admin yetkisindedir.
CREATE POLICY "repair_tickets_delete_admin"
    ON public.repair_tickets FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- ==============================================================================
-- TABLO 9: REPAIR_TICKET_PARTS (Serviste Kullanılan Yedek Parçalar)
-- ==============================================================================
-- SELECT: Servis parça detayları okunabilir.
CREATE POLICY "repair_ticket_parts_select_staff"
    ON public.repair_ticket_parts FOR SELECT
    TO authenticated
    USING (public.is_active_staff());

-- INSERT: Teknisyen tamirde kullanılan yeni parçayı ekleyebilir.
CREATE POLICY "repair_ticket_parts_insert_staff"
    ON public.repair_ticket_parts FOR INSERT
    TO authenticated
    WITH CHECK (public.is_active_staff());

-- UPDATE: Parça adedi ve birim fiyatı güncellenebilir.
CREATE POLICY "repair_ticket_parts_update_staff"
    ON public.repair_ticket_parts FOR UPDATE
    TO authenticated
    USING (public.is_active_staff())
    WITH CHECK (public.is_active_staff());

-- DELETE: Yalnızca Admin yedek parça kaydını silebilir.
CREATE POLICY "repair_ticket_parts_delete_admin"
    ON public.repair_ticket_parts FOR DELETE
    TO authenticated
    USING (public.is_admin());


-- ------------------------------------------------------------------------------
-- 5. DEPOLAMA (SUPABASE STORAGE) ÜRÜN GÖRSELLERİ RLS POLİTİKALARI KONTROLÜ
-- ------------------------------------------------------------------------------
-- storage.objects üzerinde 'product-images' kovası için:
-- 1. Genel (anon & authenticated): Okuma serbesttir (Public CDN).
-- 2. Yükleme, Değiştirme, Silme: Yalnızca oturum açmış yetkili personele aittir.

DO $$
BEGIN
    -- Eğer storage.objects mevcutsa politikaları güçlendir
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'storage' AND table_name = 'objects'
    ) THEN
        -- Anonim yazma izinlerini kaldır
        DROP POLICY IF EXISTS "Yetkili Personel Ürün Görseli Yükleyebilir" ON storage.objects;
        DROP POLICY IF EXISTS "Yetkili Personel Ürün Görseli Güncelleyebilir" ON storage.objects;
        DROP POLICY IF EXISTS "Yetkili Personel Ürün Görsellerini Silebilir" ON storage.objects;

        -- Yalnızca authenticated kullanıcılar görsel yükleyebilir
        CREATE POLICY "Yetkili Personel Ürün Görseli Yükleyebilir"
            ON storage.objects FOR INSERT
            TO authenticated
            WITH CHECK (bucket_id = 'product-images');

        -- Yalnızca authenticated kullanıcılar görsel güncelleyebilir
        CREATE POLICY "Yetkili Personel Ürün Görseli Güncelleyebilir"
            ON storage.objects FOR UPDATE
            TO authenticated
            USING (bucket_id = 'product-images')
            WITH CHECK (bucket_id = 'product-images');

        -- Yalnızca Admin veya authenticated kullanıcı görsel silebilir
        CREATE POLICY "Yetkili Personel Ürün Görsellerini Silebilir"
            ON storage.objects FOR DELETE
            TO authenticated
            USING (bucket_id = 'product-images');
    END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 6. GÜVENLİK DENETİM VE DOĞRULAMA GÖRÜNÜMÜ (SECURITY AUDIT VIEW)
-- ------------------------------------------------------------------------------
-- Sistem Yöneticisi için tüm tablolardaki RLS durumunu raporlayan görünüm
CREATE OR REPLACE VIEW public.v_rls_security_status AS
SELECT 
    c.relname AS table_name,
    c.relrowsecurity AS rls_enabled,
    c.relforcerowsecurity AS rls_forced,
    (
        SELECT count(*) 
        FROM pg_policy p 
        WHERE p.polrelid = c.oid
    ) AS active_policy_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relkind = 'r'
  AND c.relname IN (
    'roles', 
    'profiles', 
    'categories', 
    'products', 
    'customers', 
    'transactions', 
    'transaction_items', 
    'repair_tickets', 
    'repair_ticket_parts'
  )
ORDER BY c.relname ASC;

COMMENT ON VIEW public.v_rls_security_status IS 'Tüm temel tablolardaki RLS aktiflik ve politika sayılarını özetleyen güvenlik denetim görünümü.';

-- Görünüm için de RLS koruması: Sadece Admin ve yetkili personel sorgulayabilir
GRANT SELECT ON public.v_rls_security_status TO authenticated;
REVOKE SELECT ON public.v_rls_security_status FROM anon;
