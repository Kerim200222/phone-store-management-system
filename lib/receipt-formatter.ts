import { 
  UniversalReceiptData, 
  ReceiptItem, 
  DEFAULT_STORE_INFO,
  ReceiptTaxSummary
} from "@/types/receipt"
import { CartItem, CartSummary, POSCustomerSelect, POSPaymentMethod } from "@/types/pos"
import { PurchaseFormValues } from "@/types/purchase"

/**
 * POS Satış Sepetini 80mm Universal Fiş Modeline Dönüştürür
 */
export function formatPOSSaleToReceipt(
  cartItems: CartItem[],
  summary: CartSummary,
  customer: POSCustomerSelect | null,
  paymentMethod: POSPaymentMethod,
  receiptNo: string,
  cashierName: string = "Kerim Aydın (Kasiyer #01)"
): UniversalReceiptData {
  const items: ReceiptItem[] = cartItems.map((item) => ({
    id: item.id,
    name: item.product.name,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    totalPrice: item.total_price,
    imei: item.selected_imei || item.product.imei || null,
    taxRate: 20,
    discount: item.discount > 0 ? item.discount : undefined,
    category: item.product.category,
    warrantyPeriod: item.product.category === "Telefon" ? "2 Yıl Resmi Garanti" : undefined,
  }))

  const taxes: ReceiptTaxSummary[] = [
    {
      taxRate: summary.tax_rate,
      taxableAmount: summary.subtotal,
      taxAmount: summary.tax_amount,
    },
  ]

  return {
    receiptNo,
    type: "sale",
    date: new Date().toISOString(),
    cashierName,
    store: DEFAULT_STORE_INFO,
    customer: customer
      ? {
          name: customer.full_name,
          phone: customer.phone,
          tckn: customer.tckn || undefined,
          address: customer.address || undefined,
          city: customer.city || undefined,
        }
      : null,
    items,
    subtotal: summary.subtotal,
    discountTotal: summary.discount_total,
    taxTotal: summary.tax_amount,
    grandTotal: summary.grand_total,
    taxes,
    paymentMethod,
    paymentDetails: {
      cashAmount: paymentMethod === "cash" ? summary.grand_total : undefined,
      cardAmount: paymentMethod === "credit_card" ? summary.grand_total : undefined,
      cardLast4: paymentMethod === "credit_card" ? "3821" : undefined,
      posAuthCode: paymentMethod === "credit_card" ? "AUTH-91823" : undefined,
      changeAmount: 0,
    },
    legalText:
      "213 Sayılı V.U.K. Genel Tebliği uyarınca düzenlenmiş BİLGİ FİŞİDİR. Mali değeri yoktur. e-Arşiv / e-Fatura sistemimize intikal ettirilmiştir.",
    footerMessage:
      "Bizi tercih ettiğiniz için teşekkür ederiz!\n14 gün içinde ambalajı açılmamış ürünlerde iade/değişim hakkınız mevcuttur.",
    barcode: receiptNo.replace(/[^A-Za-z0-9]/g, ""),
    qrData: `https://telefonmagazasi.com/fatura/${receiptNo}`,
  }
}

/**
 * İkinci El Cihaz Alımını 80mm Gider Pusulası / Fiş Modeline Dönüştürür
 */
