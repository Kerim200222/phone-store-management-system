# phone-store-management-system — Ana Uygulama Planı (Master Implementation Plan)

> **Proje adı:** phone-store-management-system  
> **Tam adı:** Telefon Mağazası ve Teknik Servis Yönetim Sistemi  
> **Şirket:** Trunçgiller  
> **Süre:** 35 iş günü (7 Faz / Milestone)  
> **SDLC:** Agile → **Scrumban** (WIP Limitleri + Pull Prensibi)  
> **Teknolojiler:** C# (.NET 8) | SQLite | C++ Native DLL | Antigravity Framework (HTML/CSS/JS)  

---

## İçindekiler
1. [Yönetici Özeti](#1-yönetici-özeti)
2. [Problem, Vizyon ve Başarı Kriterleri](#2-problem-vizyon-ve-başarı-kriterleri)
3. [Scrumban Proje Yönetimi](#3-scrumban-proje-yönetimi)
4. [Sistem Mimarisi](#4-sistem-mimarisi)
5. [Veri Modeli ve Veritabanı Şeması](#5-veri-modeli-ve-veritabanı-şeması)
6. [35 Günlük Görev Listesi (G1–G35)](#6-35-günlük-görev-listesi-g1g35)

---

## 1. Yönetici Özeti
Bu proje, telefon satışı ve teknik servis faaliyeti yürüten işletmelerin donanım entegrasyonlu (termal yazıcı, barkod okuyucu), IMEI odaklı ve offline-first bir mimaride operasyonlarını yönetmelerini sağlar. 35 günlük staj süresince katmanlı mimari (.NET Core, SQLite, C++ Native, Antigravity UI) ve Scrumban ilkeleriyle hayata geçirilmektedir.

---

## 2. Problem, Vizyon ve Başarı Kriterleri

### 2.1 Problem
- 15 haneli IMEI numaralarının mükerrer girişi ve satış/iade süreçlerindeki karmaşıklık.
- Teknik servis kabulü, tamir aşamaları, yedek parça düşümü ve maliyet hesaplarındaki düzensizlik.
- Donanım (Barkod okuyucu ve termal fiş basıcı) seviyesindeki gecikmeler ve sürücü uyumsuzlukları.

### 2.2 Vizyon
İnternet bağımlılığı olmaksızın (Offline-First), son derece kararlı, mikro saniye düzeyinde IMEI doğrulayan, modern ve kullanıcı dostu bir masaüstü çözümü.

### 2.3 Başarı Kriterleri
1. Mükerrer IMEI girişinin veritabanında `UNIQUE` indeks ile engellenmesi.
2. Barkod tarama ve cihaz aramasının < 100ms sürmesi.
3. Teknik servis aşamalarının (Kabul → İnceleme → Tamirde → Hazır → Teslim) izlenebilir olması.
4. C++ köprüsü ile termal fiş/fatura çıktılarının doğrudan yazıcıya iletilmesi.

---

## 3. Scrumban Proje Yönetimi

Proje GitHub Projects üzerinde **Scrumban** panosu ile takip edilir:
- **WIP Limiti**: `In Progress` kolonunda aynı anda en fazla **2** görev bulunabilir.
- **Review Limiti**: `Review` kolonunda en fazla **2** PR bekleyebilir.
- **Pull Prensibi**: Günlük iş kapasitesi açıldıkça görevler `Ready` kolonundan çekilir.

```text
┌─────────┬─────────┬────────────────┬─────────┬─────────┐
│ Backlog │ Ready   │ In Progress    │ Review  │ Done    │
│ (WIP ∞) │ (WIP≤5) │ (WIP≤2)        │ (WIP≤2) │ (∞)     │
└─────────┴─────────┴────────────────┴─────────┴─────────┘
```

---

## 4. Sistem Mimarisi

- **Antigravity UI (HTML5 / Modern CSS / Vanilla JS)**: Masaüstü penceresinde çalışan duyarlı ve şık kullanıcı arayüzü.
- **C# .NET 8 Backend Core**: Domain modelleri, iş kuralları, SQLite Entity Framework Core altyapısı.
- **C++ Native Engine**: Termal yazıcılar için ESC/POS komutları ve barkod okuyucu dinleyicisi (P/Invoke).

---

## 5. Veri Modeli ve Veritabanı Şeması (SQLite)

1. `products`: `Id`, `Name`, `Category`, `Brand`, `Barcode`, `MinStockLevel`, `CreatedAt`
2. `items_imei`: `Id`, `ProductId`, `ImeiNumber` (**UNIQUE INDEX**), `Status`, `PurchasePrice`, `SalePrice`, `CreatedAt`
3. `parties`: `Id`, `Name`, `Phone`, `Email`, `Address`, `Type` (Customer/Supplier), `Balance`, `CreatedAt`
4. `sales`: `Id`, `CustomerId`, `TotalAmount`, `DiscountAmount`, `PaidAmount`, `PaymentMethod`, `CreatedAt`
5. `sale_items`: `Id`, `SaleId`, `ProductId`, `ImeiItemId`, `Quantity`, `UnitPrice`, `TotalPrice`
6. `repairs`: `Id`, `CustomerId`, `DeviceModel`, `ImeiNumber`, `IssueDescription`, `Status`, `LaborCost`, `TotalCost`, `CreatedAt`, `DeliveredAt`

---

## 6. 35 Günlük Görev Listesi (G1 – G35)

### Faz 1 — Foundation & Setup (Gün 1–5)
- [x] **G1 (#7)**: Repo ve dizin yapısının oluşturulması (.NET 8 solution, klasör iskeleti, .gitignore).
- [x] **G2 (#8)**: Scrumban panosunun kurulması, WIP kuralları ve PR iş akış dokümantasyonu.
- [x] **G3 (#9)**: C# altyapısının ve SQLite veritabanı bağlantısının kurulması (EF Core, modeller, seed).
- [ ] **G4 (#10)**: C++ DLL köprü hazırlığı (P/Invoke tanımları ve native stub yapısı).
- [ ] **G5 (#11)**: Antigravity üzerinden ilk HTML arayüz görünümünün bağlanması.

### Faz 2 — Bridge & Core Architecture (Gün 6–10)
- [ ] **G6 (#12)**: Ürün ve kategori yönetim modülü (C# / SQLite CRUD).
- [ ] **G7 (#13)**: IMEI takip modülü ve mükerrerlik engelleme mantığı.
- [ ] **G8 (#14)**: Tedarikçi yönetimi ve stok giriş (satın alma) işlemleri.
- [ ] **G9 (#15)**: Stok arama ve hızlı filtreleme arayüzü (HTML/CSS).
- [ ] **G10 (#16)**: C++ barkod okuyucu dinleyici entegrasyonu.

### Faz 3 — Products & IMEI Engine (Gün 11–15)
- [ ] **G11 (#17)**: Hızlı satış (POS) HTML arayüzü tasarımı.
- [ ] **G12 (#18)**: Satış tamamlama, sepet yönetimi ve hesaplama mantığı.
- [ ] **G13 (#19)**: HTML/C++ destekli fatura ve fiş yazdırma altyapısı.
- [ ] **G14 (#20)**: Teknik servis kayıt ve cihaz durum takip sistemi.
- [ ] **G15 (#21)**: Servis maliyeti ve kullanılan yedek parça düşüm hesabı.

### Faz 4 — Stock & Hardware Integration (Gün 16–20)
- [ ] **G16 (#22)**: Yönetici paneli (Dashboard) ve finansal özet göstergeleri.
- [ ] **G17 (#23)**: Müşteri cari hesap ve borç/alacak takip modülü.
- [ ] **G18 (#24)**: HTML arayüzünün modern CSS ve UI/UX iyileştirmeleri.
- [ ] **G19 (#25)**: C# ve C++ birim ve entegrasyon testlerinin yazılması.
- [ ] **G20 (#26)**: Uygulamanın paketlenmesi (.exe) ve ara sürüm dokümantasyonu.

### Faz 5 — POS Sales & Receipt Engine (Gün 21–25)
- [ ] **G21 (#27)**: Gelişmiş POS kasa arayüzü ve kısayol tuşları.
- [ ] **G22 (#28)**: POS sepet yönetimi, promosyon ve indirim hesaplamaları.
- [ ] **G23 (#29)**: Satış tamamlama, tahsilat (nakit/kart/veresiye) ve stoktan otomatik düşüm.
- [ ] **G24 (#30)**: HTML şablon tabanlı fatura/fiş tasarımı ve önizleme.
- [ ] **G25 (#31)**: C++ termal yazıcı sürücüsü ve doğrudan yazdırma köprüsü.

### Faz 6 — Repair Center & Service Logic (Gün 26–30)
- [ ] **G26 (#32)**: Teknik servis cihaz kabul arayüzü ve arıza kayıt formu.
- [ ] **G27 (#33)**: Cihaz durum takip iş akışı (Status Workflow).
- [ ] **G28 (#34)**: Servis işçilik ve tamir maliyeti hesabı.
- [ ] **G29 (#35)**: Serviste kullanılan yedek parçaların stoktan düşülmesi.
- [ ] **G30 (#36)**: Teknik servis formu ve cihaz teslim fişi çıktısı.

### Faz 7 — Reports, Polish & Delivery (Gün 31–35)
- [ ] **G31 (#37)**: Yönetici kontrol paneli (Dashboard) analiz grafikleri.
- [ ] **G32 (#38)**: Finansal kâr/zarar, stok değerleme ve günlük ciro raporları.
- [ ] **G33 (#39)**: Müşteri ve tedarikçi cari hesap (borç/alacak) modülü.
- [ ] **G34 (#40)**: UI/UX iyileştirmeleri, geçiş animasyonları ve hız optimizasyonları.
- [ ] **G35 (#41)**: Kapsamlı testler, nihai .exe paketi, kullanıcı kılavuzu ve staj teslimi.
