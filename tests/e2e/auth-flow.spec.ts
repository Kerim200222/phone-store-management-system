import { test, expect } from "@playwright/test"

/**
 * Senaryo: Kullanıcı Kimlik Doğrulama ve Güvenli Giriş Akışı
 * Modül: /login -> /dashboard
 */
test.describe("Kullanıcı Kimlik Doğrulama Akışı (Auth)", () => {
  test("Giriş ekranında form alanları doğrulanmalı ve yetkili demo hesabı ile panoya erişilebilmelidir", async ({ page }) => {
    // 1. ADIM: Giriş Sayfasına Git
    await page.goto("/login")
    await expect(page).toHaveURL(/.*\/login/)

    // Sayfa başlığının veya giriş kartının yüklendiğini doğrula
    await expect(page.locator("h2, h1, [class*='CardTitle']").first()).toContainText(/PhoneStore Pro|Giriş Yap/i)

    // 2. ADIM: E-posta ve Şifre Alanlarının Varlığını Doğrula
    const emailInput = page.locator("#email")
    const passwordInput = page.locator("#password")
    await expect(emailInput).toBeVisible({ timeout: 10000 })
    await expect(passwordInput).toBeVisible({ timeout: 10000 })

    // 3. ADIM: Demo Yönetici Kimlik Bilgilerini Doğrudan Doldur
    await emailInput.fill("admin@phonestore.com")
    await passwordInput.fill("Admin123!")

    // 4. ADIM: Formu Gönder (button[type="submit"])
    const submitBtn = page.locator('button[type="submit"]').first()
    await expect(submitBtn).toBeEnabled({ timeout: 5000 })
    await submitBtn.click()

    // 5. ADIM: Yönetim Paneline (/dashboard) Yönlendirildiğini Doğrula
    await page.waitForURL(/.*\/dashboard/, { timeout: 15000 })
    await expect(page).toHaveURL(/.*\/dashboard/)

    // Pano başlığının yüklendiğini kontrol et
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10000 })
  })

  test("Oturum açmamış kullanıcı korumalı rotaya gittiğinde login ekranına yönlendirilmelidir", async ({ page, context }) => {
    // Çerezleri temizle (Oturumsuz durum)
    await context.clearCookies()

    // Korumalı sayfaya gitmeyi dene
    await page.goto("/dashboard/transactions")

    // Oturum olmadığı için /login sayfasına yönlendirilmelidir
    await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 })
    await expect(page.locator("#email")).toBeVisible({ timeout: 5000 })
  })
})
