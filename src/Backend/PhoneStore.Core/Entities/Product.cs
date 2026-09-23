using PhoneStore.Core.Enums;

namespace PhoneStore.Core.Entities;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // Telefon, Aksesuar, Yedek Parça vb.
    public string Brand { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public int MinStockLevel { get; set; } = 2;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // İlişkiler
    public ICollection<ImeiItem> ImeiItems { get; set; } = new List<ImeiItem>();
    public ICollection<SaleItem> SaleItems { get; set; } = new List<SaleItem>();
}
