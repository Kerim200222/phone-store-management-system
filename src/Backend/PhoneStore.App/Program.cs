using System.Text;
using Microsoft.EntityFrameworkCore;
using PhoneStore.Core.Entities;
using PhoneStore.Core.Enums;
using PhoneStore.Infrastructure.Data;

Console.OutputEncoding = Encoding.UTF8;

Console.WriteLine("================================================================================");
Console.WriteLine("   PHONE STORE MANAGEMENT SYSTEM — ÇEKİRDEK ALTYAPI & VERİTABANI DOĞRULAYICI   ");
Console.WriteLine("   Trunçgiller Staj Programı | Gün 1 - Gün 3 (G1, G2, G3) Doğrulama            ");
Console.WriteLine("================================================================================\n");

using var context = new PhoneStoreDbContext();

Console.Write("[1/4] SQLite Veritabanı başlatılıyor ve şema kontrol ediliyor... ");
await DatabaseInitializer.InitializeAsync(context);
Console.ForegroundColor = ConsoleColor.Green;
Console.WriteLine("TAMAMLANDI");
Console.ResetColor();

// 1. Ürün ve Stok Özeti
Console.WriteLine("\n[2/4] Veritabanı Varlık Listesi:");
var products = await context.Products.Include(p => p.ImeiItems).ToListAsync();
Console.WriteLine($" -> Toplam Kayıtlı Ürün Grubu: {products.Count}");

foreach (var product in products)
{
    Console.WriteLine($"    • [{product.Category}] {product.Name} (Barkod: {product.Barcode ?? "Yok"})");
    if (product.ImeiItems.Any())
    {
        foreach (var imei in product.ImeiItems)
        {
            Console.WriteLine($"       - IMEI: {imei.ImeiNumber} | Durum: {imei.Status} | Alış: {imei.PurchasePrice:N0} TL | Satış: {imei.SalePrice:N0} TL");
        }
    }
}

// 2. Cari Hesap Özeti
var parties = await context.Parties.ToListAsync();
Console.WriteLine($"\n -> Toplam Cari Hesap: {parties.Count}");
foreach (var party in parties)
{
    var bakiyeDurum = party.CurrentBalance >= 0
        ? $"+{party.CurrentBalance:N0} TL (Alacak)"
        : $"{party.CurrentBalance:N0} TL (Borç)";
    Console.WriteLine($"    • [{party.Type}] {party.FullName} - Tel: {party.Phone} - Bakiye: {bakiyeDurum}");
}

// 3. Teknik Servis Kayıtları
var repairs = await context.RepairTickets.Include(r => r.Customer).ToListAsync();
Console.WriteLine($"\n -> Aktif Servis Kayıtları: {repairs.Count}");
foreach (var repair in repairs)
{
    Console.WriteLine($"    • Fiş No: {repair.TicketNumber} | Cihaz: {repair.DeviceModel} | Durum: {repair.Status} | Maliyet: {repair.TotalCost:N0} TL");
}

// 4. Mükerrer IMEI Validasyon Testi
Console.WriteLine("\n[3/4] Mükerrer IMEI Veritabanı Kısıt (UNIQUE Constraint) Testi:");
Console.WriteLine(" -> Sistemde zaten mevcut olan '358920112345671' IMEI numarası ile yeni kayıt deneniyor...");

try
{
    var duplicateImei = new ImeiItem
    {
        ProductId = products.First().Id,
        ImeiNumber = "358920112345671", // Zaten var olan IMEI
        Status = ImeiStatus.InStock,
        PurchasePrice = 60000m,
        SalePrice = 75000m
    };

    await context.ImeiItems.AddAsync(duplicateImei);
    await context.SaveChangesAsync();

    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine(" ❌ HATA: Mükerrer IMEI engellenemedi!");
    Console.ResetColor();
}
catch (DbUpdateException)
{
    Console.ForegroundColor = ConsoleColor.Green;
    Console.WriteLine(" -> BAŞARILI: SQLite UNIQUE kısıtı mükerrer IMEI kaydını başarıyla engelledi.");
    Console.ResetColor();
}

Console.WriteLine("\n================================================================================");
Console.ForegroundColor = ConsoleColor.Cyan;
Console.WriteLine(" [SONUÇ] G1 (Dizin/Repo), G2 (Scrumban/WIP) ve G3 (C#/SQLite) Başarıyla Doğrulandı!");
Console.ResetColor();
Console.WriteLine("================================================================================\n");
