# Trunçgiller Staj Defteri — Telefon Mağazası ve Teknik Servis Yönetim Sistemi

> **Stajyer:** Kerim (Abdulkarim)  
> **Şirket:** Trunçgiller  
> **Staj Süresi:** 35 İş Günü  
> **Mentör / Şirket Sorumlusu:** Faruk Hoca  
> **Proje:** phone-store-management-system  
> **Metodoloji:** Scrumban (Scrum + Kanban)  

---

## 📅 Gün 1: Proje Başlangıcı, Dizin Yapısı ve Git İskeleti

- **Tarih:** 21 Eylül 2026
- **Konu:** Çözüm Mimarisi, Dizin Yapısı ve Repository Başlatma
- **Yapılan Çalışmalar:**
  - .NET 8 solution (`PhoneStoreManagement.sln`) ve katmanlı mimari (`PhoneStore.Core`, `PhoneStore.Infrastructure`, `PhoneStore.App`) oluşturuldu.
  - Native C++ modülü için `src/Native/include` başlık dizini eklendi.
  - Kapsamlı `.gitignore` dosyası hazırlanarak derleme çıktıları, geçici dosyalar ve SQLite veritabanı artefaktları versiyon kontrolü dışına alındı.
  - Proje vizyonunu, mimarisini ve 35 günlük faz yol haritasını içeren `README.md` hazırlandı.
- **Teknik Kazanım & Karşılaşılan Durumlar:**
  - Katmanlı mimaride bağımlılık yönlerinin tek taraflı (Core -> Infrastructure -> App) tutulmasının önemi pekiştirildi.
- **Referans:** `PR #42 (Commit: a0c3636, fc5de21)`

---

## 📅 Gün 2: Scrumban Panosu, Çalışma Standartları ve Git Akışı

- **Tarih:** 22 Eylül 2026
- **Konu:** Scrumban Süreçleri, WIP Limitleri ve Definition of Done (DoD)
- **Yapılan Çalışmalar:**
  - GitHub Projects üzerinde 5 kolonlu Scrumban panosu (`Backlog`, `Ready`, `In Progress`, `Review`, `Done`) tanımlandı.
  - WIP (Work In Progress) limitleri belirlendi: `In Progress` için en fazla 2 görev, `Review` için en fazla 2 PR.
  - Doğrudan `main` dalına push yasağı ve pull request (PR) inceleme kuralları dokümante edildi (`docs/SCRUMBAN_RULES.md`).
  - Görevlerin tamamlanma kriterlerini belirleyen Definition of Done (DoD) listesi çıkarıldı.
- **Teknik Kazanım & Karşılaşılan Durumlar:**
  - Kanban'ın çekme (pull) prensibinin darboğazları nasıl engellediği ve takım içi review döngüsünün kalitesini nasıl artırdığı kavrandı.
- **Referans:** `PR #42 (Commit: 10bf632)`

---

## 📅 Gün 3: C# .NET 8 Core Modelleri ve SQLite Altyapısı

- **Tarih:** 23 Eylül 2026
- **Konu:** Entity Framework Core, SQLite Entegrasyonu ve Benzersiz IMEI Doğrulama
- **Yapılan Çalışmalar:**
  - `Product`, `ImeiItem`, `Party`, `Sale`, `SaleItem`, `Repair` varlık modelleri (entities) C# ile tanımlandı.
  - `PhoneStoreDbContext` yapılandırılarak SQLite veritabanı bağlantısı kuruldu.
  - Fluent API ile `ImeiItem.ImeiNumber` alanı üzerinde veritabanı seviyesinde `UNIQUE` indeks tanımlandı.
  - CLI App üzerinden otomatik veritabanı oluşturma (`EnsureCreated`), örnek seed verileri yükleme ve mükerrer IMEI testi yazıldı.
- **Teknik Kazanım & Karşılaşılan Durumlar:**
  - SQLite üzerinde UNIQUE constraint ihlalinde fırlatılan `DbUpdateException` yakalanarak mükerrer giriş denemelerinde veri tutarlılığı sağlandı.
- **Referans:** `PR #42 (Commit: 3ae101d, 9ee9a6b, 81042fa, 6756c05)`

---

## 📅 Gün 4: Next.js 14 Web Mimarisi, Supabase SSR & Müşteri / Kasa (İşlem) Şeması

