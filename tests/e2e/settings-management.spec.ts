import { test, expect } from "@playwright/test"

/**
 * Senaryo: Mağaza Ayarları, Profil ve Güvenlik Yönetimi Akışı
 * Modül: /dashboard/settings
 */
test.describe("Sistem Ayarları ve Profil Yönetimi", () => {
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

  test("Yönetici ayarlar sayfasında sekmeler arasında geçiş yapabilmeli ve profil/mağaza ayarlarını görüntüleyebilmelidir", async ({ page }) => {
    // 2. ADIM: Ayarlar Sayfasına Git
    await page.goto("/dashboard/settings")
    await expect(page).toHaveURL(/.*\/dashboard\/settings/)

    // Sayfa başlığının yüklendiğini doğrula
    await expect(page.locator("h1")).toContainText(/Ayar|Yapılandırma/i)

    // 3. ADIM: Sekmelerin (Tabs) Varlığını Doğrula
    const storeTabBtn = page.locator("button:has-text('Mağaza'), button:has-text('Şube')").first()
    const securityTabBtn = page.locator("button:has-text('Güvenlik'), button:has-text('Şifre')").first()
    await expect(storeTabBtn).toBeVisible({ timeout: 10000 })

    // 4. ADIM: 'Mağaza & Fiş Ayarları' Sekmesine Geç
    await storeTabBtn.click()
    await expect(page.locator("text=/Mağaza Ünvanı|Vergi No|Şube/i").first()).toBeVisible({ timeout: 5000 })

    // 5. ADIM: 'Güvenlik & Şifre' Sekmesine Geç
    if (await securityTabBtn.isVisible()) {
      await securityTabBtn.click()
      await expect(page.locator("text=/Şifre|Parola|Erişim/i").first()).toBeVisible({ timeout: 5000 })
    }
  })
})
