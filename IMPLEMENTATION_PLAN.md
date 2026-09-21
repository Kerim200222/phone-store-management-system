# phone-store-management-system — Ana Uygulama Planı (Master Implementation Plan)

> **Proje adı:** phone-store-management-system  
> **Tam adı:** Telefon Mağazası ve Teknik Servis Yönetim Sistemi  
> **Süre:** 20 iş günü (4 Faz / Milestone)  
> **SDLC:** Agile → **Scrumban** (WIP Limitleri + Pull Prensibi)  
> **Teknolojiler:** C# | C++ | HTML | Antigravity Framework  

---

## İçindekiler
1. [Yönetici Özeti](#1-yönetici-özeti)
2. [Problem, Vizyon ve Başarı Kriterleri](#2-problem-vizyon-ve-başarı-kriterleri)
3. [Scrumban Proje Yönetimi](#3-scrumban-proje-yönetimi)
4. [Sistem Mimarisi](#4-sistem-mimarisi)
5. [Veri Modeli ve Veritabanı Şeması](#5-veri-modeli-ve-veritabanı-şeması)
6. [20 Günlük Görev Listesi (G1–G20)](#6-20-günlük-görev-listesi-g1g20)

---

## 1. Yönetici Özeti
Bu proje, telefon mağazalarının günlük operasyonlarını (stok, IMEI, satış, teknik servis, borç/alacak) tek bir merkezden yürütmelerini sağlayan hibrit (C# / C++ / HTML / Antigravity) bir masaüstü yazılımıdır.

---

## 2. Problem, Vizyon ve Başarı Kriterleri

### 2.1 Problem
- Telefonların benzersiz IMEI numaralarının takibinde yaşanan hatalar.
- Teknik servis süreçlerinin ve kullanılan yedek parçaların karmaşıklığı.
- Barkod okuyucu ve termal yazıcı entegrasyonundaki performans kayıpları.

### 2.2 Vizyon
İnternet bağlantısına ihtiyaç duymadan (Offline-First), son derece hızlı, IMEI odaklı ve kullanıcı dostu bir yönetim sistemi sunmak.

### 2.3 Başarı Kriterleri
1. Mükerrer IMEI girişinin veritabanı seviyesinde engellenmesi.
2. Teknik servis cihaz durumlarının (Alındı → Tamirde → Hazır → Teslim Edildi) adım adım takibi.
3. Barkod okuma ve arama süresinin < 200ms olması.
4. Fatura ve fiş çıktılarının HTML/C++ köprüsü ile sorunsuz yazdırılması.

---

## 3. Scrumban Proje Yönetimi

Proje **Scrumban** yöntemi ile yönetilir:
- **WIP Limiti**: `In Progress` kolonunda aynı anda en fazla **2** görev bulunabilir.
- **Pull Prensibi**: İş kapasitesi açıldıkça görevler `Ready` kolonundan çekilir.
-
┌─────────┬─────────┬────────────────┬─────────┬─────────┐
│ Backlog │ Ready   │ In Progress    │ Review  │ Done    │
│ (WIP ∞) │ (WIP≤5) │ (WIP≤2)        │ (WIP≤2) │ (∞)     │
└─────────┴─────────┴───────┬────────┴─────────┴─────────┘ 

## 4. Sistem Mimarisi

- **Antigravity UI (HTML/CSS/JS)**: Kullanıcı arayüzü sunumu.
- **C# Backend Core**: İş mantığı, SQLite ORM/Repository, Antigravity Köprüsü.
- **C++ Native Engine**: Donanım erişimi (Termal Yazıcı, Barkod Okuyucu P/Invoke).

---

## 5. Veri Modeli ve Veritabanı Şeması (SQLite)

1. `products`: id, name, category, brand, min_stock
2. `items_imei`: id, product_id, imei_number (UNIQUE), status, purchase_price, sale_price
3. `sales` & `sale_items`: id, customer_id, total_amount, discount, paid_amount, created_at
4. `repairs`: id, customer_id, device_model, imei, problem_description, status, final_cost
5. `parties`: id, name, phone, type (Customer/Supplier), balance

---

## 6. 20 Günlük Görev Listesi (G1 – G20)

### Faz 1 — Foundation (Gün 1–5)
- [x] **G1**: Proje dizin yapısının ve Git deposunun oluşturulması.
- [ ] **G2**: Scrumban panosunun ve WIP kurallarının hazırlanması.
- [x] **G3**: C# altyapısının ve SQLite veritabanı bağlantısının kurulması.
- [ ] **G4**: C++ DLL köprüsünün (P/Invoke) hazırlanması.
- [ ] **G5**: Antigravity üzerinden ilk HTML arayüz görünümünün bağlanması.

### Faz 2 — Inventory & IMEI (Gün 6–10)
- [ ] **G6**: Ürün ve kategori yönetim modülü (C# / SQLite).
- [ ] **G7**: IMEI takip modülü ve mükerrerlik engelleme mantığı.
- [ ] **G8**: Tedarikçi yönetimi ve stok giriş (Alış) işlemleri.
- [ ] **G9**: Stok arama ve hızlı filtreleme arayüzü (HTML).
- [ ] **G10**: C++ barkod okuyucu dinleyici entegrasyonu.

### Faz 3 — Sales POS & Repair (Gün 11–15)
- [ ] **G11**: Hızlı satış (POS) HTML arayüzü.
- [ ] **G12**: Satış tamamlama, indirim ve hesaplama C# mantığı.
- [ ] **G13**: Teknik servis kayıt ve cihaz durum takip sistemi.
- [ ] **G14**: Servis maliyet ve kullanılan yedek parça düşüm hesabı.
- [ ] **G15**: HTML/C++ destekli fatura/fiş yazdırma altyapısı.

### Faz 4 — Polish & Package (Gün 16–20)
- [ ] **G16**: Yönetici Paneli (Dashboard) ve finansal raporlar (Kâr/Zarar).
- [ ] **G17**: Müşteri cari hesap ve borç/alacak takip modülü.
- [ ] **G18**: HTML arayüzünün CSS ve kullanıcı deneyimi iyileştirmeleri.
- [ ] **G19**: C# ve C++ birim/entegrasyon testlerinin yazılması.
- [ ] **G20**: Uygulamanın paketlenmesi, `.exe` oluşturulması ve README güncellemesi
