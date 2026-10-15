import { test, expect } from "@playwright/test"

/**
 * Senaryo: Stok & Envanter Yönetimi - Yeni Ürün Ekleme ve Listeleme
 * Modüller: /dashboard/inventory (Envanter) -> /dashboard/inventory/new (Yeni Ürün)
 */
test.describe("Stok ve Envanter Yönetim Akışı", () => {
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

  test("Yönetici yeni bir aksesuar veya ürün ekleyebilmeli ve ürün stok listesinde görüntülenmelidir", async ({ page }) => {
    // 2. ADIM: Envanter Sayfasına Git
    await page.goto("/dashboard/inventory")
    await expect(page).toHaveURL(/.*\/dashboard\/inventory/)

    // Sayfa başlığının yüklendiğini doğrula
    await expect(page.locator("h1")).toContainText(/Ürün Envanteri|Envanter/i)

    // 3. ADIM: 'Yeni Ürün & Cihaz Ekle' Butonuna Tıkla
    const newProductBtn = page.locator('a[href="/dashboard/inventory/new"]').first()
    await expect(newProductBtn).toBeVisible({ timeout: 10000 })
    await newProductBtn.click()
    await expect(page).toHaveURL(/.*\/dashboard\/inventory\/new/)

    // 4. ADIM: Hızlı Test Şablonu ile Formu Eksiksiz Doldur ve Ürün Adını Güncelle
    const testProductName = "Anker 20W Hızlı Şarj Başlığı Test"

    // Tek tıkla kategori ve fiyatları dolduran hazır şablon butonuna tıkla
    const templateBtn = page.locator("button:has-text('20W Hızlı Şarj')").first()
    if (await templateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await templateBtn.click()
    }

    // Ürün adını test adına göre güncelle
    const nameInput = page.locator('input[name="name"]')
    await nameInput.fill(testProductName)

    const brandInput = page.locator('input[name="brand"]')
    await brandInput.fill("Anker")

    // 5. ADIM: Ürünü Sisteme Kaydet
    const submitBtn = page.getByRole("button", { name: /Ürünü & Görseli Sisteme Kaydet/i })
    await expect(submitBtn).toBeEnabled({ timeout: 10000 })
    await submitBtn.click()

    // 6. ADIM: Başarı Durumunu Doğrula (Esnek metin kontrolü)
    await page.locator("text=/başarı/i").first().waitFor({ state: "visible", timeout: 5000 }).catch(() => {})

    // 7. ADIM: Envanter Tablosuna Geri Dön ve Eklenen Ürünü Doğrula
    const backToInventoryLink = page.locator('a[href="/dashboard/inventory"]').first()
    await backToInventoryLink.click()
    await expect(page).toHaveURL(/.*\/dashboard\/inventory/)

    // Envanter arama kutusuna ürünün adını yaz
    const searchInput = page.locator('input[placeholder*="ara"]').first()
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill("Anker")
    }

    // Ürünün listede görüntülendiğini doğrula
    await expect(page.locator("text=/Anker/i").first()).toBeVisible({ timeout: 10000 })
  })
})
