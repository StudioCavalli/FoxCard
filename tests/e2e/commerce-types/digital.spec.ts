import { test, expect } from '@playwright/test'

test.describe('Digital Commerce Type', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fr/stores/software-demo')
  })

  test('displays digital products catalog', async ({ page }) => {
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible()
  })

  test('shows license types', async ({ page }) => {
    await page.click('[data-testid="product-card"]')

    // Check for license options
    await expect(page.locator('[data-testid="license-options"]')).toBeVisible()
  })

  test('displays system requirements', async ({ page }) => {
    await page.click('[data-testid="product-card"]')

    // Check for requirements
    await expect(page.locator('[data-testid="system-requirements"]')).toBeVisible()
  })

  test('can select license type', async ({ page }) => {
    await page.click('[data-testid="product-card"]')

    // Select team license
    await page.click('[data-testid="license-team"]')

    // Verify price updates
    await expect(page.locator('[data-testid="selected-license"]')).toContainText('Team')
  })

  test('shows download info after purchase', async ({ page }) => {
    // Login first
    await page.goto('/fr/auth/login')
    await page.fill('[name="email"]', 'customer@test.com')
    await page.fill('[name="password"]', 'password')
    await page.click('[type="submit"]')

    // Go to purchases
    await page.goto('/fr/account/purchases')

    // Check for download button
    await expect(page.locator('[data-testid="download-button"]')).toBeVisible()
  })

  test('can add digital product to cart', async ({ page }) => {
    await page.click('[data-testid="product-card"]')

    // Select license
    await page.click('[data-testid="license-single"]')

    // Add to cart
    await page.click('[data-testid="add-to-cart"]')

    // Verify cart
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')
  })

  test('shows feature comparison', async ({ page }) => {
    await page.click('[data-testid="product-card"]')

    // Check for feature list
    await expect(page.locator('[data-testid="feature-list"]')).toBeVisible()
  })
})

test.describe('Digital Merchant Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fr/merchant/login')
    await page.fill('[name="email"]', 'software@test.com')
    await page.fill('[name="password"]', 'password')
    await page.click('[type="submit"]')
  })

  test('displays license management', async ({ page }) => {
    await page.goto('/fr/merchant/licenses')

    await expect(page.locator('h1')).toContainText('Licences')
    await expect(page.locator('table')).toBeVisible()
  })

  test('can generate license keys', async ({ page }) => {
    await page.goto('/fr/merchant/licenses')

    await page.click('[data-testid="generate-keys"]')

    // Fill generation form
    await page.selectOption('[name="productId"]', { index: 1 })
    await page.fill('[name="quantity"]', '5')
    await page.selectOption('[name="type"]', 'SINGLE')

    await page.click('[type="submit"]')

    // Verify keys generated
    await expect(page.locator('[data-testid="keys-generated"]')).toContainText('5')
  })

  test('displays download analytics', async ({ page }) => {
    await page.goto('/fr/merchant/analytics/downloads')

    await expect(page.locator('h1')).toContainText('Téléchargements')
    await expect(page.locator('[data-testid="downloads-chart"]')).toBeVisible()
  })

  test('can revoke license', async ({ page }) => {
    await page.goto('/fr/merchant/licenses')

    // Find active license
    await page.click('[data-testid="license-row"]')

    // Revoke
    await page.click('[data-testid="revoke-license"]')
    await page.click('[data-testid="confirm-revoke"]')

    // Verify revoked
    await expect(page.locator('[data-testid="license-row"]')).toContainText('Révoquée')
  })

  test('displays version management', async ({ page }) => {
    await page.goto('/fr/merchant/products')

    await page.click('[data-testid="product-row"]')

    // Check for versions tab
    await page.click('[data-testid="versions-tab"]')

    await expect(page.locator('[data-testid="version-list"]')).toBeVisible()
  })
})
