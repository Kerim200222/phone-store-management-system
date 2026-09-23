namespace PhoneStore.Core.Entities;

public class SaleItem
{
    public int Id { get; set; }

    public int SaleId { get; set; }
    public Sale? Sale { get; set; }

    public int ProductId { get; set; }
    public Product? Product { get; set; }

    public int? ImeiItemId { get; set; }
    public ImeiItem? ImeiItem { get; set; }

    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}
