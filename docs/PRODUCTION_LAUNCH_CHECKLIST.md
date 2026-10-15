# 🚀 Telefon Mağazası Yönetim Sistemi - Canlıya Çıkış (Production Launch) & Manuel Kontrol Checklist'i

Bu doküman, **Telefon Mağazası Yönetim Sistemi**'nin canlı ortama (Vercel & Supabase Production) alınmasından hemen önce ve sonra gerçekleştirilmesi gereken son manuel uçtan uca (E2E) kontrol adımlarını, doğrulama kriterlerini ve acil durum prosedürlerini içerir.

---

## 📌 1. Dağıtım Öncesi (Pre-Deployment) Çevre & Güvenlik Kontrolleri

- [ ] **Ortam Değişkenleri (Environment Variables):**
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` canlı üretim URL'ine işaret ediyor mu?
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` doğru yapılandırılmış mı?
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` yalnızca güvenli sunucu tarafında tanımlı mı?
  - [ ] `SENTRY_AUTH_TOKEN` ve `NEXT_PUBLIC_SENTRY_DSN` aktif mi?
- [ ] **Veritabanı Hazırlığı (Supabase):**
  - [ ] `supabase/15_production_launch_cleanup.sql` script'i çalıştırılarak tüm test/sahte veriler temizlendi mi?
  - [ ] SuperAdmin hesabı (`admin@phonestore.com`) oluşturuldu mu?
  - [ ] Row Level Security (RLS) politikaları tüm 9 tabloda aktif mi?
  - [ ] Supabase Storage'daki `product-images` bucket'ı ve erişim kuralları doğrulandı mı?
- [ ] **Build & Derleme Testi:**
  - [ ] `npm run build` komutu yerelde sıfır hata ile tamamlandı mı? (22/22 sayfa derlendi)
  - [ ] `npm run lint` çıktısında hiçbir uyarı veya hata bulunmuyor mu?
  - [ ] `npx tsc --noEmit` tip denetimi hatasız geçti mi?

---

## 🔐 2. Kimlik Doğrulama & Yetkilendirme (Auth & RBAC) Kontrolleri

- [ ] **SuperAdmin Girişi:**
  - [ ] `admin@phonestore.com` ve belirlenen güçlü şifre ile `/login` sayfasından giriş yapılıyor mu?
  - [ ] Giriş sonrası kullanıcı otomatik olarak `/dashboard` sayfasına yönlendiriliyor mu?
  - [ ] Kullanıcı adı, rolü ('Admin') ve avatarı header/sidebar alanında doğru görünüyor mu?
- [ ] **Personel (Staff) Girişi ve Rota Koruması:**
  - [ ] Personel rolüne sahip bir kullanıcı sisteme giriş yapabiliyor mu?
  - [ ] Personel kullanıcısı yalnızca Admin'e açık olan `/dashboard/settings` sayfasına erişmeye çalıştığında **403 Unauthorized** sayfasına yönlendiriliyor mu?
  - [ ] Personel için sol menüde izin verilmeyen sekmelerin gizlendiği doğrulandı mı?
- [ ] **Oturum Güvenliği & Çıkış:**
  - [ ] Sayfa yenilendiğinde (F5) oturum düşmüyor, cookie üzerinden devam ediyor mu?
  - [ ] "Çıkış Yap" (Sign Out) butonuna basıldığında oturum çerezleri temizlenip kullanıcı `/login` sayfasına yönlendiriliyor mu?
  - [ ] Çıkış yapıldıktan sonra tarayıcı "Geri" tuşuna basıldığında dashboard'a erişim engelleniyor mu?

---

## 📦 3. Envanter & Ürün Yönetimi (Inventory) Kontrolleri

- [ ] **Ürün Ekleme & Validasyon:**
  - [ ] `/dashboard/inventory/new` sayfasından yeni bir akıllı telefon ekleme testi:
    - [ ] 15 haneli IMEI kontrolü (Luhn algoritması) hatalı numaraları engelliyor mu?
    - [ ] Alış fiyatı, satış fiyatı, KDV oranı ve stok miktarı doğru kaydediliyor mu?
    - [ ] Ürün görseli Supabase Storage'a yüklenip önizleme doğru geliyor mu?
- [ ] **Kritik Stok Uyarısı:**
  - [ ] Stoğu 10'un altına düşen bir ürün eklendiğinde/güncellendiğinde header'daki bildirim çanı (`StockAlertBell`) kırmızı uyarı rozetini gösteriyor mu?
  - [ ] Bildirime tıklandığında ilgili ürün envanter listesinde filtreleniyor mu?
- [ ] **Müşteri Vitrini (Storefront Gizliliği - `/`):**
  - [ ] Giriş yapmadan ana sayfa vitrini (`/`) açıldığında ürün listeleniyor mu?
  - [ ] **Kritik Gizlilik Denetimi:** Alış fiyatı, tedarikçi adı, IMEI ve işletme kâr marjı müşterilerden kesinlikle gizlenmiş mi? (Sadece satış fiyatı, marka, model ve stok durumu görünmeli).

---

## 💳 4. POS (Hızlı Satış Terminali) & Kasa Defteri Kontrolleri

- [ ] **Sepet & Arama:**
  - [ ] `/dashboard/pos` sayfasında ürün arama (barkod/isim/kategori) anlık sonuç veriyor mu?
  - [ ] Ürün sepete eklendiğinde stok adedi sınırına riayet ediliyor mu? (Mevcut stoktan fazlası eklenememeli).
  - [ ] İskonto (indirim) ve KDV hesaplamaları doğru çalışıyor mu?
- [ ] **Satış Tamamlama & Çapraz Senkronizasyon:**
  - [ ] Nakit veya Kredi Kartı ile satış tamamlandığında başarı bildirimi (Toast) çıkıyor mu?
  - [ ] Satılan ürünün stok miktarı anında Envanter sayfasında eksiliyor mu?
  - [ ] `/dashboard/transactions` (Kasa Defteri) sayfasına gidildiğinde yeni `INCOME` (Gelir) hareketi anında görünüyor mu?
- [ ] **Termal Fiş Yazdırma:**
  - [ ] Satış sonrası "Fiş Yazdır" butonuna basıldığında 80mm/58mm termal fiş önizleme penceresi hatasız açılıyor mu?

---

## 🔄 5. 2. El Cihaz Alım (Purchases) Akışı Kontrolleri

- [ ] **Cihaz Alım Formu:**
  - [ ] `/dashboard/purchases/new` sayfasından müşteriden cihaz alımı yapılıyor mu?
  - [ ] Müşteri T.C. Kimlik / Telefon, Cihaz Marka/Model, IMEI, Kozmetik Puan ve Batarya Sağlığı alanları eksiksiz dolduruluyor mu?
- [ ] **Finansal & Envanter Entegrasyonu:**
  - [ ] Müşteriye ödenen alım bedeli Kasa Defterine otomatik `EXPENSE` (Gider) olarak işleniyor mu?
  - [ ] Satın alınan cihaz otomatik olarak Envanter sistemine "2. El" kondisyonunda ve stok adedi 1 olarak ekleniyor mu?

---

## 🛠️ 6. Teknik Servis & Kanban Panosu Kontrolleri

- [ ] **Servis Fişi Oluşturma:**
  - [ ] `/dashboard/service/new` sayfasından cihaz arıza kaydı oluşturulabiliyor mu?
  - [ ] Müşteri şikayeti, cihaz şifresi, fiziksel hasar durumu ve tahmini maliyet kaydediliyor mu?
- [ ] **Kanban Panosu ve Kart Taşıma:**
  - [ ] Servis fişi `/dashboard/service` Kanban panosunda "Beklemede" sütununa düşüyor mu?
  - [ ] Kart "İncelemede" -> "Onarımda" -> "Teslimata Hazır" sütunlarına taşınırken durumu veri tabanına kalıcı olarak yazılıyor mu? (F5 yapılınca eski haline dönmemeli).
- [ ] **Cihaz Teslimi ve Tahsilat:**
  - [ ] Cihaz "Teslim Edildi" durumuna alındığında tahsil edilen onarım ücreti Kasa Defterine gelir olarak yansıtılıyor mu?

---

## 🔍 7. Global Arama & Arayüz (UI/UX) Standartları

- [ ] **Global Command Palette (`Ctrl + K`):**
  - [ ] Klavyeden `Ctrl + K` (veya Mac'te `Cmd + K`) basıldığında arama modali açılıyor mu?
  - [ ] Ürünler, müşteriler ve servis biletleri arasında hızlı gezinme çalışıyor mu?
- [ ] **Duyarlılık (Responsive Tasarım):**
  - [ ] Mobil ekranlarda (375px - 768px) hamburger menü, sepet çekmecesi ve tablolar taşma yapmadan okunabilir mi?
  - [ ] iPad / Tablet ve Geniş Ekran (1920px) testleri tamamlandı mı?
- [ ] **Koyu / Açık Tema (Dark Mode):**
  - [ ] Tema değişimi tüm bileşenlerde kontrast kaybı olmadan akıcı çalışıyor mu?

---

## 🚨 8. Canlıya Çıkış Sonrası (Post-Launch) İzleme & Acil Eylem Planı

- [ ] **Vercel Canlı URL Sağlık Kontrolü:**
  - [ ] Üretim alan adı (custom domain) SSL sertifikası geçerli mi? (`https://...`)
  - [ ] Core Web Vitals (LCP, FID, CLS) metrikleri yeşil bölgede mi?
- [ ] **Hata İzleme (Sentry):**
  - [ ] Sentry Dashboard üzerinde işlenmemiş bir istisna (unhandled runtime exception) var mı?
- [ ] **Geri Alma (Rollback) Prosedürü:**
  - [ ] Kritik bir hata durumunda Vercel paneli üzerinden bir önceki kararlı dağıtıma (Instant Rollback) dönme planı hazır mı?
