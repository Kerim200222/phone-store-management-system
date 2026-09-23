using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using PhoneStore.Core.Entities;
using PhoneStore.Core.Enums;
using PhoneStore.Infrastructure.Data;
using Xunit;

namespace PhoneStore.Tests;

public class ImeiTrackingTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly DbContextOptions<PhoneStoreDbContext> _contextOptions;

    public ImeiTrackingTests()
    {
        // Her test için izole, bellek içi (in-memory) SQLite bağlantısı
        _connection = new SqliteConnection("Filename=:memory:");
        _connection.Open();

        _contextOptions = new DbContextOptionsBuilder<PhoneStoreDbContext>()
            .UseSqlite(_connection)
            .Options;

        using var context = new PhoneStoreDbContext(_contextOptions);
        context.Database.EnsureCreated();
    }

    [Fact]
    public async Task DatabaseInitializer_SeedsInitialEntitiesSuccessfully()
    {
        // Arrange
        using var context = new PhoneStoreDbContext(_contextOptions);

        // Act
        await DatabaseInitializer.InitializeAsync(context);

        // Assert
        var products = await context.Products.Include(p => p.ImeiItems).ToListAsync();
        var parties = await context.Parties.ToListAsync();

        Assert.NotEmpty(products);
        Assert.Contains(products, p => p.Name.Contains("iPhone 15 Pro Max"));
        Assert.NotEmpty(parties);
        Assert.Contains(parties, p => p.Type == PartyType.Supplier);
    }

    [Fact]
    public async Task UniqueImeiConstraint_ThrowsException_WhenDuplicateImeiInserted()
    {
        // Arrange
        using var context = new PhoneStoreDbContext(_contextOptions);
        var product = new Product
        {
            Name = "Test Cihazı",
            Category = "Telefon",
            Brand = "TestBrand"
        };
        context.Products.Add(product);
        await context.SaveChangesAsync();

        var imei1 = new ImeiItem
        {
            ProductId = product.Id,
            ImeiNumber = "359999001122334",
            Status = ImeiStatus.InStock,
            PurchasePrice = 20000m,
            SalePrice = 25000m
        };
        context.ImeiItems.Add(imei1);
        await context.SaveChangesAsync();

        // Act & Assert (Aynı IMEI ile 2. kayıt denendiğinde DbUpdateException fırlatılmalı)
        var duplicateImei = new ImeiItem
        {
            ProductId = product.Id,
            ImeiNumber = "359999001122334", // Mükerrer IMEI
            Status = ImeiStatus.InStock,
            PurchasePrice = 21000m,
            SalePrice = 26000m
        };
        context.ImeiItems.Add(duplicateImei);

        await Assert.ThrowsAsync<DbUpdateException>(async () =>
        {
            await context.SaveChangesAsync();
        });
    }

    [Fact]
    public async Task Product_CascadeDeletes_AssociatedImeiItems()
    {
        // Arrange
        using var context = new PhoneStoreDbContext(_contextOptions);
        var product = new Product
        {
            Name = "Silinecek Ürün",
            Category = "Telefon",
            Brand = "SilBrand",
            ImeiItems = new List<ImeiItem>
            {
                new()
                {
                    ImeiNumber = "869999123456789",
                    Status = ImeiStatus.InStock,
                    PurchasePrice = 10000m,
                    SalePrice = 12000m
                }
            }
        };
        context.Products.Add(product);
        await context.SaveChangesAsync();

        // Act
        context.Products.Remove(product);
        await context.SaveChangesAsync();

        // Assert
        var imeiExists = await context.ImeiItems.AnyAsync(i => i.ImeiNumber == "869999123456789");
        Assert.False(imeiExists);
    }

    public void Dispose()
    {
        _connection.Dispose();
    }
}
