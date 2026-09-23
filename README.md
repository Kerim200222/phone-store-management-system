# Phone Store Management System (Telefon Mağazası ve Teknik Servis Yönetim Sistemi)

[![.NET 8](https://img.shields.io/badge/.NET-8.0-blue.svg)](https://dotnet.microsoft.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Offline--First-green.svg)](https://www.sqlite.org/)
[![C++ Native](https://img.shields.io/badge/C%2B%2B-Native%20Bridge-purple.svg)]()
[![Agile / Scrumban](https://img.shields.io/badge/Methodology-Scrumban-orange.svg)]()

Telefon mağazaları ve teknik servisler için özel olarak tasarlanmış; donanım entegrasyonlu (barkod okuyucu ve termal fiş yazıcı), benzersiz IMEI takipli, hızlı satış (POS), cari hesap ve tamir yönetim sistemidir.

Proje, **Trunçgiller** bünyesindeki 35 günlük staj programı kapsamında **Scrumban** metodolojisi, katmanlı mimari ve kurumsal Git/PR iş akışları ile geliştirilmektedir.

---

## 🚀 Öne Çıkan Özellikler

- **IMEI Odaklı Stok Takibi:** Her cihaza ait 15 haneli benzersiz IMEI numarası veritabanı seviyesinde `UNIQUE` indeks ile güvenceye alınır; mükerrer giriş engellenir.
- **Hızlı Satış (POS):** Barkod tarayıcı destekli hızlı sepet, anlık indirim ve nakit/kart/veresiye tahsilat yönetimi.
- **Teknik Servis Yaşam Döngüsü:** Cihaz kabulü, arıza tespiti, durum akışı (`Kayıt Alındı` → `İncelemede` → `Tamirde` → `Hazır` → `Teslim Edildi`), parça düşümü ve servis teslim fişi.
- **Müşteri ve Tedarikçi Cari Hesapları:** Borç/alacak takibi, veresiye defteri ve cari ekstreler.
- **Donanım Köprüsü (C++ P/Invoke):** Termal yazıcılar için ESC/POS komutları ve barkod okuyucu dinleyicisi için optimize edilmiş native katman.
- **Offline-First:** İnternet kesintilerinde operasyonun aksamaması için yerel SQLite veritabanı altyapısı.

---

## 🛠️ Mimari ve Teknolojiler

| Katman | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Kullanıcı Arayüzü** | Antigravity UI / HTML5, CSS3, JS | Modern, hızlı ve responsive masaüstü görünümü |
| **Backend Çekirdek** | C# (.NET 8) | Domain modelleri, iş mantığı, validasyonlar |
| **Veri Katmanı** | Entity Framework Core & SQLite | Offline-first, ilişkisel veri modeli ve migration desteği |
| **Donanım Katmanı** | C++ Native DLL / P-Invoke | Barkod okuyucu ve termal fiş yazıcı haberleşmesi |
| **Proje Yönetimi** | GitHub Projects (Scrumban) | WIP limitleri, günlük PR döngüsü ve milestone takibi |

---

## 📁 Proje Dizin Yapısı

```text
phone-store-management-system/
├── src/
│   ├── Backend/
│   │   ├── PhoneStore.Core/            # Varlıklar, Modeller, Enum'lar
│   │   ├── PhoneStore.Infrastructure/  # DbContext, SQLite Konfigürasyonu, Veri Besleme
│   │   └── PhoneStore.App/             # CLI Yürütücü ve Doğrulama Uygulaması
│   ├── Native/
│   │   └── include/                    # C++ Donanım Köprüsü (P/Invoke) Başlıkları
│   └── Frontend/                       # Antigravity HTML/CSS/JS Arayüz Varlıkları
├── docs/                               # Scrumban Kuralları, Mimari Belgeleri ve Staj Günlüğü
├── PhoneStoreManagement.sln            # Visual Studio / .NET 8 Çözüm Dosyası
├── IMPLEMENTATION_PLAN.md              # 35 Günlük Detaylı Yol Haritası
└── README.md
```

---

## 📦 Kurulum ve Çalıştırma

### Gereksinimler
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- Git

### 1. Repoyu Klonlayın
```bash
git clone https://github.com/Kerim200222/phone-store-management-system.git
cd phone-store-management-system
```

### 2. Projeyi Derleyin
```bash
dotnet build PhoneStoreManagement.sln
```

### 3. Uygulamayı ve Veritabanı Testini Çalıştırın
```bash
dotnet run --project src/Backend/PhoneStore.App
```
*Bu komut yerel `phonestore.db` SQLite veritabanını otomatik olarak oluşturur, şemayı doğrular ve örnek ürün/IMEI verilerini yükler.*

---

## 📅 35 Günlük Staj Takvimi & Fazlar

Proje 5'er günlük 7 faza (toplam 35 gün) ayrılmıştır:
- **Faz 1 (G1–G5):** Foundation & Setup
- **Faz 2 (G6–G10):** Bridge & Core Architecture
- **Faz 3 (G11–G15):** Products & IMEI Engine
- **Faz 4 (G16–G20):** Stock & Hardware Integration
- **Faz 5 (G21–G25):** POS Sales & Receipt Engine
- **Faz 6 (G26–G30):** Repair Center & Service Logic
- **Faz 7 (G31–G35):** Reports, Polish & Delivery

*Tüm detaylar için [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) ve [docs/SCRUMBAN_RULES.md](docs/SCRUMBAN_RULES.md) dosyalarını inceleyebilirsiniz.*

---

## 🤝 Katkı & Staj İş Akışı

1. `main` dalına doğrudan commit atılamaz.
2. Her günün görevi için `feature/GX-...` dalı açılır.
3. Gün sonunda `main` hedefine Pull Request oluşturulur ve şirket mentörünün (`Faruk Hoca`) incelemesine sunulur.
