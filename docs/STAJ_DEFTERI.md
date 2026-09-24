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

## 📅 Gün 4: Next.js 14 Web Mimarisi, Supabase SSR & SQL Veritabanı Şeması

- **Tarih:** 24 Eylül 2026
- **Konu:** Next.js 14 App Router, Supabase JS Client & SSR, Kullanıcı/Rol Yetkilendirme ve IMEI Envanter Şeması
- **Yapılan Çalışmalar:**
  1. **Next.js 14 & UI Altyapısı:** Next.js 14 App Router projesi oluşturuldu. Tailwind CSS ve Shadcn UI tasarım sistemi (`components.json`, `globals.css`, `button`, `card`, `badge`, `table`, `input`) entegre edildi.
  2. **Supabase SSR İstemcileri:** `@supabase/supabase-js` ve `@supabase/ssr` kurularak `utils/supabase/client.ts` (tarayıcı) ve `utils/supabase/server.ts` (çerez tabanlı sunucu istemcisi) yazıldı. `.env.local` şablonu oluşturuldu.
  3. **Kullanıcılar ve Roller SQL:** `roles` (Admin, Personel) ve `profiles` tabloları, `auth.users` tetikleyicisi (`handle_new_user`), `updated_at` trigger'ı ve Row Level Security (RLS) politikaları yazıldı (`supabase/01_users_and_roles.sql`).
  4. **Ürünler ve Kategoriler SQL:** `categories` (Telefon, Aksesuar, Yedek Parça) ve `products` tabloları oluşturuldu. Telefonlar için 15 haneli benzersiz `imei` kolonu, kondisyon (`sıfır`/`ikinci el`), alış ve satış fiyatları ile stok takip alanları eklendi (`supabase/02_categories_and_products.sql` ve `supabase/schema.sql`).
  5. **TypeScript Veritabanı Arayüzleri:** `types/database.ts` dosyası oluşturularak Supabase şemasıyla birebir uyumlu strongly-typed TypeScript arayüzleri (`Role`, `Profile`, `Category`, `Product`, `ProductWithCategory`) tanımlandı.
  6. **İnteraktif Yönetim Paneli:** Envanter arama, kategori ve IMEI filtreleme, kar marjı hesaplama ve SQL şema önizleme özelliklerine sahip modern Next.js gösterge paneli (`app/page.tsx`) kodlandı.
  7. **Derleme Doğrulaması:** `npm run build` ile tüm TypeScript kontrolleri ve statik sayfa derlemesi sıfır hata ile doğrulandı.
- **Teknik Kazanım & Karşılaşılan Durumlar:**
  - Supabase'in yeni SSR kütüphanesinde (`@supabase/ssr`) çerezlerin (cookies) sunucu bileşenlerinde güvenli şekilde nasıl yönetildiği deneyimlendi.
  - PostgreSQL üzerinde `CHECK (length(imei) = 15 AND imei ~ '^[0-9]+$')` ve kısmi unique index (`WHERE imei IS NOT NULL`) kullanılarak hem sadece telefonlar için IMEI zorunluluğu sağlandı hem de mükerrer IMEI girişleri engellendi.
  - Next.js 14 App Router altında güçlü tip güvenliği için Supabase jenerik tiplerinin (`createBrowserClient<Database>`) entegrasyonu sağlandı.
- **Referans:** `PR #43 (feature/G4-supabase-nextjs-integration)`
