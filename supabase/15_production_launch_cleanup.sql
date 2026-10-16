-- ==============================================================================
-- 15. TELEFON MAĞAZASI YÖNETİM SİSTEMİ - PRODUCTION VERİTABANI TEMİZLEME VE HAZIRLIK
-- ==============================================================================
-- Açıklama:
-- Bu script, geliştirme ve test sürecinde oluşturulan tüm sahte/mock verileri temizler.
-- Canlıya (Production) çıkış öncesinde veritabanını sıfırlayarak sadece temel referans
-- verilerini (Kategoriler, Roller) ve 1 adet yetkili 'SuperAdmin' hesabını bırakır.
-- 
-- Güvenlik Önlemleri:
-- 1. Tüm işlemler tek bir TRANSACTION (BEGIN ... COMMIT) bloğunda yürütülür.
-- 2. Foreign Key kısıtlamalarına uygun hiyerarşik silme sırası izlenir.
-- 3. Yetkili SuperAdmin hesabı silinmeye karşı korunur, yoksa oluşturulur.
-- 4. RLS (Row Level Security) kuralları teyit edilir.
-- ==============================================================================

BEGIN;

-- 1. Bildirim ve Başlangıç Bilgisi
DO $$
BEGIN
    RAISE NOTICE '>>> [PRODUCTION CLEANUP] Veritabanı temizleme ve canlıya hazırlık işlemi başlatılıyor...';
END $$;

-- ------------------------------------------------------------------------------
-- 2. BAĞIMLI TABLOLARIN VE TEST HAREKETLERİNİN TEMİZLENMESİ
-- ------------------------------------------------------------------------------

-- A. Teknik Servis Parça Kullanım Kayıtları
DELETE FROM public.repair_ticket_parts;
RAISE NOTICE '✓ [repair_ticket_parts] tablosundaki tüm test parça kayıtları silindi.';

-- B. Teknik Servis Biletleri
DELETE FROM public.repair_tickets;
RAISE NOTICE '✓ [repair_tickets] tablosundaki tüm test servis kayıtları silindi.';

-- C. Kasa & Satış Fiş Kalemleri (Transaction Items)
DELETE FROM public.transaction_items;
RAISE NOTICE '✓ [transaction_items] tablosundaki tüm test fiş satırları silindi.';

-- D. Kasa Hareketleri ve Faturalar (Transactions)
DELETE FROM public.transactions;
RAISE NOTICE '✓ [transactions] tablosundaki tüm test kasa gelir/gider hareketleri silindi.';

-- E. Müşteri Kayıtları
DELETE FROM public.customers;
RAISE NOTICE '✓ [customers] tablosundaki tüm test müşteri profilleri silindi.';

-- F. Envanter Ürünleri ve Cihazlar
DELETE FROM public.products;
RAISE NOTICE '✓ [products] tablosundaki tüm test ürünleri, IMEI kayıtları ve stoklar silindi.';

-- ------------------------------------------------------------------------------
-- 3. KULLANICI PROFİLLERİ VE AUTH TEMİZLİĞİ (SUPERADMIN HARİÇ)
-- ------------------------------------------------------------------------------

-- A. Varsayılan Admin Rolünü Doğrula / Temin Et
INSERT INTO public.roles (name, description)
VALUES 
    ('Admin', 'Sistem Yöneticisi - Tüm yetkilere sahip tam erişimli profil'),
    ('Personel', 'Mağaza Satış ve Teknik Servis Personeli')
ON CONFLICT (name) DO UPDATE 
SET description = EXCLUDED.description;

-- B. SuperAdmin Dışındaki Tüm Profilleri Temizle
-- 'admin@phonestore.com' hesabı korunur.
DELETE FROM public.profiles 
WHERE email IS NULL OR lower(email) NOT IN ('admin@phonestore.com');
RAISE NOTICE '✓ [profiles] tablosundan SuperAdmin hariç tüm test kullanıcıları silindi.';

-- C. Supabase auth.users Tablosundan Test Kullanıcılarını Temizle
DELETE FROM auth.users 
WHERE email IS NULL OR lower(email) NOT IN ('admin@phonestore.com');
RAISE NOTICE '✓ [auth.users] tablosundan SuperAdmin hariç tüm test oturumları silindi.';

-- D. SuperAdmin Kullanıcısını ve Profilini Garanti Altına Al
DO $$
DECLARE
    v_admin_role_id UUID;
    v_admin_user_id UUID;
