# Scrumban Proje Yönetimi ve Çalışma Kuralları (G2)

> **Proje:** phone-store-management-system  
> **Şirket:** Trunçgiller  
> **Metodoloji:** Scrumban (Scrum + Kanban Hibrit Çerçevesi)  
> **Mentör / Reviewer:** Faruk Hoca  
> **Stajyer Geliştirici:** Kerim  

---

## 1. Scrumban Yaklaşımı ve Amacı

Bu projede Scrum'ın faz/milestone odaklı planlama disiplini ile Kanban'ın sürekli akış ve **WIP (Work In Progress)** kısıtlama gücü birleştirilmiştir. 35 günlük staj süresince her günün görevi bağımsız, test edilebilir ve teslim edilebilir küçük parçalar halinde yönetilir.

---

## 2. Kanban Panosu Kolonları ve WIP Limitleri

GitHub Projects üzerinde kurulan `phone-store-management-system Board` panosu 5 ana kolondan oluşur:

| Kolon | WIP Limiti | Tanım & Kural |
| :--- | :---: | :--- |
| **1. Backlog** | $\infty$ (Sınırsız) | Planlanan tüm faz ve gün görevlerinin havuzu (G1 - G35). |
| **2. Ready** | En fazla **5** | Gereksinimleri netleşmiş, sıradaki fazda başlanmaya hazır görevler. |
| **3. In Progress** | En fazla **2** | Üzerinde aktif kodlama ve geliştirme yapılan görevler. |
| **4. Review** | En fazla **2** | Geliştirmesi bitmiş, PR'ı açılmış ve Faruk Hoca'nın incelemesini bekleyen görevler. |
| **5. Done** | $\infty$ (Sınırsız) | Faruk Hoca tarafından incelenip onaylanmış, `main`'e merge edilmiş tamamlanan görevler. |

### 📌 Pull (Çekme) Prensibi
- Görevler bir sonraki aşamaya "itilmez" (push edilmez); kapasite açıldıkça **"çekilir" (pull edilir)**.
- `In Progress` kolonunda 2 görev varken 3. bir göreve başlanamaz. Önce mevcut görev bitirilmeli veya engeli çözülmelidir.

---

## 3. Günlük Git & Pull Request (PR) İş Akışı

Şirket kuralları gereği doğrudan `main` dalına push yapmak yasaktır. Günlük iş akışı şu adımlarla yürütülür:

### Adım 1: Görevi Çekme ve Dal Açma
Günün görevi (örneğin G4) `Ready` kolonundan `In Progress` kolonuna çekilir.
```bash
git checkout main
git pull origin main
git checkout -b feature/GX-gorev-adi
```

### Adım 2: Atomik Commit Mantığı
Büyük ve tek bir commit yerine işin aşamalarını gösteren açıklayıcı commit'ler atılır:
- `feat(...)`: Yeni özellik ekleme
- `fix(...)`: Hata düzeltme
- `docs(...)`: Belgelendirme
- `test(...)`: Test yazımı ve doğrulama
- `refactor(...)`: Kod iyileştirmesi

### Adım 3: PR Açma ve Review Kolonuna Alma
İş tamamlandığında branch remote'a push edilir ve GitHub üzerinden PR açılır:
- **Hedef (Base):** `main`
- **Kaynak (Compare):** `feature/GX-gorev-adi`
- **Başlık:** `[GX] Görev Başlığı`
- **Açıklama:** İlgili issue numarası (`Closes #X`) ve yapılan işlemler listelenir.
- **Pano Hareketi:** Kart `In Progress`'ten `Review` kolonuna taşınır.
- **Reviewer:** `@FarukHoca` atanır.

### Adım 4: Merge ve Kapanış
Faruk Hoca PR'ı inceleyip onayladığında kod `main` dalına merge edilir.
- `Closes #X` etiketi sayesinde ilgili GitHub Issue otomatik olarak kapanır.
- Kart panoda **`Done`** kolonuna çekilir.

---

## 4. Definition of Done (DoD) — Bitti Tanımı

Bir görevin `Done` kabul edilebilmesi için aşağıdaki kriterleri sağlaması zorunludur:
1. İlgili günün kodunun sıfır hata/uyarı ile derlenmesi (`dotnet build`).
2. Gerekli birim veya konsol doğrulama testlerinin başarıyla çalışması.
3. Kodlama standartlarına ve isimlendirme kurallarına uyulması.
4. Kod tabanında gereksiz yorum satırları, kullanılmayan kütüphaneler veya geçici dosyaların bırakılmaması.
5. GitHub PR açıklamasının eksiksiz doldurulması ve Faruk Hoca tarafından onaylanması.
6. O günkü çalışmanın **Staj Defteri**ne işlenmiş olması.

---

## 5. Staj Defteri Doldurma Kılavuzu

Her günün staj defteri sayfası, o gün açılan Pull Request'in özeti ile birebir uyumlu olmalıdır. 

**Format Örneği:**
- **Tarih:** Günün tarihi
- **Konu:** Örneğin "C# SQLite Veritabanı ve IMEI Takip Altyapısının Kurulması"
- **Yapılan Çalışmalar:** PR açıklamasındaki maddeler (Modellerin oluşturulması, EF Core konfigürasyonu, Fluent API indeksleri).
- **Teknik Kazanım & Karşılaşılan Durumlar:** Karşılaşılan validasyon sorunları ve çözümü (Örn: Mükerrer IMEI girişinin SQLite UNIQUE constraint ile engellenmesi).
- **Referans:** `PR #X (Commit SHA: ...)`
