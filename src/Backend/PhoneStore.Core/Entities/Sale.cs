using PhoneStore.Core.Enums;

namespace PhoneStore.Core.Entities;

public class Sale
{
    public int Id { get; set; }

    public int? CustomerId { get; set; }
    public Party? Customer { get; set; }

    public string ReceiptNumber { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; } = 0m;
    public decimal PaidAmount { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<SaleItem> SaleItems { get; set; } = new List<SaleItem>();
}
