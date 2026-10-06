-- ==============================================================================
-- 7. TELEFON MAĞAZASI YÖNETİM SİSTEMİ - İKİNCİ EL CİHAZ ALIM İŞLEMİ (SUPABASE)
-- Day 19: İkinci El Cihaz Alımı, Envanter Girişi ve Kasadan Para Çıkışı (Closes #58)
-- ==============================================================================

-- Bu fonksiyon müşteriden 2. el cihaz satın alma işlemini tek bir ACID Transaction içinde tamamlar:
-- 1) products tablosuna yeni 2. el cihazı ekler (stok = 1, kondisyon = 'ikinci el', IMEI = ...).
-- 2) transactions tablosuna 'purchase' (alım/gider) türünde para çıkış kaydı açar.
-- 3) transaction_items tablosuna alımı yapılan cihazı ve 15 haneli IMEI'sini bağlar.
-- 4) Ödeme türü 'on_account' ise müşterinin bakiyesini alım tutarı kadar artırır (Cari mahsup/alacak).
-- 5) Hata durumunda otomatik ROLLBACK ile veri bütünlüğünü garanti eder.

CREATE OR REPLACE FUNCTION public.process_secondhand_purchase(
    p_transaction_number VARCHAR,
    p_customer_id UUID,
    p_brand VARCHAR,
    p_model VARCHAR,
    p_imei VARCHAR,
    p_purchase_price NUMERIC,
    p_target_sale_price NUMERIC,
    p_battery_health INT DEFAULT 100,
    p_cosmetic_condition VARCHAR DEFAULT 'A (Çok Temiz)',
    p_storage VARCHAR DEFAULT '128 GB',
    p_color VARCHAR DEFAULT 'Siyah',
    p_payment_method VARCHAR DEFAULT 'cash',
    p_shelf_location VARCHAR DEFAULT 'İkinci El Vitrin',
    p_description TEXT DEFAULT NULL,
    p_image_url TEXT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_category_id UUID;
    v_product_id UUID;
    v_transaction_id UUID;
    v_product_name VARCHAR(255);
    v_paid_amount NUMERIC;
BEGIN
    -- 1. Parametre Doğrulamaları
    IF p_purchase_price <= 0 THEN
        RAISE EXCEPTION 'Alış fiyatı sıfırdan büyük olmalıdır (Kasadan para çıkışı): %', p_purchase_price;
    END IF;

    IF p_target_sale_price <= 0 THEN
        RAISE EXCEPTION 'Hedef satış fiyatı sıfırdan büyük olmalıdır: %', p_target_sale_price;
    END IF;

    IF length(p_imei) <> 15 OR NOT (p_imei ~ '^[0-9]+$') THEN
        RAISE EXCEPTION 'Geçersiz IMEI numarası! IMEI 15 haneli rakam olmalıdır: %', p_imei;
    END IF;

    -- 'Telefon' kategorisi ID'sini bul (yoksa ilk kategoriyi al)
    SELECT id INTO v_category_id 
    FROM public.categories 
    WHERE name = 'Telefon' 
    LIMIT 1;

    IF v_category_id IS NULL THEN
        SELECT id INTO v_category_id FROM public.categories LIMIT 1;
    END IF;

    v_product_name := trim(p_brand || ' ' || p_model || ' ' || p_storage || ' (' || p_color || ')');

    -- 2. products Tablosuna Yeni Cihaz Kaydı Ekle
    INSERT INTO public.products (
        category_id,
        name,
        brand,
        model,
        condition,
        imei,
        battery_health,
        cosmetic_condition,
        storage,
        color,
        purchase_price,
        sale_price,
        stock_quantity,
        min_stock_level,
        shelf_location,
        description,
        image_url,
        is_active
    ) VALUES (
        v_category_id,
        v_product_name,
        p_brand,
        p_model,
        'ikinci el',
        p_imei,
        p_battery_health,
        p_cosmetic_condition,
        p_storage,
        p_color,
        p_purchase_price,
        p_target_sale_price,
        1, -- İkinci el telefonlar tekil stoktur
        1,
        p_shelf_location,
        p_description,
        p_image_url,
        true
    )
    RETURNING id INTO v_product_id;

    -- Fiilen ödenen tutar (veresiye/takas değilse tam alış bedeli)
    IF p_payment_method = 'on_account' THEN
        v_paid_amount := 0.00;
    ELSE
        v_paid_amount := p_purchase_price;
    END IF;

    -- 3. transactions Tablosuna Kasa Para Çıkış Kaydı (Gider / Alım) Ekle
    INSERT INTO public.transactions (
        transaction_number,
        customer_id,
        type,
        payment_method,
        total_amount,
        discount_amount,
        net_amount,
        paid_amount,
        status,
        notes,
        created_by
    ) VALUES (
        p_transaction_number,
        p_customer_id,
        'purchase',
        p_payment_method,
        p_purchase_price,
        0.00,
        p_purchase_price,
        v_paid_amount,
        'completed',
        'İkinci El Cihaz Alımı: ' || v_product_name || ' (IMEI: ' || p_imei || ')',
        p_created_by
    )
    RETURNING id INTO v_transaction_id;

    -- 4. transaction_items Tablosuna Satın Alınan Cihaz Kalemini Ekle
    INSERT INTO public.transaction_items (
        transaction_id,
        product_id,
        imei,
        quantity,
        unit_price,
        total_price,
        notes
    ) VALUES (
        v_transaction_id,
        v_product_id,
        p_imei,
        1,
        p_purchase_price,
        p_purchase_price,
        'Müşteriden 2. el cihaz alımı (Kondisyon: ' || p_cosmetic_condition || ')'
    );

    -- 5. Takas / Cari Mahsup Durumunda Müşteri Bakiyesini Güncelle
    -- Mağaza müşteriye borçlanır veya müşterinin eski borcundan düşer
    IF p_payment_method = 'on_account' AND p_customer_id IS NOT NULL THEN
        UPDATE public.customers
        SET 
            balance = balance + p_purchase_price,
            updated_at = timezone('utc'::text, now())
        WHERE id = p_customer_id;
    END IF;

    -- 6. Başarılı Yanıt Döndür
    RETURN jsonb_build_object(
        'success', true,
        'product_id', v_product_id,
        'transaction_id', v_transaction_id,
        'transaction_number', p_transaction_number,
        'product_name', v_product_name,
        'purchase_price', p_purchase_price,
        'target_sale_price', p_target_sale_price,
        'imei', p_imei
    );

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'İkinci El Cihaz Alım Hatası: % (Hata Kodu: %)', SQLERRM, SQLSTATE;
END;
$$;

-- İzinler
GRANT EXECUTE ON FUNCTION public.process_secondhand_purchase TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_secondhand_purchase TO anon;
GRANT EXECUTE ON FUNCTION public.process_secondhand_purchase TO service_role;

COMMENT ON FUNCTION public.process_secondhand_purchase IS 'Müşteriden 2. el telefon alıp envantere ekleyen ve kasadan para çıkışı yapan fonksiyon';
