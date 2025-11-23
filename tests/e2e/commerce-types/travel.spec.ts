import { test, expect } from '@playwright/test'

test.describe('Travel Commerce Type', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fr/stores/travel-demo')
  })

  test('displays travel packages', async ({ page }) => {
    await expect(page.locator('[data-testid="package-list"]')).toBeVisible()
  })

  test('shows package with itinerary', async ({ page }) => {
    await page.click('[data-testid="package-card"]')

    // Check for itinerary
    await expect(page.locator('[data-testid="itinerary-timeline"]')).toBeVisible()
  })

  test('displays departure dates', async ({ page }) => {
    await page.click('[data-testid="package-card"]')

    // Check for departure selector
    await expect(page.locator('[data-testid="departure-dates"]')).toBeVisible()
  })

  test('shows included items and pricing breakdown', async ({ page }) => {
    await page.click('[data-testid="package-card"]')

    // Check for inclusions
    await expect(page.locator('[data-testid="inclusions-list"]')).toBeVisible()

    // Check for pricing
    await expect(page.locator('[data-testid="price-breakdown"]')).toBeVisible()
  })

  test('can select travelers count', async ({ page }) => {
    await page.click('[data-testid="package-card"]')

    // Increase travelers
    const travelersInput = page.locator('[data-testid="travelers-input"]')
    await travelersInput.locator('button:last-child').click()

    // Verify price updates
    await expect(page.locator('[data-testid="total-price"]')).toBeVisible()
  })

  test('can select departure date', async ({ page }) => {
    await page.click('[data-testid="package-card"]')

    // Select a departure
    await page.locator('[data-testid="departure-option"]:not([disabled])').first().click()

    // Verify selection
    await expect(page.locator('[data-testid="selected-departure"]')).toBeVisible()
  })

  test('can book travel package', async ({ page }) => {
    await page.click('[data-testid="package-card"]')

    // Select departure
    await page.locator('[data-testid="departure-option"]:not([disabled])').first().click()

    // Book
    await page.click('[data-testid="book-package"]')

    // Verify cart
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')
  })
})

test.describe('Travel Merchant Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fr/merchant/login')
    await page.fill('[name="email"]', 'travel@test.com')
    await page.fill('[name="password"]', 'password')
    await page.click('[type="submit"]')
  })

  test('displays departures calendar', async ({ page }) => {
    await page.goto('/fr/merchant/departures')

    await expect(page.locator('h1')).toContainText('Départs')
    await expect(page.locator('[data-testid="departures-calendar"]')).toBeVisible()
  })

  test('can add new departure', async ({ page }) => {
    await page.goto('/fr/merchant/departures')

    await page.click('[data-testid="add-departure"]')

    // Fill departure details
    await page.selectOption('[name="packageId"]', { index: 1 })
    await page.fill('[name="spots"]', '20')

    await page.click('[type="submit"]')

    // Verify departure added
    await expect(page.locator('[data-testid="departures-calendar"]')).toContainText('20')
  })

  test('displays voucher management', async ({ page }) => {
    await page.goto('/fr/merchant/vouchers')

    await expect(page.locator('h1')).toContainText('Vouchers')
  })

  test('can generate voucher', async ({ page }) => {
    await page.goto('/fr/merchant/vouchers')

    // Select a booking
    await page.click('[data-testid="booking-row"]')

    // Generate voucher
    await page.click('[data-testid="generate-voucher"]')

    // Verify voucher generated
    await expect(page.locator('[data-testid="voucher-preview"]')).toBeVisible()
  })

  test('displays contracts management', async ({ page }) => {
    await page.goto('/fr/merchant/contracts')

    await expect(page.locator('h1')).toContainText('Contrats')
    await expect(page.locator('table')).toBeVisible()
  })
})
