using PhoneStore.Core.Enums;

namespace PhoneStore.Core.Entities;

public class RepairTicket
{
    public int Id { get; set; }

    public int? CustomerId { get; set; }
    public Party? Customer { get; set; }

    public string TicketNumber { get; set; } = string.Empty;
    public string DeviceModel { get; set; } = string.Empty;
    public string? ImeiNumber { get; set; }
    public string IssueDescription { get; set; } = string.Empty;
    public RepairStatus Status { get; set; } = RepairStatus.Received;

    public decimal LaborCost { get; set; } = 0m;
    public decimal PartsCost { get; set; } = 0m;
    public decimal TotalCost { get; set; } = 0m;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