export function formatPurchaseToReceipt(
  values: PurchaseFormValues,
  customer: POSCustomerSelect,
  receiptNo: string,
  cashierName: string = "Kerim Aydın (Kasiyer #01)"
): UniversalReceiptData {
  const productName = `${values.brand} ${values.model} ${values.storage} (${values.color})`.trim()

  const items: ReceiptItem[] = [
    {
      id: "purchased-device-1",
      name: productName,
      quantity: 1,
      unitPrice: values.purchasePrice,
      totalPrice: values.purchasePrice,
      imei: values.imei,
      taxRate: 0,
      category: "İkinci El Telefon",
      warrantyPeriod: "6 Ay Mağaza Donanım Garantisi",
    },
  ]

  return {
    receiptNo,
    type: "purchase",
    date: new Date().toISOString(),
    cashierName,
    store: DEFAULT_STORE_INFO,
    customer: {
      name: customer.full_name,
      phone: customer.phone,
      tckn: customer.tckn || undefined,
      address: customer.address || undefined,
      city: customer.city || undefined,
    },
    items,
    subtotal: values.purchasePrice,
    discountTotal: 0,
    taxTotal: 0,
    grandTotal: values.purchasePrice,
    taxes: [
      {
        taxRate: 0,
        taxableAmount: values.purchasePrice,
        taxAmount: 0,
      },
    ],
    paymentMethod: values.paymentMethod,
    paymentDetails: {
      cashAmount: values.paymentMethod === "cash" ? values.purchasePrice : undefined,
      cardAmount: values.paymentMethod === "bank_transfer" ? values.purchasePrice : undefined,
    },
    notes: `Kozmetik: ${values.cosmeticCondition} • Pil: %${values.batteryHealth}${
      values.technicalNotes ? ` • Not: ${values.technicalNotes}` : ""
    }`,
    legalText:
      "Gider Pusulası Niteliğinde İkinci El Cihaz Alım Makbuzudur. 213 Sayılı V.U.K. Madde 234 uyarınca düzenlenmiştir.",
    footerMessage:
      "İkinci El Cihaz Alımı ve Kasa Çıkışı Başarıyla Gerçekleşti.\nCihaz mağaza envanterine 1 adet olarak kaydedilmiştir.",
    barcode: receiptNo.replace(/[^A-Za-z0-9]/g, ""),
    qrData: `https://telefonmagazasi.com/gider-pusulasi/${receiptNo}`,
  }
}

/**
 * Kasa İşlemleri Tablosundaki Satırı 80mm Fiş Modeline Dönüştürür
 */
export function formatTransactionRowToReceipt(row: {
  trx_number: string
  customer: string
  type: string
  payment_method: string
  total_amount: number
  net_amount: number
  notes: string
  date: string
}): UniversalReceiptData {
  const isSale = row.type === "sale"
  const amount = Number(row.net_amount) || 0
  const subtotal = isSale ? Math.round((amount / 1.2) * 100) / 100 : amount
  const taxAmount = isSale ? Math.round((amount - subtotal) * 100) / 100 : 0

  return {
    receiptNo: row.trx_number,
    type: isSale ? "sale" : "purchase",
    date: row.date,
    cashierName: "Kerim Aydın (Kasiyer #01)",
    store: DEFAULT_STORE_INFO,
    customer: {
      name: row.customer,
      phone: "0532 555 00 00",
      tckn: "19284729104",
    },
    items: [
      {
        id: "trx-item-1",
        name: row.notes,
        quantity: 1,
        unitPrice: amount,
        totalPrice: amount,
        taxRate: isSale ? 20 : 0,
      },
    ],
    subtotal,
    discountTotal: 0,
    taxTotal: taxAmount,
    grandTotal: amount,
    taxes: [
      {
        taxRate: isSale ? 20 : 0,
        taxableAmount: subtotal,
        taxAmount,
      },
    ],
    paymentMethod:
      row.payment_method === "credit_card"
        ? "credit_card"
        : row.payment_method === "bank_transfer"
        ? "bank_transfer"
        : "cash",
    legalText: isSale
      ? "213 Sayılı V.U.K. uyarınca düzenlenmiş BİLGİ FİŞİDİR. Mali değeri yoktur."
      : "Gider Pusulası Niteliğinde İkinci El Cihaz Alım Makbuzudur.",
    footerMessage: isSale
      ? "Bizi tercih ettiğiniz için teşekkür ederiz!\n14 gün içinde değişim yapılabilir."
      : "İkinci El Alım İşlemi Başarıyla Gerçekleşmiştir.",
    barcode: row.trx_number.replace(/[^A-Za-z0-9]/g, ""),
    qrData: `https://telefonmagazasi.com/belge/${row.trx_number}`,
  }
}
