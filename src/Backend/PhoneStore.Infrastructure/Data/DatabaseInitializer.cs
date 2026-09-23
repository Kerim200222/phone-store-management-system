using Microsoft.EntityFrameworkCore;
using PhoneStore.Core.Entities;
using PhoneStore.Core.Enums;

namespace PhoneStore.Infrastructure.Data;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(PhoneStoreDbContext context)
    {
        // Veritabanı ve tabloları otomatik oluştur
        await context.Database.EnsureCreatedAsync();

        // Eğer ürünler zaten eklenmişse tekrar ekleme
        if (await context.Products.AnyAsync())
        {
            return;
        }

        // 1. Örnek Cari Hesaplar (Müşteri & Tedarikçi)
        var supplier = new Party
        {
            FullName = "Genpa Dağıtım & İletişim A.Ş.",
            Phone = "08502220000",
            Email = "siparis@genpa.com.tr",
            Address = "Levent, İstanbul",
            Type = PartyType.Supplier,
            CurrentBalance = -125000m // Tedarikçiye borcumuz var
        };

        var customer1 = new Party
        {
            FullName = "Ahmet Yılmaz",
            Phone = "05321112233",
            Email = "ahmet.yilmaz@example.com",
            Address = "Kadıköy, İstanbul",
            Type = PartyType.Customer,
            CurrentBalance = 0m
        };

        var customer2 = new Party
        {
            FullName = "Mehmet Demir",
            Phone = "05449998877",
            Email = "mehmet.demir@example.com",
            Address = "Çankaya, Ankara",
            Type = PartyType.Customer,
            CurrentBalance = 1500m // Müşterinin bize borcu var (Veresiye)
        };

        await context.Parties.AddRangeAsync(supplier, customer1, customer2);
        await context.SaveChangesAsync();

        // 2. Örnek Ürünler & IMEI Kayıtları
        var iphone15 = new Product
        {
            Name = "Apple iPhone 15 Pro Max 256GB Naturel Titanyum",
            Category = "Akıllı Telefon",
            Brand = "Apple",
            Barcode = "195949012345",
            MinStockLevel = 2,
            ImeiItems = new List<ImeiItem>
            {
                new()
                {
                    ImeiNumber = "358920112345671",
                    Status = ImeiStatus.InStock,
                    PurchasePrice = 64000m,
                    SalePrice = 76999m,
                    Note = "Genpa Faturalı - 2 Yıl Apple TR Garantili"
                },
                new()
                {
                    ImeiNumber = "358920112345672",
                    Status = ImeiStatus.InStock,
                    PurchasePrice = 64000m,
                    SalePrice = 76999m,
                    Note = "Genpa Faturalı - 2 Yıl Apple TR Garantili"
                }
            }
        };

        var galaxyS24 = new Product
        {
            Name = "Samsung Galaxy S24 Ultra 512GB Titanyum Siyah",
            Category = "Akıllı Telefon",
            Brand = "Samsung",
            Barcode = "880609123456",
            MinStockLevel = 2,
            ImeiItems = new List<ImeiItem>
            {
                new()
                {
                    ImeiNumber = "357812098765431",
                    Status = ImeiStatus.InStock,
                    PurchasePrice = 57000m,
                    SalePrice = 68499m,
                    Note = "Samsung Türkiye Garantili"
                }
            }
        };

        var xiaomi14 = new Product
        {
            Name = "Xiaomi 14 Ultra 512GB Beyaz",
            Category = "Akıllı Telefon",
            Brand = "Xiaomi",
            Barcode = "693417770123",
            MinStockLevel = 1,
            ImeiItems = new List<ImeiItem>
            {
                new()
                {
                    ImeiNumber = "864210051234561",
                    Status = ImeiStatus.InStock,
                    PurchasePrice = 44000m,
                    SalePrice = 52999m,
                    Note = "Dora İletişim TR Garantili"
                }
            }
        };

        var charger = new Product
        {
            Name = "Apple 20W USB-C Güç Adaptörü (Orijinal)",
            Category = "Aksesuar",
            Brand = "Apple",
            Barcode = "194252157005",
            MinStockLevel = 10
        };

        await context.Products.AddRangeAsync(iphone15, galaxyS24, xiaomi14, charger);
        await context.SaveChangesAsync();

        // 3. Örnek Teknik Servis Kaydı
        var repairTicket = new RepairTicket
        {
            CustomerId = customer1.Id,
            TicketNumber = "SRV-2026-0001",
            DeviceModel = "Apple iPhone 14 Pro 128GB",
            ImeiNumber = "354120981234999",
            IssueDescription = "Cihaz yere düşme sonucu ekran kırıldı, dokunmatik yanıt vermiyor.",
            Status = RepairStatus.Diagnostics,
            LaborCost = 850m,
            PartsCost = 3600m,
            TotalCost = 4450m
        };

        await context.RepairTickets.AddAsync(repairTicket);
        await context.SaveChangesAsync();
    }
}
