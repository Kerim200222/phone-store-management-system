-- ==============================================================================
-- 4. TELEFON MAĞAZASI YÖNETİM SİSTEMİ - TEKNİK SERVİS (REPAIR TICKETS) (SUPABASE)
-- Day 5: Teknik Servis Şeması (Closes #44)
-- ==============================================================================

-- Gerekli eklentilerin etkinleştirildiğinden emin olalım
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TEKNİK SERVİS KAYITLARI (REPAIR_TICKETS) TABLOSU
-- ------------------------------------------------------------------------------
-- Müşteri cihaz kabulü, arıza şikayeti, cihaz şifresi, durum takibi ve maliyet hesapları
CREATE TABLE IF NOT EXISTS public.repair_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Benzersiz Servis Takip / Fiş Numarası (Örn: SRV-20260925-001)
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    -- Cihaz Sahibi Müşteri Referansı
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    -- Cihaz Bilgileri
    device_brand VARCHAR(100) NOT NULL,
    device_model VARCHAR(100) NOT NULL,
    -- 15 Haneli IMEI Numarası (Telefonlar için doğrulama kurallı)
    imei VARCHAR(15),
    serial_number VARCHAR(100),
    -- Güvenlik & Kilit: Test ve kontrol amaçlı müşteri şifresi / PIN
    device_password VARCHAR(100),
    pattern_code VARCHAR(50),
    -- Cihazın Kabul Anındaki Fiziksel Kondisyonu (Çizikler, darbeler vb.)
    physical_condition TEXT,
    -- Birlikte Teslim Alınan Aksesuarlar (SIM Kart, Hafıza Kartı, Kılıf vb.)
    has_accessories TEXT,
    -- Müşteri Şikayeti / Arıza Beyanı
    issue_description TEXT NOT NULL,
    -- Teknisyen Teşhis ve Yapılan İşlem Notları
    technician_notes TEXT,
    -- Servis Durumu: bekliyor, islemde, tamamlandi, iade, teslim_edildi, iptal
    status VARCHAR(30) NOT NULL DEFAULT 'bekliyor' 
        CHECK (status IN ('bekliyor', 'islemde', 'tamamlandi', 'iade', 'teslim_edildi', 'iptal')),
    -- Maliyet & Fiyatlandırma (TL)
    estimated_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (estimated_cost >= 0),
    labor_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (labor_cost >= 0),
    parts_total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (parts_total_cost >= 0),
    actual_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (actual_cost >= 0),
    -- Kullanılan Yedek Parçalar (JSONB: [{ product_id, part_name, quantity, unit_price, total_price }])
    parts_used JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Atanan Teknisyen / Personel Referansı
    assigned_to UUID REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL,
    -- Tarih ve Zaman Damgaları
    completed_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

    -- 15 Haneli IMEI Format Kontrolü
    CONSTRAINT check_repair_imei_format CHECK (imei IS NULL OR (length(imei) = 15 AND imei ~ '^[0-9]+$'))
);

-- Tablo ve Kolon Açıklamaları
COMMENT ON TABLE public.repair_tickets IS 'Teknik servis arıza kabul, cihaz takip ve tamir kayıtları tablosu';
COMMENT ON COLUMN public.repair_tickets.ticket_number IS 'Teknik servis takip / barkod numarası';
COMMENT ON COLUMN public.repair_tickets.device_password IS 'Teknisyenin test yapabilmesi için cihaz ekran kilidi / PIN';
COMMENT ON COLUMN public.repair_tickets.status IS 'Servis aşaması: bekliyor, islemde, tamamlandi, iade, teslim_edildi';
COMMENT ON COLUMN public.repair_tickets.parts_used IS 'Kullanılan yedek parçaların JSONB formatında ayrıntılı listesi';
COMMENT ON COLUMN public.repair_tickets.estimated_cost IS 'Müşteriye verilen ilk tahmini tamir bedeli (TL)';
COMMENT ON COLUMN public.repair_tickets.actual_cost IS 'Tamamlama anındaki nihai işçilik + parça toplam tutarı (TL)';

