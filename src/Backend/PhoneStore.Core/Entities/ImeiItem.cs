using PhoneStore.Core.Enums;

namespace PhoneStore.Core.Entities;

/// <summary>
/// Telefonlar için benzersiz IMEI takip varlığı.
/// Veritabanı seviyesinde ImeiNumber üzerinde UNIQUE INDEX bulunur.
/// </summary>
public class ImeiItem
{
    public int Id { get; set; }

    public int ProductId { get; set; }
    public Product? Product { get; set; }

    public string ImeiNumber { get; set; } = string.Empty; // 15 hane, UNIQUE
    public ImeiStatus Status { get; set; } = ImeiStatus.InStock;

    public decimal PurchasePrice { get; set; }
    public decimal SalePrice { get; set; }

    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
