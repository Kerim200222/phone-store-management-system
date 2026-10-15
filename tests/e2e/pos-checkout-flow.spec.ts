import { test, expect } from "@playwright/test"

/**
 * Senaryo: POS Hızlı Satış ve Fiş Kesme Akışı
 * Modül: /dashboard/pos
 */
test.describe("POS Satış ve Fiş Kesme Akışı", () => {
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

  test("Kasiyer sepete ürün ekleyip müşteri seçerek satışı tamamlayabilmeli ve satış fişi üretilmelidir", async ({ page }) => {
    // 2. ADIM: POS Satış Ekranına Git
    await page.goto("/dashboard/pos")
    await expect(page).toHaveURL(/.*\/dashboard\/pos/)

    // Sayfa başlığının veya sepet bileşeninin yüklendiğini doğrula
    await expect(page.locator("text=Alışveriş Sepeti")).toBeVisible({ timeout: 10000 })

    // 3. ADIM: Sepete Ürün Ekle (Ekle Butonu, Barkod Okutucu veya Ürün Kartı)
    const addProductBtn = page.locator("button:has-text('Ekle')").first()
    const barcodeInput = page.locator('input[placeholder*="Barkod"]').first()

    if (await addProductBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await addProductBtn.click()
    } else if (await barcodeInput.isVisible({ timeout: 2500 }).catch(() => false)) {
      // Barkod girişi ile hazır ürünü doğrudan sepete düşür
      await barcodeInput.fill("195949038241")
      await page.locator("button:has-text('Okut')").first().click()
    } else {
      // Ekranda listelenen ilk ürün kartına tıkla
      const productCard = page.locator('[data-index="0"], .group').first()
      await productCard.click()
    }

    // 4. ADIM: Müşteri Seçimi Yap
    const customerSelect = page.locator('select[aria-label="Satış Yapılacak Müşteri"]')
    await expect(customerSelect).toBeVisible({ timeout: 10000 })
    const options = await customerSelect.locator("option").all()
    if (options.length > 1) {
      // Listeden kayıtlı bir müşteri seç
      await customerSelect.selectOption({ index: 1 })
    }

    // 5. ADIM: Ödeme Yöntemi Olarak 'Nakit' Seç
    const cashMethodBtn = page.locator("button:has-text('Nakit')").first()
    if (await cashMethodBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cashMethodBtn.click()
    }

    // 6. ADIM: Satışı Tamamla Butonuna Tıkla
    const checkoutBtn = page.locator("button:has-text('Satışı Tamamla')").first()
    await expect(checkoutBtn).toBeEnabled({ timeout: 10000 })
    await checkoutBtn.click()

    // 7. ADIM: Satış Başarısını ve Fiş Modalını Doğrula
    await expect(
      page.locator("text=/Satış Başarıyla Tamamlandı|Çevrimdışı Satış Fişi|FİŞ NO|TELEFON MAĞAZASI/i").first()
    ).toBeVisible({ timeout: 10000 })

    // 8. ADIM: Fişi Kapat
    await page.keyboard.press("Escape")
    const closeBtn = page.locator("button:has(svg.lucide-x)").first()
    if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await closeBtn.click()
    }
  })
})
