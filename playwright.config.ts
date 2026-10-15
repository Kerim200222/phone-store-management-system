import { defineConfig, devices } from "@playwright/test"

/**
 * Telefon Mağazası Yönetim Sistemi - Playwright E2E Test Konfigürasyonu
 * Next.js 14+ App Router & SSR için optimize edilmiştir.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  /* Test dosyalarının maksimum çalışma süresi (30 saniye) */
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  /* Testleri tamamen paralel çalıştır */
  fullyParallel: true,
  /* CI ortamında kazara test.only kalmışsa build'i durdur */
  forbidOnly: !!process.env.CI,
  /* CI ortamında 2 kez, yerelde 0 kez tekrar dene */
  retries: process.env.CI ? 2 : 0,
  /* Paralel çalışan worker sayısı */
  workers: process.env.CI ? 1 : undefined,
  /* Raporlama formatı: HTML + terminal listesi */
  reporter: [["html", { open: "never" }], ["list"]],

  /* Ortak Test Ayarları */
  use: {
    /* Uygulama temel URL'i */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    /* İlk hata durumunda trace kaydet */
    trace: "on-first-retry",
    /* Sadece hata durumunda ekran görüntüsü al */
    screenshot: "only-on-failure",
    /* Test video kaydı */
    video: "retain-on-failure",
  },

  /* Test edilecek tarayıcı platformları */
  projects: [
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Desktop Firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "Desktop Safari",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  /* Test başlamadan önce Next.js dev sunucusunu otomatik ayağa kaldır */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
