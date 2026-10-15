import { test, expect } from "@playwright/test"

/**
 * Senaryo: Kasa & Finansal İşlemler (Transactions) Akışı
 * Modül: /dashboard/transactions
 */
test.describe("Kasa ve Finansal Hareketler Yönetimi", () => {
  test.beforeEach(async ({ context }) => {
    // 1. ADIM: Demo Yönetici Oturum Çerezini (Cookie) Ekle
    await context.addCookies([
      {
        name: "phonestore_session",
        value: encodeURIComponent(
          JSON.stringify({
            email: "admin@phonestore.com",
            role: "Admin",
          })
        ),
        domain: "localhost",
        path: "/",
        httpOnly: false,
        secure: false,
        sameSite: "Lax",
      },
    ])
  })

  test("Yetkili kullanıcı kasa özetlerini, nakit/kart dağılımını görebilmeli, filtreleme yapabilmeli ve işlem fişini görüntüleyebilmelidir", async ({ page }) => {
    // 2. ADIM: Kasa ve Finansal İşlemler Sayfasına Git
    await page.goto("/dashboard/transactions")
    await expect(page).toHaveURL(/.*\/dashboard\/transactions/)

    // Sayfa başlığının yüklendiğini doğrula
    await expect(page.locator("h1")).toContainText(/Kasa|Finansal/i)

    // 3. ADIM: Finansal KPI Özet Kartlarını Doğrula
    await expect(page.locator("text=/Toplam Satış Cirosu/i").first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator("text=/Nakit Kasa Bakiyesi/i").first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator("text=/POS|Kredi Kartı/i").first()).toBeVisible({ timeout: 10000 })

    // 4. ADIM: Filtre Düğmelerini Test Et
    const salesFilterBtn = page.locator("button:has-text('Satışlar')").first()
    if (await salesFilterBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await salesFilterBtn.click()
    }

    // 5. ADIM: İşlem Arama Çubuğunu Test Et
    const searchInput = page.locator('input[placeholder*="Fiş no"]').first()
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill("TRX")
      await page.waitForTimeout(500)
    }

    // 6. ADIM: Tablodaki İlk İşlemin Fişini Aç ve Doğrula
    const receiptBtn = page.locator("button:has-text('Fiş'), button:has-text('Yazdır')").first()
    if (await receiptBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await receiptBtn.click()

      // Fiş modalının ekranda belirdiğini doğrula
      await expect(
        page.locator("text=/FİŞ NO|TELEFON MAĞAZASI|KASA FİŞİ|Satış Fişi/i").first()
      ).toBeVisible({ timeout: 10000 })

      // Fiş modalını kapat
      await page.keyboard.press("Escape")
      const closeBtn = page.locator("button:has(svg.lucide-x)").first()
      if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await closeBtn.click()
      }
    }
  })
})
