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

