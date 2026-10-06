export type ReceiptType = "sale" | "purchase" | "repair" | "refund"

export type ReceiptPrintFormat = "80mm" | "58mm" | "a4"

export interface ReceiptItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  imei?: string | null
  serialNumber?: string | null
  taxRate?: number // e.g. 20 for %20 KDV
  discount?: number
  category?: string
  warrantyPeriod?: string
}

export interface ReceiptTaxSummary {
  taxRate: number // e.g. 20
  taxableAmount: number // KDV matrahı (KDV hariç)
  taxAmount: number // KDV tutarı
}

export interface StoreInfo {
  name: string
  branchName: string
  address: string
  phone: string
  email?: string
  website?: string
  taxOffice: string
  taxNumber: string // VKN / TCKN
  mersisNo?: string
}

export interface CustomerReceiptInfo {
  id?: string
  name: string
  phone?: string
  tckn?: string
  address?: string
  city?: string
  email?: string
}

export interface UniversalReceiptData {
  receiptNo: string
  type: ReceiptType
  date: string // ISO string or formatted date
  cashierName: string
  store: StoreInfo
  customer?: CustomerReceiptInfo | null
  items: ReceiptItem[]
  subtotal: number // KDV Hariç toplam
  discountTotal: number
  taxTotal: number
  grandTotal: number
  taxes: ReceiptTaxSummary[]
  paymentMethod: "cash" | "credit_card" | "bank_transfer" | "split" | "on_account"
  paymentDetails?: {
    cashAmount?: number
    cardAmount?: number
    cardLast4?: string
    posAuthCode?: string
    posTerminalId?: string
    receivedAmount?: number // Müşteriden alınan nakit
    changeAmount?: number // Para üstü
  }
  notes?: string
  legalText?: string
  footerMessage?: string
  barcode?: string
  qrData?: string
}

export const DEFAULT_STORE_INFO: StoreInfo = {
  name: "TELEFON MAĞAZASI A.Ş.",
  branchName: "Kadıköy Merkez Şubesi",
  address: "Bağdat Cad. No:42/A Kadıköy / İstanbul",
  phone: "(0216) 555 12 34",
  email: "destek@telefonmagazasi.com",
  website: "www.telefonmagazasi.com",
  taxOffice: "Kadıköy V.D.",
  taxNumber: "1948201938",
  mersisNo: "0194820193800018",
}

export const SAMPLE_SALE_RECEIPT: UniversalReceiptData = {
  receiptNo: "TRX-20261014-8841",
  type: "sale",
  date: new Date().toISOString(),
  cashierName: "Kerim Aydın (Kasiyer #01)",
  store: DEFAULT_STORE_INFO,
  customer: {
    name: "Murat Demir",
    phone: "0532 999 88 77",
    tckn: "28491039482",
    city: "İstanbul"
  },
  items: [
    {
      id: "item-1",
      name: "Apple iPhone 15 128GB Siyah",
      quantity: 1,
      unitPrice: 53999,
      totalPrice: 53999,
      imei: "358921098412345",
      taxRate: 20,
      warrantyPeriod: "2 Yıl Apple TR Garantili",
      category: "Telefon"
    },
    {
      id: "item-2",
      name: "Apple 20W USB-C Güç Adaptörü",
      quantity: 1,
      unitPrice: 850,
      totalPrice: 850,
      taxRate: 20,
      category: "Aksesuar"
    },
    {
      id: "item-3",
      name: "Spigen Silikon MagSafe Kılıf",
      quantity: 1,
      unitPrice: 650,
      totalPrice: 650,
      discount: 100,
      taxRate: 20,
      category: "Aksesuar"
    }
  ],
  subtotal: 46165.83,
  discountTotal: 100,
  taxTotal: 9233.17,
  grandTotal: 55399,
  taxes: [
    {
      taxRate: 20,
      taxableAmount: 46165.83,
      taxAmount: 9233.17
    }
  ],
  paymentMethod: "split",
  paymentDetails: {
    cashAmount: 20000,
    cardAmount: 35399,
    cardLast4: "4921",
    posAuthCode: "AUTH-89104",
    posTerminalId: "POS-GARANTI-01",
    receivedAmount: 20000,
    changeAmount: 0
  },
  notes: "Müşteri isteği üzerine jelatin mağazada açılıp ilk kurulum yapıldı.",
  legalText: "213 Sayılı V.U.K. uyarınca düzenlenmiş BİLGİ FİŞİDİR. Mali değeri yoktur. e-Fatura / e-Arşiv sistemimize kayıt edilmiştir.",
  footerMessage: "Bizi tercih ettiğiniz için teşekkür ederiz!\nCihazınız 2 yıl resmi ithalatçı ve servis garantilidir.",
  barcode: "TRX202610148841",
  qrData: "https://telefonmagazasi.com/fatura/TRX-20261014-8841"
}

export const SAMPLE_PURCHASE_RECEIPT: UniversalReceiptData = {
  receiptNo: "TRX-20261014-4102",
  type: "purchase",
  date: new Date().toISOString(),
  cashierName: "Kerim Aydın (Kasiyer #01)",
  store: DEFAULT_STORE_INFO,
  customer: {
    name: "Emre Can Şahin",
    phone: "0533 111 22 33",
    tckn: "41982019482",
    address: "Moda Cad. No:14 Kadıköy / İstanbul"
  },
  items: [
    {
      id: "item-p1",
      name: "İkinci El iPhone 13 128GB (Gece Yarısı)",
      quantity: 1,
      unitPrice: 21500,
      totalPrice: 21500,
      imei: "354892091234567",
      taxRate: 0,
      warrantyPeriod: "6 Ay Mağaza Donanım Garantisi",
      category: "İkinci El Telefon"
    }
  ],
  subtotal: 21500,
  discountTotal: 0,
  taxTotal: 0,
  grandTotal: 21500,
  taxes: [
    {
      taxRate: 0,
      taxableAmount: 21500,
      taxAmount: 0
    }
  ],
  paymentMethod: "cash",
  paymentDetails: {
    cashAmount: 21500,
    receivedAmount: 21500,
    changeAmount: 0
  },
  notes: "Pil sağlığı %88. TrueTone ve FaceID aktif. Kutusu ve faturası mevcut.",
  legalText: "Gider Pusulası Niteliğinde İkinci El Cihaz Alım Makbuzudur. Satıcı cihazın yasal mülkiyetinin kendisine ait olduğunu ve bedelini nakden aldığını kabul ve taahhüt eder.",
  footerMessage: "İkinci El Alım İşlemi Başarıyla Gerçekleşmiştir.\nCihaz envantere kaydedilmiş ve kasa çıkışı yapılmıştır.",
  barcode: "TRX202610144102",
  qrData: "https://telefonmagazasi.com/gider-pusulasi/TRX-20261014-4102"
}