-- ------------------------------------------------------------------------------
-- 2. TEKNİK SERVİS PARÇA DETAYLARI ARA TABLOSU (REPAIR_TICKET_PARTS)
-- ------------------------------------------------------------------------------
-- JSONB'ye ek olarak güçlü ilişkisel SQL raporlaması ve envanter düşümü için ara tablo
CREATE TABLE IF NOT EXISTS public.repair_ticket_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repair_ticket_id UUID NOT NULL REFERENCES public.repair_tickets(id) ON UPDATE CASCADE ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    part_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
    total_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_price >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.repair_ticket_parts IS 'Servis kaydında kullanılan yedek parçaların ilişkisel ara tablosu';

-- ------------------------------------------------------------------------------
-- 3. PERFORMANS VE ARAMA İNDEKSLERİ (INDEXES)
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_repair_tickets_customer_id ON public.repair_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_status ON public.repair_tickets(status);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_imei ON public.repair_tickets(imei) WHERE imei IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_repair_tickets_ticket_number ON public.repair_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_assigned_to ON public.repair_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_created_at ON public.repair_tickets(created_at DESC);

-- JSONB parts_used için GIN indeksi (Hızlı JSON içi parça sorguları)
CREATE INDEX IF NOT EXISTS idx_repair_tickets_parts_used_gin ON public.repair_tickets USING gin (parts_used);

-- Ara tablo indeksleri
CREATE INDEX IF NOT EXISTS idx_repair_ticket_parts_ticket_id ON public.repair_ticket_parts(repair_ticket_id);
CREATE INDEX IF NOT EXISTS idx_repair_ticket_parts_product_id ON public.repair_ticket_parts(product_id);

-- ------------------------------------------------------------------------------
-- 4. OTOMATİK ZAMAN DAMGASI (updated_at) TETİKLEYİCİSİ
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trigger_repair_tickets_updated_at ON public.repair_tickets;
CREATE TRIGGER trigger_repair_tickets_updated_at
    BEFORE UPDATE ON public.repair_tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 5. SERVİS VE MÜŞTERİ BİRLEŞİK GÖRÜNÜMÜ (VIEW: v_repair_tickets_summary)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_repair_tickets_summary AS
SELECT 
    rt.id,
    rt.ticket_number,
    rt.customer_id,
    c.full_name AS customer_name,
    c.phone AS customer_phone,
    rt.device_brand,
    rt.device_model,
    rt.imei,
    rt.device_password,
    rt.issue_description,
    rt.technician_notes,
    rt.status,
    rt.estimated_cost,
    rt.labor_cost,
    rt.parts_total_cost,
    rt.actual_cost,
    rt.parts_used,
    rt.assigned_to,
    p.full_name AS technician_name,
    rt.completed_at,
    rt.delivered_at,
    rt.created_at,
    rt.updated_at
FROM public.repair_tickets rt
LEFT JOIN public.customers c ON rt.customer_id = c.id
LEFT JOIN public.profiles p ON rt.assigned_to = p.id;

-- ------------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) GÜVENLİK POLİTİKALARI
-- ------------------------------------------------------------------------------
ALTER TABLE public.repair_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_ticket_parts ENABLE ROW LEVEL SECURITY;

-- Okuma Politikası: Giriş yapmış tüm personel servis kayıtlarını görüntüleyebilir
DROP POLICY IF EXISTS "Yetkili kullanıcılar servis kayıtlarını görebilir" ON public.repair_tickets;
CREATE POLICY "Yetkili kullanıcılar servis kayıtlarını görebilir"
    ON public.repair_tickets FOR SELECT
    TO authenticated
    USING (true);

-- Ekleme / Güncelleme Politikası: Personel ve Admin kayıt açıp güncelleyebilir
DROP POLICY IF EXISTS "Yetkili kullanıcılar servis kayıtlarını yönetebilir" ON public.repair_tickets;
CREATE POLICY "Yetkili kullanıcılar servis kayıtlarını yönetebilir"
    ON public.repair_tickets FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Ara Tablo RLS
DROP POLICY IF EXISTS "Yetkili kullanıcılar servis parçalarını görebilir" ON public.repair_ticket_parts;
CREATE POLICY "Yetkili kullanıcılar servis parçalarını görebilir"
    ON public.repair_ticket_parts FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Yetkili kullanıcılar servis parçalarını yönetebilir" ON public.repair_ticket_parts;
CREATE POLICY "Yetkili kullanıcılar servis parçalarını yönetebilir"
    ON public.repair_ticket_parts FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 7. BAŞLANGIÇ VERİLERİ (SEED DATA)
