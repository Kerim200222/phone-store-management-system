#ifndef HARDWARE_BRIDGE_H
#define HARDWARE_BRIDGE_H

// ============================================================================
// Phone Store Management System - Native C++ Hardware Bridge
// Hazırlık: Gün 4 (G4) & Gün 10 (G10) P/Invoke Entegrasyonu
// Sorumluluk: Termal Yazıcı (ESC/POS) ve Barkod Okuyucu dinleyicisi
// ============================================================================

#ifdef __cplusplus
extern "C" {
#endif

#ifdef _WIN32
  #define BRIDGE_API __declspec(dllexport)
#else
  #define BRIDGE_API
#endif

// Test ve bağlantı doğrulama
BRIDGE_API int PingHardwareBridge();

// Termal fiş yazıcı komutları
BRIDGE_API int PrintReceiptRaw(const char* portName, const char* content);

// Barkod okuyucu başlatıcı
BRIDGE_API int InitializeBarcodeListener(void (*onBarcodeScanned)(const char* barcode));

#ifdef __cplusplus
}
#endif

#endif // HARDWARE_BRIDGE_H
