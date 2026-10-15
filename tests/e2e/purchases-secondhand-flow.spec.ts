import { test, expect } from "@playwright/test"

/**
 * Senaryo: 2. El Cihaz Alım, Ekspertiz ve Gider Pusulası Akışı
 * Modül: /dashboard/purchases/new
 */
test.describe("2. El Cihaz Alım ve Ekspertiz Akışı", () => {
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

  test("Yetkili personel müşteri cihazını ekspertiz edip satın alabilmeli ve Gider Pusulası sözleşmesi üretilmelidir", async ({ page }) => {
    // 2. ADIM: 2. El Alım Sayfasına Git
    await page.goto("/dashboard/purchases/new")
    await expect(page).toHaveURL(/.*\/dashboard\/purchases\/new/)

    // Sayfa başlığının yüklendiğini doğrula
    await expect(page.locator("h1")).toContainText(/İkinci El|Cihaz Satın Alım|Ekspertiz/i)

    // 3. ADIM: Hızlı Test Şablonu / Preset Seç (Opsiyonel)
    const presetBtn = page.locator("button:has-text('iPhone 13')").first()
    if (await presetBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await presetBtn.click()
    }

    // 4. ADIM: Cihaz ve Fiyat Bilgilerini Kontrol Et / Doldur
    const brandInput = page.locator("#brand")
    if (await brandInput.isVisible()) {
      await brandInput.fill("Apple")
    }

    const modelInput = page.locator("#model")
    if (await modelInput.isVisible()) {
      await modelInput.fill("iPhone 13 Test İkinci El")
    }

    // 5. ADIM: Satın Alma Butonuna Tıkla
    const submitBtn = page.locator("button:has-text('Cihazı Satın Al')").first()
    await expect(submitBtn).toBeEnabled({ timeout: 10000 })
    await submitBtn.click()

    // 6. ADIM: Gider Pusulası & Satın Alma Sözleşmesi Modalını Doğrula
    await expect(
      page.locator("text=/GİDER PUSULASI|CİHAZ SATIN ALMA|SÖZLEŞME/i").first()
    ).toBeVisible({ timeout: 10000 })

    // 7. ADIM: Modalı Kapat
    await page.keyboard.press("Escape")
    const closeBtn = page.locator("button:has(svg.lucide-x)").first()
    if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await closeBtn.click()
    }
  })
})
