-- ==============================================================================
-- 6. TELEFON MAĞAZASI YÖNETİM SİSTEMİ - POS CHECKOUT & STOK DÜŞÜM TRANSACTION (SUPABASE)
-- Day 18: Satış İşlemini Tamamlama (Checkout), Kasa Kaydı, Sepet Kalemleri ve Stok Düşümü (Closes #57)
-- ==============================================================================

-- Bu fonksiyon POS ekranından gelen bir satışı tek bir ACID Transaction içinde işler:
-- 1) transactions tablosuna kasa satış kaydı açar.
-- 2) transaction_items tablosuna sepetteki tüm ürünleri (ve IMEI'leri) ekler.
-- 3) products tablosunda satılan her bir ürünün stok miktarını düşürür (stok 0'ın altına düşmez).
-- 4) Ödeme yöntemi 'on_account' (veresiye) ise seçili müşterinin cari borcunu artırır.
-- 5) Herhangi bir adımda hata olursa ROLLBACK ile tüm işlemi geri alır.

CREATE OR REPLACE FUNCTION public.process_pos_checkout(
    p_transaction_number VARCHAR,
    p_customer_id UUID DEFAULT NULL,
    p_payment_method VARCHAR DEFAULT 'cash',
    p_total_amount NUMERIC DEFAULT 0.00,
    p_discount_amount NUMERIC DEFAULT 0.00,
    p_net_amount NUMERIC DEFAULT 0.00,
    p_paid_amount NUMERIC DEFAULT 0.00,
    p_notes TEXT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL,
    p_items JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_transaction_id UUID;
    v_item RECORD;
    v_product_id UUID;
    v_quantity INT;
    v_unit_price NUMERIC;
    v_line_total NUMERIC;
    v_imei VARCHAR(15);
    v_item_notes TEXT;
    v_current_stock INT;
    v_product_name VARCHAR;
BEGIN
    -- 1. Parametre Kontrolleri
    IF p_net_amount < 0 THEN
        RAISE EXCEPTION 'Net satış tutarı negatif olamaz: %', p_net_amount;
    END IF;

    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Sepet boş olamaz. En az bir ürün bulunmalıdır.';
    END IF;

    -- 2. transactions Tablosuna Satış Kaydı Ekle
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
        'sale',
        p_payment_method,
        p_total_amount,
        p_discount_amount,
        p_net_amount,
        p_paid_amount,
        'completed',
        p_notes,
        p_created_by
    )
    RETURNING id INTO v_transaction_id;

    -- 3. Sepetteki Kalemleri İşle (transaction_items ve Stok Düşümü)
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_id UUID,
        quantity INT,
        unit_price NUMERIC,
        total_price NUMERIC,
        imei VARCHAR,
        notes TEXT
    )
    LOOP
        v_product_id := v_item.product_id;
        v_quantity   := COALESCE(v_item.quantity, 1);
        v_unit_price := COALESCE(v_item.unit_price, 0.00);
        v_line_total := COALESCE(v_item.total_price, (v_quantity * v_unit_price));
        v_imei       := v_item.imei;
        v_item_notes := v_item.notes;

        -- Ürün mevcut mu ve stok kontrolü
        SELECT stock_quantity, name INTO v_current_stock, v_product_name
        FROM public.products
        WHERE id = v_product_id
        FOR UPDATE; -- Eşzamanlı satışlarda Race Condition engelleme

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Satılmak istenen ürün bulunamadı (ID: %)', v_product_id;
        END IF;

        IF v_current_stock < v_quantity THEN
            RAISE EXCEPTION 'Yetersiz stok! Ürün: "%", Mevcut: %, İstenen: %', 
                v_product_name, v_current_stock, v_quantity;
        END IF;

        -- 3.a. transaction_items Tablosuna Kayıt Ekle
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
            v_imei,
            v_quantity,
            v_unit_price,
            v_line_total,
            v_item_notes
        );

        -- 3.b. products Tablosunda Stok Düşümü
        UPDATE public.products
        SET 
            stock_quantity = GREATEST(0, stock_quantity - v_quantity),
            updated_at = timezone('utc'::text, now())
        WHERE id = v_product_id;

    END LOOP;

    -- 4. Veresiye (on_account) Satış Durumunda Müşteri Bakiyesini Güncelle
    -- Negatif bakiye mağazaya borç demektir
    IF p_payment_method = 'on_account' AND p_customer_id IS NOT NULL THEN
        UPDATE public.customers
        SET 
            balance = balance - p_net_amount,
            updated_at = timezone('utc'::text, now())
        WHERE id = p_customer_id;
    END IF;

    -- 5. Başarılı Sonuç Döndür
    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_transaction_id,
        'transaction_number', p_transaction_number,
        'net_amount', p_net_amount,
        'items_count', jsonb_array_length(p_items)
    );

EXCEPTION
    WHEN OTHERS THEN
        -- Otomatik ROLLBACK tetiklenir
        RAISE EXCEPTION 'POS Checkout Hatası: % (Hata Kodu: %)', SQLERRM, SQLSTATE;
END;
$$;

-- Fonksiyon İzinleri
GRANT EXECUTE ON FUNCTION public.process_pos_checkout TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_pos_checkout TO anon;
GRANT EXECUTE ON FUNCTION public.process_pos_checkout TO service_role;

COMMENT ON FUNCTION public.process_pos_checkout IS 'POS satış işlemini atomik olarak tamamlayan ve stok düşen PostgreSQL fonksiyonu';