-- ------------------------------------------------------------------------------
INSERT INTO public.repair_tickets (
    id,
    ticket_number,
    customer_id,
    device_brand,
    device_model,
    imei,
    device_password,
    issue_description,
    physical_condition,
    has_accessories,
    technician_notes,
    status,
    estimated_cost,
    labor_cost,
    parts_total_cost,
    actual_cost,
    parts_used
)
VALUES
    -- 1. Ahmet Yılmaz - iPhone 13 Ekran Değişimi (İşlemde)
    (
        'r1111111-1111-1111-1111-111111111111',
        'SRV-20260925-001',
        'c1111111-1111-1111-1111-111111111111',
        'Apple',
        'iPhone 13',
        '354892091234567',
        '1907',
        'Cihaz sert zemine düştü. Ön cam ve iç OLED panel tamamen kırık, görüntü yok fakat ses ve titreşim geliyor.',
        'Kasa köşelerinde hafif ezik var, arka cam sağlam.',
        'Orijinal silikon kılıf teslim alındı.',
        'İç donanım incelendi, Face ID modülü sağlam. GX OLED ekran montajı devam ediyor.',
        'islemde',
        3200.00,
        750.00,
        2450.00,
        3200.00,
        '[{"part_name": "iPhone 13 GX OLED Ekran Paneli", "quantity": 1, "unit_price": 2450.00, "total_price": 2450.00}]'::jsonb
    ),
    -- 2. Fatma Kaya - Samsung Galaxy S21 Batarya Değişimi (Bekliyor)
    (
        'r2222222-2222-2222-2222-222222222222',
        'SRV-20260925-002',
        'c2222222-2222-2222-2222-222222222222',
        'Samsung',
        'Galaxy S21 5G',
        '359876098765432',
        '2468',
        'Batarya çok hızlı tükeniyor (1-2 saatte %100den %10a düşüyor) ve arka kapakta hafif şişme fark edildi.',
        'Arka kapakta batarya şişmesine bağlı 1mm açıklık mevcut.',
        'Aksesuar teslim alınmadı.',
        'Teşhis: Batarya ömrünü tamamlamış ve hücre şişmesi oluşmuş. Orijinal batarya temini bekleniyor.',
        'bekliyor',
        1450.00,
        450.00,
        1000.00,
        1450.00,
        '[{"part_name": "Samsung Galaxy S21 4000mAh Batarya", "quantity": 1, "unit_price": 1000.00, "total_price": 1000.00}]'::jsonb
    ),
    -- 3. Mehmet Öztürk - Xiaomi 12 Şarj Soketi Tamiri (Tamamlandı)
    (
        'r3333333-3333-3333-3333-333333333333',
        'SRV-20260925-003',
        'c3333333-3333-3333-3333-333333333333',
        'Xiaomi',
        'Xiaomi 12',
        '867543021984210',
        '0000',
        'Kablo oynatılmadığı sürece şarj almıyor, hızlı şarj devreye girmiyor.',
        'Temiz cihaz, ekranda koruyucu var.',
        'SIM kart ve kılıf müşteriye iade edildi.',
        'Type-C şarj soket bordu değiştirildi. 67W hızlı şarj ve veri aktarımı test edildi, başarıyla çalışıyor.',
        'tamamlandi',
        750.00,
        350.00,
        400.00,
        750.00,
        '[{"part_name": "Xiaomi 12 Type-C Şarj Alt Bordu", "quantity": 1, "unit_price": 400.00, "total_price": 400.00}]'::jsonb
    ),
    -- 4. Zeynep Çelik - Huawei P30 Sıvı Teması (İade)
    (
        'r4444444-4444-4444-4444-444444444444',
        'SRV-20260925-004',
        'c4444444-4444-4444-4444-444444444444',
        'Huawei',
        'P30 Pro',
        '869911223344556',
        '123456',
        'Denize düşürüldü, tuzlu su teması oldu. Cihaz hiçbir şekilde açılmıyor.',
        'Kozmetik temiz, sıvı göstergesi kırmızıya dönmüş.',
        'Kutu ve fatura teslim edildi.',
        'Ultrasonik banyoda yıkandı, anakart hatları incelendi. PMIC güç entegresi ve CPU hatları yanmış. Onarım maliyeti cihaz değerini aştığı için iade edildi.',
        'iade',
        4500.00,
        0.00,
        0.00,
        0.00,
        '[]'::jsonb
    )
ON CONFLICT (id) DO NOTHING;
