using PhoneStore.Core.Enums;

namespace PhoneStore.Core.Entities;

/// <summary>
/// Müşteri veya Tedarikçi cari hesap kaydı.
/// </summary>
public class Party
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public PartyType Type { get; set; } = PartyType.Customer;

    /// <summary>
    /// Bakiye: Pozitif ise alacağımız var (müşteri borcu), Negatif ise borcumuz var (tedarikçiye borç).
    /// </summary>
    public decimal CurrentBalance { get; set; } = 0m;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Sale> Sales { get; set; } = new List<Sale>();
    public ICollection<RepairTicket> RepairTickets { get; set; } = new List<RepairTicket>();
}
