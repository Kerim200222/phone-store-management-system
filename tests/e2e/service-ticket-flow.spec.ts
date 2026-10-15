import { test, expect } from "@playwright/test"

/**
 * Luhn algoritmasına uygun geçerli 15 haneli IMEI üreten yardımcı fonksiyon
 */
function createValidLuhnIMEI(): string {
  const prefix = "35489209123456" // İlk 14 hane
  let sum = 0
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(prefix[i], 10)
    if (i % 2 !== 0) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  const checkDigit = (10 - (sum % 10)) % 10
  return prefix + checkDigit.toString() // 354892091234569 (Luhn geçerli)
}

/**
 * Senaryo: Teknik Servis Cihaz Kaydı Açma ve Kanban Doğrulama
 * Modüller: /dashboard/service/new (Kabul Formu) -> /dashboard/service (Kanban Panosu)
 */
test.describe("Teknik Servis Cihaz Kabul ve Kanban Akışı", () => {
  test.beforeEach(async ({ context }) => {
    // 1. ADIM: Demo Yönetici Oturum Çerezini (Cookie) Ekle
    // Sistem bu çerezi gördüğünde login ekranına yönlendirmeden doğrudan panele erişim verir.
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

  test("Yetkili personel yeni bir arızalı cihaz teslim alıp kaydedebilmeli ve bilet Kanban panosuna düşmelidir", async ({ page }) => {
    // 2. ADIM: Yeni Servis Kayıt Sayfasına Git
    await page.goto("/dashboard/service/new")
    await expect(page).toHaveURL(/.*\/dashboard\/service\/new/)

    // Sayfa başlığının yüklendiğini doğrula
    await expect(page.locator("h1")).toContainText("Yeni Servis Kaydı Açma")

    // 3. ADIM: Tüm Zorunlu ve İlgili Alanları Eksiksiz Doldur
    const testModel = "iPhone 14 Pro Max Test"
    const validLuhnIMEI = createValidLuhnIMEI() // 15 haneli Luhn geçerli IMEI

    // 3.1. Cihaz Sahibi (Müşteri) Seçimi
    const customerSelect = page.locator("#customerId")
    await expect(customerSelect).toBeVisible()
    const options = await customerSelect.locator("option").all()
    if (options.length > 0) {
      const firstVal = await options[0].getAttribute("value")
      if (firstVal) {
        await customerSelect.selectOption(firstVal)
      }
    }

    // 3.2. Cihaz Marka ve Modeli
    const brandInput = page.locator("#deviceBrand")
    await brandInput.fill("Apple")

    const modelInput = page.locator("#deviceModel")
    await modelInput.fill(testModel)

    // 3.3. 15 Haneli Luhn Geçerli IMEI Numarası
    // Not: Form butonu (disabled={isSubmitting || !isImeiValid}) IMEI'nin Luhn kontrolünden geçmesini zorunlu tutar.
    const imeiInput = page.locator("#imei")
    await imeiInput.fill(validLuhnIMEI)

    // Yeşil "Geçerli" rozetinin göründüğünü doğrula
    await expect(page.locator("text=✓ Geçerli")).toBeVisible({ timeout: 5000 })

    // 3.4. Cihaz Şifresi / PIN Bilgisi
    const pinRadio = page.locator("input[value='pin']")
    if (await pinRadio.isVisible({ timeout: 2000 }).catch(() => false)) {
      await pinRadio.check({ force: true })
    } else {
      await page.locator("text=Sayısal PIN").click()
    }
    const passwordInput = page.locator("#devicePassword")
    await passwordInput.fill("1907")

    // 3.5. Arıza Kategorisi ve Açıklaması
    const categorySelect = page.locator("#issueCategory")
    await categorySelect.selectOption("Ekran & Dokunmatik")

    const issueInput = page.locator("#issueDescription")
    await issueInput.fill("Ekran dokunmatiği rastgele basmıyor, pil sağlığı düşük ve şarj çabuk bitiyor.")

    // 3.6. Fiziksel Durum / Ekspertiz Notları
    const conditionInput = page.locator("#physicalCondition")
    await conditionInput.fill("Kasa köşelerinde hafif sürtünme izi var, ekran jelatinsiz teslim alındı.")

    // 3.7. Tahmini Maliyet
    const costInput = page.locator("#estimatedCost")
    await costInput.fill("4500")

    // 3.8. Servis Önceliği
    const prioritySelect = page.locator("#priority")
    if (await prioritySelect.isVisible()) {
      await prioritySelect.selectOption("normal")
    }

    // 3.9. Müşteri Sorumluluk & Veri Onayı Checkbox'ı (Zorunlu Validasyon)
    const consentCheckbox = page.locator("input[name='backupConsent']")
    await consentCheckbox.check({ force: true })
    await expect(consentCheckbox).toBeChecked()

    // 4. ADIM: Kaydet Butonunun Aktifleştiğini Doğrula ve Gönder
    const submitBtn = page.getByRole("button", { name: /Servis Kaydını Aç/i })
    await expect(submitBtn).toBeEnabled({ timeout: 10000 })
    await submitBtn.click()

    // 5. ADIM: Kayıt Başarısını Doğrula (Yeşil Toast Bildirimi)
    await expect(page.locator("text=/Teknik Servis Kaydı Açıldı/i").first()).toBeVisible({ timeout: 10000 })

    // Açılan fiş modalını kapat (Escape tuşu veya X butonu)
    await page.keyboard.press("Escape")
    const closeBtn = page.locator("button:has(svg.lucide-x)").first()
    if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await closeBtn.click()
    }

    // 6. ADIM: Sol Menüden (Sidebar) Teknik Servis Bağlantısına Tıkla (Client-Side Navigation)
    const sidebarServiceLink = page.locator('a[href="/dashboard/service"]').first()
    await sidebarServiceLink.click({ force: true })
    await expect(page).toHaveURL(/.*\/dashboard\/service/)

    // Kanban panosunun yüklendiğini doğrula
    await expect(page.locator("h1")).toContainText(/Teknik Servis|Servis/i)

    // Eklenen cihazın Kanban panosunda kart olarak listelendiğini doğrula
    const ticketCard = page.locator(`text=${testModel}`).first()
    await expect(ticketCard).toBeVisible({ timeout: 10000 })
  })
})