BEGIN
    SELECT id INTO v_admin_role_id FROM public.roles WHERE name = 'Admin' LIMIT 1;
    
    -- auth.users içinde admin kullanıcısını kontrol et
    SELECT id INTO v_admin_user_id FROM auth.users WHERE lower(email) = 'admin@phonestore.com' LIMIT 1;
    
    IF v_admin_user_id IS NULL THEN
        -- Yeni SuperAdmin Kullanıcısı Oluştur
        v_admin_user_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_admin_user_id,
            'authenticated',
            'authenticated',
            'admin@phonestore.com',
            crypt('Admin2026!Launch', gen_salt('bf')),
            timezone('utc'::text, now()),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Sistem Yöneticisi","role":"Admin"}',
            timezone('utc'::text, now()),
            timezone('utc'::text, now())
        );
        RAISE NOTICE '✓ [auth.users] SuperAdmin hesabı (admin@phonestore.com) oluşturuldu.';
    ELSE
        -- Şifresini ve meta verilerini güncelle
        UPDATE auth.users 
        SET encrypted_password = crypt('Admin2026!Launch', gen_salt('bf')),
            raw_user_meta_data = '{"full_name":"Sistem Yöneticisi","role":"Admin"}',
            updated_at = timezone('utc'::text, now())
        WHERE id = v_admin_user_id;
        RAISE NOTICE '✓ [auth.users] Mevcut SuperAdmin hesabının kimlik bilgileri güncellendi.';
    END IF;

    -- public.profiles Tablosunu Güncelle veya Oluştur
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role_id,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        v_admin_user_id,
        'admin@phonestore.com',
        'Sistem Yöneticisi',
        v_admin_role_id,
        'Admin',
        TRUE,
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
    ON CONFLICT (id) DO UPDATE 
    SET full_name = 'Sistem Yöneticisi',
        role_id = v_admin_role_id,
        role = 'Admin',
        is_active = TRUE,
        updated_at = timezone('utc'::text, now());
        
    RAISE NOTICE '✓ [profiles] SuperAdmin profili başarıyla aktif edildi.';
END $$;

-- ------------------------------------------------------------------------------
-- 4. KATEGORİ STANDARTLARINI OLUŞTUR / KORU
-- ------------------------------------------------------------------------------
INSERT INTO public.categories (name, description, icon)
VALUES 
    ('Akıllı Telefonlar', 'Sıfır ve 2. el garantili akıllı cep telefonları', 'Smartphone'),
    ('Tabletler', 'Tablet bilgisayarlar ve e-kitap okuyucular', 'Tablet'),
    ('Aksesuarlar', 'Kılıf, kırılmaz cam, şarj aleti, kulaklık ve adaptörler', 'Headphones'),
    ('Yedek Parça', 'Ekran, batarya, kamera ve teknik servis bileşenleri', 'Wrench')
ON CONFLICT (name) DO NOTHING;

RAISE NOTICE '✓ [categories] Standart ürün kategorileri doğrulandı.';

-- ------------------------------------------------------------------------------
-- 5. RLS (ROW LEVEL SECURITY) POLİTİKALARINI VE SAĞLIĞINI DOĞRULA
-- ------------------------------------------------------------------------------
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_ticket_parts ENABLE ROW LEVEL SECURITY;

RAISE NOTICE '✓ Tüm tablolarda Row Level Security (RLS) kalkanı aktif.';

-- ------------------------------------------------------------------------------
-- 6. ÖZET VE DOĞRULAMA ÇIKTISI
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_product_count INT;
    v_customer_count INT;
    v_tx_count INT;
    v_ticket_count INT;
    v_user_count INT;
BEGIN
    SELECT count(*) INTO v_product_count FROM public.products;
    SELECT count(*) INTO v_customer_count FROM public.customers;
    SELECT count(*) INTO v_tx_count FROM public.transactions;
    SELECT count(*) INTO v_ticket_count FROM public.repair_tickets;
    SELECT count(*) INTO v_user_count FROM public.profiles;

    RAISE NOTICE '==================================================';
    RAISE NOTICE '>>> PRODUCTION VERİTABANI TEMİZLİĞİ TAMAMLANDI <<<';
    RAISE NOTICE 'Kalan Ürün Sayısı         : % (Beklenen: 0)', v_product_count;
    RAISE NOTICE 'Kalan Müşteri Sayısı      : % (Beklenen: 0)', v_customer_count;
    RAISE NOTICE 'Kalan Kasa Hareketi       : % (Beklenen: 0)', v_tx_count;
    RAISE NOTICE 'Kalan Servis Bileti       : % (Beklenen: 0)', v_ticket_count;
    RAISE NOTICE 'Kalan Kullanıcı Sayısı    : % (Beklenen: 1 - Sadece SuperAdmin)', v_user_count;
    RAISE NOTICE 'SuperAdmin E-posta        : admin@phonestore.com';
    RAISE NOTICE 'SuperAdmin İlk Şifre      : Admin2026!Launch';
    RAISE NOTICE '==================================================';
END $$;

COMMIT;
