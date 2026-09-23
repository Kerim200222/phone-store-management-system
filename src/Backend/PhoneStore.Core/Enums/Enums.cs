namespace PhoneStore.Core.Enums;

public enum ImeiStatus
{
    InStock = 0,
    Sold = 1,
    InRepair = 2,
    Returned = 3,
    Damaged = 4
}

public enum RepairStatus
{
    Received = 0,
    Diagnostics = 1,
    InRepair = 2,
    ReadyForPickup = 3,
    Delivered = 4,
    Cancelled = 5
}

public enum PartyType
{
    Customer = 0,
    Supplier = 1
}

public enum PaymentMethod
{
    Cash = 0,
    CreditCard = 1,
    CreditAccount = 2, // Veresiye / Cari
    BankTransfer = 3
}
