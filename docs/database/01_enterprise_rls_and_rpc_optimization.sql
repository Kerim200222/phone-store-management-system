-- ==============================================================================
-- DATABASE ARCHITECTURE: ENTERPRISE RLS & RPC ROLE VERIFICATION
-- ==============================================================================
-- Dosya: docs/database/01_enterprise_rls_and_rpc_optimization.sql
-- Amaç: 
-- 1. Satır başı alt sorgu (per-row subquery) yükünü ortadan kaldırmak.
-- 2. STABLE ve SECURITY DEFINER nitelikli indeksli is_admin() ve get_user_role() fonksiyonlarını kurmak.
-- 3. auth.jwt() custom claims ile gecikmesiz yetkilendirme sağlamak.
-- ==============================================================================

-- 1. İNDEKSLEME
CREATE INDEX IF NOT EXISTS idx_profiles_role_active_covering 
ON public.profiles(id, role, is_active);

-- 2. STABLE FONKSİYONLAR
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'Admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'Admin'
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'Admin' AND is_active = TRUE
    );
$$;

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
    (SELECT role FROM public.profiles WHERE id = auth.uid() AND is_active = TRUE),
    'anon'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('Admin', 'Personel')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('Admin', 'Personel')
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('Admin', 'Personel') AND is_active = TRUE
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_active_staff() TO authenticated, service_role;