- **Tarih:** 24 Eylül 2026
- **Konu:** Next.js 14 App Router, Supabase SSR, Kullanıcı/Rol Yetkilendirme, IMEI Envanteri ve Müşteri & Kasa (İşlem) Veritabanı Mimarisi (Closes #43)
- **Yapılan Çalışmalar:**
  1. **Next.js 14 & UI Tasarım Sistemi:** Next.js 14 App Router projesi TypeScript ile oluşturuldu. Tailwind CSS ve Shadcn UI tasarım sistemi (`components.json`, `globals.css`, `button`, `card`, `badge`, `table`, `input`) entegre edildi.
  2. **Supabase SSR İstemcileri:** `@supabase/supabase-js` ve `@supabase/ssr` kurularak `utils/supabase/client.ts` (tarayıcı) ve `utils/supabase/server.ts` (çerez tabanlı sunucu istemcisi) yazıldı. `.env.local` ve `.env.example` şablonları hazırlandı.
  3. **Kullanıcılar ve Roller SQL Şeması:** `roles` (Admin, Personel) ve `profiles` tabloları, `auth.users` tetikleyicisi (`handle_new_user`), `updated_at` trigger'ı ve Row Level Security (RLS) politikaları yazıldı (`supabase/01_users_and_roles.sql`).
  4. **Kategoriler ve Ürünler SQL Şeması:** `categories` (Telefon, Aksesuar, Yedek Parça) ve `products` tabloları oluşturuldu. Telefonlar için 15 haneli benzersiz `imei` kolonu, kondisyon (`sıfır`/`ikinci el`), alış ve satış fiyatları ile stok takip alanları eklendi (`supabase/02_categories_and_products.sql`).
  5. **Müşteriler (Customers) & Cari Takip Şeması (Closes #43):** Müşteri adı, telefon (hızlı arama indeksi), T.C. Kimlik / Pasaport no, adres ve cari bakiye (borç/alacak takibi) alanlarını içeren `customers` tablosu kuruldu (`supabase/03_customers_and_transactions.sql`).
  6. **Kasa ve İşlemler (Transactions) Şeması (Closes #43):** Benzersiz fiş/işlem numarası (`transaction_number`), müşteri ilişkisi, işlem türü (`sale`, `purchase`, `return`, `repair_payment`), ödeme yöntemi (`cash`, `credit_card`, `bank_transfer`, `on_account`, `split`), brüt/net/ödenen tutar sütunları ile kasa hareketleri modellendi.
  7. **İşlem Detayları (Transaction_Items) Ara Tablosu (Closes #43):** Çoklu ürün satışı ve ikinci el alımları için `transaction_items` tablosu kurularak satılan cihazın 15 haneli IMEI numarası, adet ve anlık birim fiyatı bağlandı.
  8. **Master SQL & Seed Data:** Tek tıkla Supabase SQL Editor üzerinde tüm sistemi ayağa kaldıran `supabase/schema.sql` konsolide edildi; örnek müşteriler, cihaz satışları ve kasa kayıtları eklendi.
  9. **TypeScript Strongly-Typed Veritabanı Modelleri:** `types/database.ts` genişletilerek `Customer`, `Transaction`, `TransactionItem`, `TransactionWithDetails` ve `Database` tanımları eklendi.
  10. **Zengin İnteraktif Yönetim Paneli:** Envanter arama, IMEI/Barkod sorgulama, Kasa Ciro ve Tahsilat tablosu, Müşteri borç/alacak takibi ve SQL şema görüntüleyicisi içeren modern dashboard (`app/page.tsx`) geliştirildi.
  11. **Derleme ve Kod Standartları Doğrulaması:** `npm run build` ile tüm TypeScript kontrolleri ve statik sayfa derlemesi sıfır hata ve sıfır uyarı ile doğrulandı.
- **Teknik Kazanım & Karşılaşılan Durumlar:**
  - Supabase'in yeni SSR kütüphanesinde (`@supabase/ssr`) çerezlerin (cookies) sunucu bileşenlerinde güvenli şekilde nasıl yönetildiği deneyimlendi.
  - PostgreSQL üzerinde `CHECK (length(imei) = 15 AND imei ~ '^[0-9]+$')` ve kısmi unique index (`WHERE imei IS NOT NULL`) kullanılarak hem sadece telefonlar için IMEI zorunluluğu sağlandı hem de mükerrer IMEI girişleri engellendi.
  - Satış ve kasa işlemlerinde bire-çok (1:N) ve çoka-çok (M:N) ilişkisel veri modellemesi yapılarak `CASCADE` silme ve `RESTRICT` ürün koruma kuralları foreign key seviyesinde garantiye alındı.
  - Cari bakiye mantığında pozitif (+) değerlerin müşteri alacağı/avansı, negatif (-) değerlerin ise mağazaya olan veresiye borcu şeklinde standart muhasebe prensibiyle yönetilmesi sağlandı.
- **Referans:** `PR #75 (İlgili Görev: Day 4 Issue #43, feature/G4-supabase-nextjs-integration)`
