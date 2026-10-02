-- ==============================================================================
-- 5. TELEFON MAĞAZASI YÖNETİM SİSTEMİ - SUPABASE STORAGE ÜRÜN GÖRSELLERİ (BUCKET & RLS)
-- Gün 15: Supabase Storage ile Ürün Görseli Yükleme & Bulut Medya Depolama
-- ==============================================================================

-- Gerekli eklentilerin etkinleştirildiğinden emin olalım
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PRODUCTS TABLOSUNDA image_url ALANININ BULUNDUĞUNDAN EMİN OLUNMASI
-- ------------------------------------------------------------------------------
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.products.image_url IS 'Supabase Storage product-images kovasından dönen CDN / Public URL bağlantısı';

-- ------------------------------------------------------------------------------
-- 2. SUPABASE STORAGE BUCKET: "product-images" OLUŞTURULMASI
-- ------------------------------------------------------------------------------
-- Storage API üzerinden doğrudan genel (public) erişilebilen, 
-- maksimum 5 MB dosya sınırı ve yalnızca optimize edilmiş görsel formatlarını kabul eden kova
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,                                   -- Genel CDN okuma erişimi açık
    5242880,                                -- 5 Megabyte (5 * 1024 * 1024 byte)
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/jpg',
        'image/gif'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/jpg',
        'image/gif'
    ];

-- ------------------------------------------------------------------------------
-- 3. STORAGE.OBJECTS İÇİN SATIR BAZLI GÜVENLİK (ROW LEVEL SECURITY - RLS)
-- ------------------------------------------------------------------------------
-- Supabase Storage nesneleri üzerinde güvenlik politikalarını etkinleştir
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- POLİTİKA 1: HERKES ÜRÜN GÖRSELLERİNİ GÖRÜNTÜLEYEBİLİR (PUBLIC READ)
-- ------------------------------------------------------------------------------
-- E-ticaret / Mağaza envanterinde yer alan ürün fotoğrafları herkes tarafından serbestçe görüntülenebilir.
DROP POLICY IF EXISTS "Public Can View Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Genel Kullanıcılar Ürün Görsellerini Görebilir" ON storage.objects;

CREATE POLICY "Genel Kullanıcılar Ürün Görsellerini Görebilir"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- ------------------------------------------------------------------------------
-- POLİTİKA 2: YETKİLİ KULLANICILAR VE PERSONEL YENİ GÖRSEL YÜKLEYEBİLİR (UPLOAD / INSERT)
-- ------------------------------------------------------------------------------
-- Mağaza personeli veya yetkili oturum açmış kullanıcılar ürün kovasına yeni görsel yükleyebilir.
DROP POLICY IF EXISTS "Staff Can Upload Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Yetkili Personel Ürün Görseli Yükleyebilir" ON storage.objects;

CREATE POLICY "Yetkili Personel Ürün Görseli Yükleyebilir"
ON storage.objects
FOR INSERT
TO authenticated, anon
WITH CHECK (
    bucket_id = 'product-images'
);

-- ------------------------------------------------------------------------------
-- POLİTİKA 3: YETKİLİ PERSONEL ÜRÜN GÖRSELLERİNİ GÜNCELLEYEBİLİR (UPDATE / UPSERT)
-- ------------------------------------------------------------------------------
-- Mevcut bir ürünün görselini değiştirmek veya optimize edilmiş yeni versiyonla güncellemek için.
DROP POLICY IF EXISTS "Staff Can Update Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Yetkili Personel Ürün Görseli Güncelleyebilir" ON storage.objects;

CREATE POLICY "Yetkili Personel Ürün Görseli Güncelleyebilir"
ON storage.objects
FOR UPDATE
TO authenticated, anon
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- ------------------------------------------------------------------------------
-- POLİTİKA 4: YETKİLİ PERSONEL ÜRÜN GÖRSELLERİNİ SİLEBİLİR (DELETE)
-- ------------------------------------------------------------------------------
-- Silinen veya kaldırılan ürünlerin disk alanı kazanımı için depolama alanından temizlenebilmesi.
DROP POLICY IF EXISTS "Staff Can Delete Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Yetkili Personel Ürün Görseli Silebilir" ON storage.objects;

CREATE POLICY "Yetkili Personel Ürün Görseli Silebilir"
ON storage.objects
FOR DELETE
TO authenticated, anon
USING (bucket_id = 'product-images');

-- ------------------------------------------------------------------------------
-- 4. KONTROL VE DOĞRULAMA SORGULARI
-- ------------------------------------------------------------------------------
-- Aşağıdaki sorgular Supabase SQL editöründe çalıştırılarak kovayı doğrulamak içindir:
-- SELECT id, name, public, file_size_limit, allowed_mime_types FROM storage.buckets WHERE id = 'product-images';
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
