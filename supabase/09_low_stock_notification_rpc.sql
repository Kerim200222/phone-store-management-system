-- ==============================================================================
-- 9. TELEFON MAĞAZASI YÖNETİM SİSTEMİ - DÜŞÜK STOK UYARI SİSTEMİ RPC
-- ==============================================================================
-- Bu fonksiyon; stok miktarı belirli bir eşiğin (varsayılan: 5) altına düşen
-- aktif ürünleri tespit eder, kategori bilgileriyle birleştirir ve
-- stok miktarına göre en acil olandan (0 stok / tükenenler) başlayarak sıralar.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_low_stock_products(
    p_threshold INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    brand VARCHAR(100),
    model VARCHAR(100),
    barcode VARCHAR(100),
    imei VARCHAR(15),
    stock_quantity INTEGER,
    min_stock_level INTEGER,
    purchase_price NUMERIC(12, 2),
    sale_price NUMERIC(12, 2),
    image_url TEXT,
    category_id UUID,
    category_name VARCHAR(100),
    severity VARCHAR(20)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.brand,
        p.model,
        p.barcode,
        p.imei,
        p.stock_quantity,
        p.min_stock_level,
        p.purchase_price,
        p.sale_price,
        p.image_url,
        p.category_id,
        COALESCE(c.name, 'Genel')::VARCHAR(100) AS category_name,
        CASE 
            WHEN p.stock_quantity <= 0 THEN 'out_of_stock'::VARCHAR(20)
            WHEN p.stock_quantity <= 2 THEN 'critical'::VARCHAR(20)
            ELSE 'warning'::VARCHAR(20)
        END AS severity
    FROM public.products p
    LEFT JOIN public.categories c ON c.id = p.category_id
    WHERE p.is_active = TRUE
      AND p.stock_quantity < p_threshold
    ORDER BY 
        p.stock_quantity ASC,
        p.name ASC;
END;
$$;

-- Fonksiyon Açıklaması
COMMENT ON FUNCTION public.get_low_stock_products IS 'Stok adedi 5''in altına düşen ürünleri ciddiyet derecesi (out_of_stock, critical, warning) ile birlikte listeleyen fonksiyon';

-- Yetkilendirme
GRANT EXECUTE ON FUNCTION public.get_low_stock_products(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_low_stock_products(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.get_low_stock_products(INTEGER) TO service_role;
