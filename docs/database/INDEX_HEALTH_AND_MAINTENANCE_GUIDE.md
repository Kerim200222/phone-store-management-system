# 📊 PostgreSQL İndeks Sağlığı, Şişme (Bloat) ve Bakım Kılavuzu

Bu kılavuz; Telefon Mağazası Yönetim Sistemi veritabanında yüksek frekanslı veri akışlarında (Barkod/IMEI arama, POS satışları, teknik servis bilet güncellemeleri) veritabanı performansını en üst seviyede tutmak için tasarlanmış izleme ve bakım protokollerini içerir.

---

## 1. İndeks Şişmesi (Index Bloat) Nedir?
PostgreSQL'in MVCC (Multi-Version Concurrency Control) mimarisi gereği, bir satır güncellendiğinde (`UPDATE`) veya silindiğinde (`DELETE`), eski satır fiziksel olarak anında silinmez, "ölü satır" (dead tuple) olarak kalır. Yoğun yazma işlemlerinde B-Tree ve GIN indeksleri ölü referanslarla şişerek gereksiz disk ve bellek (shared buffers) kaplar.

### Olası Etkileri:
- İndeks arama süresinin uzaması (daha fazla disk/sayfa okuma - buffer misses).
- RAM önbelleğinin (cache) şişmiş indeks bloklarıyla dolması.
- Disk alanının tükenmesi.

---

## 2. İzleme Görünümü (`public.vw_index_health`)

Tüm indekslerin sağlık durumunu anlık olarak listelemek için aşağıdaki SQL çalıştırılır:

```sql
SELECT 
    table_name,
    index_name,
    index_size_pretty,
    table_size_pretty,
    total_index_scans,
    health_status,
    recommended_action
FROM public.vw_index_health;
```

### Sağlık Durumu Değerleri:
| Durum | Açıklama | Alınacak Aksiyon |
|---|---|---|
| `HEALTHY` | İndeks verimli kullanılıyor ve boyutu dengeli. | Aksiyon gerekmez. |
| `BLOATED_CANDIDATE` | İndeks boyutu tablo boyutunun %80'ini aşmış. | Rutin bakımda `REINDEX CONCURRENTLY` planla. |
| `BLOATED_CRITICAL` | İndeks boyutu tablo boyutunun 1.5 katını geçmiş. | Acilen `REINDEX CONCURRENTLY` uygula. |
| `UNUSED_INDEX` | İndeks hiç taranmamış (`idx_scan = 0`). | Gereksiz yazma maliyetini önlemek için `DROP INDEX CONCURRENTLY`. |

---

## 3. Sıfır Kesinti (Zero-Downtime) Bakım Prosedürü

Canlı mağaza operasyonunu durdurmadan ve tabloları okuma/yazmaya kilitlemeden bakım yapmak için `CONCURRENTLY` anahtar kelimesi zorunludur:

### 3.1 Şişmiş İndeksleri Yeniden Oluşturma:
```sql
-- Ürünler ve Barkod/IMEI indeksleri
REINDEX TABLE CONCURRENTLY public.products;

-- Satış ve Fiş kayıtları
REINDEX TABLE CONCURRENTLY public.transactions;

-- Teknik Servis Biletleri
REINDEX TABLE CONCURRENTLY public.service_tickets;
```

### 3.2 İstatistik Güncelleme ve Boş Alanları Düzenleme (VACUUM ANALYZE):
```sql
-- Sorgu planlayıcısının (query planner) doğru indeksleri seçmesi için istatistikleri yenile
VACUUM (VERBOSE, ANALYZE) public.products;
VACUUM (VERBOSE, ANALYZE) public.transactions;
VACUUM (VERBOSE, ANALYZE) public.service_tickets;
VACUUM (VERBOSE, ANALYZE) public.customers;
```

---

## 4. Zamanlanmış Görev (Cron / Maintenance Window)
- **Haftalık:** Her pazar gecesi saat 03:00'te `VACUUM (ANALYZE)` çalıştırılması önerilir.
- **Aylık:** 100.000+ satırlık hareket kayıtları için ayda bir `REINDEX TABLE CONCURRENTLY` uygulanmalıdır.
