import { test, expect } from "@playwright/test"

/**
 * Senaryo: Müşteri & Cari Hesap Yönetimi - Yeni Müşteri Kaydı ve Tablo Doğrulama
 * Modül: /dashboard/customers
 */
test.describe("Müşteri ve Cari Hesap Yönetim Akışı", () => {
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

  test("Yetkili personel yeni bir müşteri kaydı açabilmeli ve müşteri anında cari listesinde görünmelidir", async ({ page }) => {
    // 2. ADIM: Müşteriler Sayfasına Git
    await page.goto("/dashboard/customers")
    await expect(page).toHaveURL(/.*\/dashboard\/customers/)

    // Sayfa başlığının yüklendiğini doğrula
    await expect(page.locator("h1")).toContainText(/Müşteri|Cari/i)

    // 3. ADIM: 'Yeni Müşteri Kaydet' Düğmesine Tıkla
    const addCustomerBtn = page.locator("button:has-text('Yeni Müşteri Kaydet')").first()
    await expect(addCustomerBtn).toBeVisible({ timeout: 10000 })
    await addCustomerBtn.click()

    // 4. ADIM: Formun Açıldığını Doğrula (#first_name) ve Müşteri Bilgilerini Doldur
    const firstNameInput = page.locator("#first_name")
    await expect(firstNameInput).toBeVisible({ timeout: 10000 })

    const testFirstName = "Ayşe"
    const testLastName = "Demir Test"
    const testFullName = `${testFirstName} ${testLastName}`
    const testPhone = "05441234567"

    await firstNameInput.fill(testFirstName)
    await page.locator("#last_name").fill(testLastName)
    await page.locator("#phone").fill(testPhone)

    // Opsiyonel Not Ekle
    const notesInput = page.locator("#notes")
    if (await notesInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await notesInput.fill("E2E Test Otomasyonu ile oluşturulan deneme müşterisi.")
    }

    // 5. ADIM: 'Müşteriyi Kaydet' Düğmesine Tıkla
    const submitBtn = page.locator("button:has-text('Müşteriyi Kaydet')").first()
    await expect(submitBtn).toBeEnabled({ timeout: 5000 })
    await submitBtn.click()

    // 6. ADIM: Eklenen Müşterinin Cari Tabloda Listelendiğini Doğrula
    const customerRow = page.locator(`text=${testFullName}`).first()
    await expect(customerRow).toBeVisible({ timeout: 10000 })
  })
})
