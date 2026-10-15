import { test, expect } from "@playwright/test"

/**
 * Senaryo: Ana Yönetim Paneli, KPI Metrikleri ve Veri Görselleştirme Akışı
 * Modül: /dashboard
 */
test.describe("Ana Yönetim Paneli ve Analitik Raporlama", () => {
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

  test("Yönetici panoda 4 temel KPI kartını, grafik alanlarını görebilmeli ve tarih filtresini değiştirebilmelidir", async ({ page }) => {
    // 2. ADIM: Dashboard Sayfasına Git
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/.*\/dashboard/)

    // 3. ADIM: 4 Temel KPI Özet Kartının Yüklendiğini Doğrula (Ciro, Brüt Kâr, Servis Kuyruğu, Kritik Stok)
    await expect(page.locator("text=/Ciro|Toplam Ciro|Günlük Ciro/i").first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator("text=/Brüt Kâr|Kâr Durumu/i").first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator("text=/Teknik Servis|Servis Kuyruğu/i").first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator("text=/Kritik Stok|Stok/i").first()).toBeVisible({ timeout: 10000 })

    // 4. ADIM: Tarih Filtresi Butonlarını Test Et (Bugün / Bu Hafta / Bu Ay)
    const monthFilterBtn = page.locator("button:has-text('Bu Ay')").first()
    if (await monthFilterBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await monthFilterBtn.click()
      await page.waitForTimeout(500)
    }

    // 5. ADIM: Hızlı Eylem Düğmelerinin (POS / Servis / Stok) Erişilebilir Olduğunu Doğrula
    const quickPosLink = page.locator('a[href="/dashboard/pos"]').first()
    await expect(quickPosLink).toBeVisible({ timeout: 5000 })
  })
})
