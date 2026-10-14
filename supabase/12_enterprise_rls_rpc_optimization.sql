-- ==============================================================================
-- 12. ENTERPRISE ROW LEVEL SECURITY (RLS) & RPC ROLE VERIFICATION OPTIMIZATION
-- ==============================================================================
-- Bu migration; Supabase veritabanında satır bazlı güvenlik (RLS) politikalarının
-- alt sorgu (EXISTS subquery) maliyetini sıfırlamak, JWT Custom Claims ile sıfır
-- gecikmeli rol doğrulaması sağlamak ve STABLE fonksiyonlar ile sorgu başı
-- tekil hesaplama (single-evaluation) standardını devreye almak için hazırlanmıştır.
-- ==============================================================================

-- 1. İNDEKSLEME OPTİMİZASYONU
-- Rol sorgulamalarında heap erişimini önleyen composite covering index
CREATE INDEX IF NOT EXISTS idx_profiles_role_active_covering 
ON public.profiles(id, role, is_active);

-- 2. STABLE & SECURITY DEFINER ROL VE YETKİ RPC FONKSİYONLARI

-- 2.1 İndeksli ve JWT Destekli is_admin() Fonksiyonu
-- STABLE niteliği sayesinde tek bir sorguda taranan binlerce satır için sadece 1 kez çalıştırılır.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- 1. Aşama: JWT Custom Claims / Metadata'dan anlık kontrol (Sıfır DB Gecikmesi)
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'Admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'Admin'
    -- 2. Aşama: Fallback olarak profiles tablosundaki covering index üzerinden kontrol
    OR EXISTS (
      SELECT 1 
      FROM public.profiles
      WHERE id = auth.uid() 
        AND role = 'Admin' 
        AND is_active = TRUE
    );
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Oturum açan kullanıcının Admin yetkisini önce JWT metadata, sonra covering index üzerinden STABLE olarak doğrular.';

-- 2.2 Aktif Personel Doğrulama: is_active_staff()
CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- JWT rol kontrolü
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('Admin', 'Personel')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Personel')
    -- Profiles covering index fallback
    OR EXISTS (
      SELECT 1 
      FROM public.profiles
      WHERE id = auth.uid() 
        AND role IN ('Admin', 'Personel') 
        AND is_active = TRUE
    );
$$;

COMMENT ON FUNCTION public.is_active_staff() IS 'Oturum açan kullanıcının yetkili mağaza personeli olduğunu STABLE olarak doğrular.';

-- 2.3 Kullanıcı Rolünü Dönen get_user_role() RPC Fonksiyonu
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'role',
    auth.jwt() -> 'app_metadata' ->> 'role',
    (
      SELECT p.role 
      FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.is_active = TRUE 
      LIMIT 1
    ),
    'anon'
  );
$$;

COMMENT ON FUNCTION public.get_user_role() IS 'Kullanıcının aktif rolünü JWT veya profiles covering indexi üzerinden gecikmesiz döner.';

-- 3. RLS POLİTİKALARININ OPTİMİZE EDİLMESİ
-- Eski N-satır maliyetli EXISTS (SELECT 1 FROM profiles ...) alt sorguları kaldırılır,
-- yerine STABLE is_admin() ve is_active_staff() fonksiyonları bağlanır.

-- 3.1 PROFILES POLİTİKALARI
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR public.is_admin()
);

DROP POLICY IF EXISTS "profiles_update_admin_or_self" ON public.profiles;
CREATE POLICY "profiles_update_admin_or_self"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid() OR public.is_admin()
)
WITH CHECK (
  id = auth.uid() OR public.is_admin()
);

-- 3.2 PRODUCTS POLİTİKALARI
DROP POLICY IF EXISTS "products_select_staff" ON public.products;
CREATE POLICY "products_select_staff"
ON public.products
FOR SELECT
TO authenticated
USING (public.is_active_staff());

DROP POLICY IF EXISTS "products_insert_update_staff" ON public.products;
CREATE POLICY "products_insert_update_staff"
ON public.products
FOR ALL
TO authenticated
USING (public.is_active_staff())
WITH CHECK (public.is_active_staff());

-- 3.3 SERVICE TICKETS POLİTİKALARI
DROP POLICY IF EXISTS "service_tickets_all_staff" ON public.service_tickets;
CREATE POLICY "service_tickets_all_staff"
ON public.service_tickets
FOR ALL
TO authenticated
USING (public.is_active_staff())
WITH CHECK (public.is_active_staff());

-- 3.4 TRANSACTIONS POLİTİKALARI
DROP POLICY IF EXISTS "transactions_all_staff" ON public.transactions;
CREATE POLICY "transactions_all_staff"
ON public.transactions
FOR ALL
TO authenticated
USING (public.is_active_staff())
WITH CHECK (public.is_active_staff());

-- 3.5 CUSTOMERS POLİTİKALARI
DROP POLICY IF EXISTS "customers_all_staff" ON public.customers;
CREATE POLICY "customers_all_staff"
ON public.customers
FOR ALL
TO authenticated
USING (public.is_active_staff())
WITH CHECK (public.is_active_staff());

-- 4. RPC FONKSİYONLARINA ÇALIŞTIRMA (EXECUTE) YETKİLERİ
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_active_staff() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated, service_role;
