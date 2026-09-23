using Microsoft.EntityFrameworkCore;
using PhoneStore.Core.Entities;

namespace PhoneStore.Infrastructure.Data;

public class PhoneStoreDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ImeiItem> ImeiItems => Set<ImeiItem>();
    public DbSet<Party> Parties => Set<Party>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<SaleItem> SaleItems => Set<SaleItem>();
    public DbSet<RepairTicket> RepairTickets => Set<RepairTicket>();

    public string DbPath { get; }

    public PhoneStoreDbContext()
    {
        DbPath = "phonestore.db";
    }

    public PhoneStoreDbContext(DbContextOptions<PhoneStoreDbContext> options)
        : base(options)
    {
        DbPath = "phonestore.db";
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            optionsBuilder.UseSqlite($"Data Source={DbPath}");
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Product Konfigürasyonu
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Brand).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Barcode).HasMaxLength(50);
            entity.HasIndex(e => e.Barcode);

            entity.HasMany(e => e.ImeiItems)
                  .WithOne(e => e.Product)
                  .HasForeignKey(e => e.ProductId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.SaleItems)
                  .WithOne(e => e.Product)
                  .HasForeignKey(e => e.ProductId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ImeiItem Konfigürasyonu — MÜKERRERLİK ENGELLEME ÇEKİRDEĞİ
        modelBuilder.Entity<ImeiItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ImeiNumber).IsRequired().HasMaxLength(15);
            
            // Veritabanı Seviyesinde Unique Index (Mükerrer IMEI İmkânsızlaştırılır)
            entity.HasIndex(e => e.ImeiNumber)
                  .IsUnique();

            entity.Property(e => e.PurchasePrice).HasPrecision(18, 2);
            entity.Property(e => e.SalePrice).HasPrecision(18, 2);
        });

        // Party (Müşteri & Tedarikçi) Konfigürasyonu
        modelBuilder.Entity<Party>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(120);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.CurrentBalance).HasPrecision(18, 2);
        });

        // Sale & SaleItem Konfigürasyonu
        modelBuilder.Entity<Sale>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ReceiptNumber).IsRequired().HasMaxLength(30);
            entity.HasIndex(e => e.ReceiptNumber).IsUnique();

            entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
            entity.Property(e => e.DiscountAmount).HasPrecision(18, 2);
            entity.Property(e => e.PaidAmount).HasPrecision(18, 2);

            entity.HasOne(e => e.Customer)
                  .WithMany(e => e.Sales)
                  .HasForeignKey(e => e.CustomerId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasMany(e => e.SaleItems)
                  .WithOne(e => e.Sale)
                  .HasForeignKey(e => e.SaleId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SaleItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
            entity.Property(e => e.TotalPrice).HasPrecision(18, 2);

            entity.HasOne(e => e.ImeiItem)
                  .WithMany()
                  .HasForeignKey(e => e.ImeiItemId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // RepairTicket Konfigürasyonu
        modelBuilder.Entity<RepairTicket>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TicketNumber).IsRequired().HasMaxLength(30);
            entity.HasIndex(e => e.TicketNumber).IsUnique();

            entity.Property(e => e.DeviceModel).IsRequired().HasMaxLength(100);
            entity.Property(e => e.ImeiNumber).HasMaxLength(15);
            entity.Property(e => e.IssueDescription).IsRequired().HasMaxLength(500);

            entity.Property(e => e.LaborCost).HasPrecision(18, 2);
            entity.Property(e => e.PartsCost).HasPrecision(18, 2);
            entity.Property(e => e.TotalCost).HasPrecision(18, 2);

            entity.HasOne(e => e.Customer)
                  .WithMany(e => e.RepairTickets)
                  .HasForeignKey(e => e.CustomerId)
                  .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
