-- ==============================================================================
-- 8. TELEFON MAĞAZASI YÖNETİM SİSTEMİ - GÜNLÜK VE HAFTALIK DASHBOARD ANALİTİK RPC
-- ==============================================================================
-- Bu fonksiyon; belirli bir tarih aralığında (Bugün, Bu Hafta, Bu Ay):
-- 1) Toplam Ciro (Satış + Servis)
-- 2) Satılan Malların Maliyeti (COGS) ve Brüt Kâr / Zarar Durumu
-- 3) En Çok Satılan Ürünler (Top Selling Products)
-- 4) Ödeme Yöntemleri Dağılımı (Nakit, Kredi Kartı, Havale, Cari)
-- 5) Kasa ve Teknik Servis İşlem İstatistikleri
-- verilerini tek bir atomik sorguda hesaplayıp JSON olarak döner.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_analytics(
    p_start_date TIMESTAMPTZ DEFAULT (date_trunc('week', now() AT TIME ZONE 'UTC')),
    p_end_date TIMESTAMPTZ DEFAULT now()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total_sales_revenue NUMERIC(12, 2) := 0.00;
    v_total_repair_revenue NUMERIC(12, 2) := 0.00;
    v_total_revenue NUMERIC(12, 2) := 0.00;
    v_total_purchases_expense NUMERIC(12, 2) := 0.00;
    v_total_cogs NUMERIC(12, 2) := 0.00;
    v_gross_profit NUMERIC(12, 2) := 0.00;
    v_profit_margin NUMERIC(5, 2) := 0.00;
    
    v_sales_count INT := 0;
    v_repair_count INT := 0;
    v_purchase_count INT := 0;
    v_total_transaction_count INT := 0;
    
    v_pending_repairs INT := 0;
    v_in_progress_repairs INT := 0;
    v_completed_repairs INT := 0;
    v_total_active_repairs INT := 0;
    
    v_critical_stock_count INT := 0;
    
    v_top_products JSONB := '[]'::JSONB;
    v_payment_methods JSONB := '[]'::JSONB;
    v_critical_stock_items JSONB := '[]'::JSONB;
    v_recent_transactions JSONB := '[]'::JSONB;
    v_active_tickets JSONB := '[]'::JSONB;
    
    v_result JSONB;
BEGIN
    -- -------------------------------------------------------------------------
    -- 1. CİRO VE İŞLEM HAREKETLERİ HESAPLAMASI
    -- -------------------------------------------------------------------------
    -- Satış İşlemleri (type = 'sale')
    SELECT 
        COALESCE(SUM(t.net_amount), 0.00),
        COUNT(*)
    INTO 
        v_total_sales_revenue,
        v_sales_count
    FROM public.transactions t
    WHERE t.type = 'sale'
      AND t.status = 'completed'
      AND t.created_at >= p_start_date
      AND t.created_at <= p_end_date;

    -- Teknik Servis Tahsilatları (type = 'repair_payment')
    SELECT 
        COALESCE(SUM(t.net_amount), 0.00),
        COUNT(*)
    INTO 
        v_total_repair_revenue,
        v_repair_count
    FROM public.transactions t
    WHERE t.type = 'repair_payment'
      AND t.status = 'completed'
      AND t.created_at >= p_start_date
      AND t.created_at <= p_end_date;

    -- İkinci El Alım / Giderler (type = 'purchase')
    SELECT 
        COALESCE(SUM(t.net_amount), 0.00),
        COUNT(*)
    INTO 
        v_total_purchases_expense,
        v_purchase_count
    FROM public.transactions t
    WHERE t.type = 'purchase'
      AND t.status = 'completed'
      AND t.created_at >= p_start_date
      AND t.created_at <= p_end_date;

    -- Toplam Ciro = Satış Cirosu + Servis Tahsilat Cirosu
    v_total_revenue := v_total_sales_revenue + v_total_repair_revenue;
    v_total_transaction_count := v_sales_count + v_repair_count;

    -- -------------------------------------------------------------------------
    -- 2. SATILAN MALLARIN MALİYETİ (COGS) VE KÂR-ZARAR HESAPLAMASI
    -- -------------------------------------------------------------------------
    -- Satılan ürünlerin alım maliyeti: sum(quantity * products.purchase_price)
    SELECT 
        COALESCE(SUM(ti.quantity * COALESCE(p.purchase_price, 0.00)), 0.00)
    INTO 
        v_total_cogs
    FROM public.transaction_items ti
    JOIN public.transactions t ON t.id = ti.transaction_id
    JOIN public.products p ON p.id = ti.product_id
    WHERE t.type = 'sale'
      AND t.status = 'completed'
      AND t.created_at >= p_start_date
      AND t.created_at <= p_end_date;

    -- Servis parça maliyetleri de eklenebilir (repair_tickets.parts_total_cost)
    -- Brüt Kâr = Toplam Ciro - Satılan Ürünlerin Alış Maliyeti
    v_gross_profit := v_total_revenue - v_total_cogs;

    -- Kâr Marjı Yüzdesi
    IF v_total_revenue > 0 THEN
        v_profit_margin := ROUND(((v_gross_profit / v_total_revenue) * 100)::NUMERIC, 2);
    ELSE
        v_profit_margin := 0.00;
    END IF;

    -- -------------------------------------------------------------------------
    -- 3. EN ÇOK SATILAN ÜRÜNLER (TOP SELLING PRODUCTS - İLK 5)
    -- -------------------------------------------------------------------------
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'productId', sub.product_id,
                'name', sub.product_name,
                'brand', sub.brand,
                'categoryName', sub.category_name,
                'totalQuantity', sub.total_qty,
                'totalRevenue', sub.total_rev,
                'totalProfit', sub.total_prf,
                'currentStock', sub.current_stock,
                'imageUrl', sub.image_url
            )
        ), '[]'::JSONB
    )
    INTO v_top_products
    FROM (
        SELECT 
            p.id AS product_id,
            p.name AS product_name,
            p.brand,
            COALESCE(c.name, 'Genel') AS category_name,
            SUM(ti.quantity)::INT AS total_qty,
            SUM(ti.total_price)::NUMERIC(12,2) AS total_rev,
            SUM(ti.total_price - (ti.quantity * COALESCE(p.purchase_price, 0.00)))::NUMERIC(12,2) AS total_prf,
            p.stock_quantity AS current_stock,
            p.image_url
        FROM public.transaction_items ti
        JOIN public.transactions t ON t.id = ti.transaction_id
        JOIN public.products p ON p.id = ti.product_id
        LEFT JOIN public.categories c ON c.id = p.category_id
        WHERE t.type = 'sale'
          AND t.status = 'completed'
          AND t.created_at >= p_start_date
          AND t.created_at <= p_end_date
        GROUP BY p.id, p.name, p.brand, c.name, p.stock_quantity, p.image_url
        ORDER BY total_qty DESC, total_rev DESC
        LIMIT 5
    ) sub;

    -- -------------------------------------------------------------------------
    -- 4. ÖDEME YÖNTEMLERİ DAĞILIMI
    -- -------------------------------------------------------------------------
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'method', sub.payment_method,
                'amount', sub.total_amount,
                'count', sub.trx_count,
                'percentage', CASE 
                    WHEN v_total_revenue > 0 THEN ROUND(((sub.total_amount / v_total_revenue) * 100)::NUMERIC, 1)
                    ELSE 0.0
                END
            )
        ), '[]'::JSONB
    )
    INTO v_payment_methods
    FROM (
        SELECT 
            t.payment_method,
            SUM(t.net_amount)::NUMERIC(12,2) AS total_amount,
            COUNT(*)::INT AS trx_count
        FROM public.transactions t
        WHERE t.type IN ('sale', 'repair_payment')
          AND t.status = 'completed'
          AND t.created_at >= p_start_date
          AND t.created_at <= p_end_date
        GROUP BY t.payment_method
        ORDER BY total_amount DESC
    ) sub;

    -- -------------------------------------------------------------------------
    -- 5. TEKNİK SERVİS AKTİF KUYRUK DURUMU
    -- -------------------------------------------------------------------------
    SELECT 
        COUNT(*) FILTER (WHERE status = 'bekliyor'),
        COUNT(*) FILTER (WHERE status = 'islemde'),
        COUNT(*) FILTER (WHERE status = 'tamamlandi'),
        COUNT(*) FILTER (WHERE status IN ('bekliyor', 'islemde', 'parca_bekliyor'))
    INTO 
        v_pending_repairs,
        v_in_progress_repairs,
        v_completed_repairs,
        v_total_active_repairs
    FROM public.repair_tickets;

    -- -------------------------------------------------------------------------
    -- 6. KRİTİK STOK UYARISI VEREN ÜRÜNLER
    -- -------------------------------------------------------------------------
    SELECT COUNT(*)
    INTO v_critical_stock_count
    FROM public.products
    WHERE is_active = TRUE
      AND stock_quantity <= min_stock_level;

    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', p.id,
                'name', p.name,
                'brand', p.brand,
                'stockQuantity', p.stock_quantity,
                'minStockLevel', p.min_stock_level,
                'salePrice', p.sale_price
            )
        ), '[]'::JSONB
    )
    INTO v_critical_stock_items
    FROM (
        SELECT id, name, brand, stock_quantity, min_stock_level, sale_price
        FROM public.products
        WHERE is_active = TRUE
          AND stock_quantity <= min_stock_level
        ORDER BY stock_quantity ASC
        LIMIT 6
    ) p;

    -- -------------------------------------------------------------------------
    -- 7. SON KASA HAREKETLERİ (İLK 5)
    -- -------------------------------------------------------------------------
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', t.id,
                'transactionNumber', t.transaction_number,
                'type', t.type,
                'paymentMethod', t.payment_method,
                'amount', t.net_amount,
                'notes', t.notes,
                'createdAt', t.created_at,
                'customerName', c.full_name
            )
        ), '[]'::JSONB
    )
    INTO v_recent_transactions
    FROM (
        SELECT t.*, c.full_name
        FROM public.transactions t
        LEFT JOIN public.customers c ON c.id = t.customer_id
        ORDER BY t.created_at DESC
        LIMIT 5
    ) t;

    -- -------------------------------------------------------------------------
    -- 8. AKTİF SERVİS BİLETLERİ (İLK 5)
    -- -------------------------------------------------------------------------
    SELECT COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', rt.id,
                'ticketNumber', rt.ticket_number,
                'deviceBrand', rt.device_brand,
                'deviceModel', rt.device_model,
                'issueDescription', rt.issue_description,
                'devicePassword', rt.device_password,
                'status', rt.status,
                'estimatedCost', rt.estimated_cost,
                'customerName', c.full_name,
                'createdAt', rt.created_at
            )
        ), '[]'::JSONB
    )
    INTO v_active_tickets
    FROM (
        SELECT rt.*, c.full_name
        FROM public.repair_tickets rt
        LEFT JOIN public.customers c ON c.id = rt.customer_id
        WHERE rt.status IN ('bekliyor', 'islemde', 'parca_bekliyor')
        ORDER BY rt.created_at DESC
        LIMIT 5
    ) rt;

    -- -------------------------------------------------------------------------
    -- 9. SONUÇ JSONB NESNESİNİN OLUŞTURULMASI
    -- -------------------------------------------------------------------------
    v_result := jsonb_build_object(
        'period', jsonb_build_object(
            'startDate', p_start_date,
            'endDate', p_end_date
        ),
        'revenue', jsonb_build_object(
            'total', v_total_revenue,
            'sales', v_total_sales_revenue,
            'repairs', v_total_repair_revenue,
            'purchasesExpense', v_total_purchases_expense,
            'salesCount', v_sales_count,
            'repairsCount', v_repair_count,
            'transactionCount', v_total_transaction_count
        ),
        'profit', jsonb_build_object(
            'grossProfit', v_gross_profit,
            'cogs', v_total_cogs,
            'profitMargin', v_profit_margin,
            'isProfitable', (v_gross_profit >= 0)
        ),
        'topProducts', v_top_products,
        'paymentMethods', v_payment_methods,
        'serviceQueue', jsonb_build_object(
            'pending', v_pending_repairs,
            'inProgress', v_in_progress_repairs,
            'completed', v_completed_repairs,
            'totalActive', v_total_active_repairs
        ),
        'criticalStock', jsonb_build_object(
            'count', v_critical_stock_count,
            'items', v_critical_stock_items
        ),
        'recentTransactions', v_recent_transactions,
        'activeTickets', v_active_tickets
    );

    RETURN v_result;
END;
$$;

-- Fonksiyon açıklaması
COMMENT ON FUNCTION public.get_dashboard_analytics IS 'Dashboard ana sayfası için ciro, kar-zarar, en çok satan ürünler ve kasa özetini tek sorguda hesaplayan analitik RPC fonksiyonu';

-- Yetkilendirme
GRANT EXECUTE ON FUNCTION public.get_dashboard_analytics(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dashboard_analytics(TIMESTAMPTZ, TIMESTAMPTZ) TO anon;
GRANT EXECUTE ON FUNCTION public.get_dashboard_analytics(TIMESTAMPTZ, TIMESTAMPTZ) TO service_role;
