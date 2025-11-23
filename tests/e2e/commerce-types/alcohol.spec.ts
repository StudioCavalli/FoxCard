import { test, expect } from '@playwright/test'

test.describe('Alcohol Commerce Type', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fr/stores/wine-demo')
  })

  test('displays age verification modal', async ({ page }) => {
    // Should show age verification on first visit
    await expect(page.locator('[data-testid="age-verification"]')).toBeVisible()
  })

  test('can confirm age', async ({ page }) => {
    // Confirm age
    await page.click('[data-testid="confirm-age"]')

    // Verify access granted
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible()
  })

  test('blocks underage users', async ({ page }) => {
    // Deny age
    await page.click('[data-testid="deny-age"]')

    // Verify blocked
    await expect(page.locator('[data-testid="age-blocked"]')).toBeVisible()
  })

  test('displays wine product with details', async ({ page }) => {
    await page.click('[data-testid="confirm-age"]')
    await page.click('[data-testid="product-card"]')

    // Check for wine attributes
    await expect(page.locator('[data-testid="vintage"]')).toBeVisible()
    await expect(page.locator('[data-testid="region"]')).toBeVisible()
    await expect(page.locator('[data-testid="grape-variety"]')).toBeVisible()
  })

  test('shows tasting notes', async ({ page }) => {
    await page.click('[data-testid="confirm-age"]')
    await page.click('[data-testid="product-card"]')

    // Check for tasting notes
    await expect(page.locator('[data-testid="tasting-notes"]')).toBeVisible()
  })

  test('displays food pairings', async ({ page }) => {
    await page.click('[data-testid="confirm-age"]')
    await page.click('[data-testid="product-card"]')

    // Check for pairings
    await expect(page.locator('[data-testid="pairings"]')).toBeVisible()
  })

  test('shows legal warning', async ({ page }) => {
    await page.click('[data-testid="confirm-age"]')
    await page.click('[data-testid="product-card"]')

    // Check for legal warning
    await expect(page.locator('[data-testid="legal-warning"]')).toContainText('modération')
  })

  test('requires age confirmation before adding to cart', async ({ page }) => {
    await page.click('[data-testid="confirm-age"]')
    await page.click('[data-testid="product-card"]')

    // Try to add to cart
    await page.click('[data-testid="add-to-cart"]')

    // Should show age verification again
    await expect(page.locator('[data-testid="age-verification-modal"]')).toBeVisible()
  })

  test('can add wine to cart after verification', async ({ page }) => {
    await page.click('[data-testid="confirm-age"]')
    await page.click('[data-testid="product-card"]')

    // Add to cart
    await page.click('[data-testid="add-to-cart"]')

    // Confirm age in modal
    await page.click('[data-testid="modal-confirm-age"]')

    // Verify cart
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')
  })

  test('displays wine rating', async ({ page }) => {
    await page.click('[data-testid="confirm-age"]')
    await page.click('[data-testid="product-card"]')

    // Check for rating
    await expect(page.locator('[data-testid="wine-rating"]')).toBeVisible()
  })
})

test.describe('Alcohol Merchant Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fr/merchant/login')
    await page.fill('[name="email"]', 'wine@test.com')
    await page.fill('[name="password"]', 'password')
    await page.click('[type="submit"]')
  })

  test('displays vintage management', async ({ page }) => {
    await page.goto('/fr/merchant/vintages')

    await expect(page.locator('h1')).toContainText('Millésimes')
    await expect(page.locator('table')).toBeVisible()
  })

  test('can add new vintage', async ({ page }) => {
    await page.goto('/fr/merchant/vintages')

    await page.click('[data-testid="add-vintage"]')

    // Fill vintage details
    await page.fill('[name="productName"]', 'Château Test')
    await page.fill('[name="year"]', '2020')
    await page.fill('[name="region"]', 'Bordeaux')
    await page.fill('[name="price"]', '45')

    await page.click('[type="submit"]')

    // Verify vintage added
    await expect(page.locator('table')).toContainText('Château Test')
  })

  test('displays compliance page', async ({ page }) => {
    await page.goto('/fr/merchant/compliance')

    await expect(page.locator('h1')).toContainText('Conformité')
  })

  test('can configure age verification', async ({ page }) => {
    await page.goto('/fr/merchant/compliance')

    // Toggle age verification
    const toggle = page.locator('[data-testid="age-verification-toggle"]')
    await toggle.click()

    // Verify toggle state
    await expect(toggle).toBeChecked()
  })

  test('displays inventory analytics', async ({ page }) => {
    await page.goto('/fr/merchant/analytics/inventory')

    await expect(page.locator('h1')).toContainText('Inventaire')
    await expect(page.locator('[data-testid="region-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="vintage-stats"]')).toBeVisible()
  })

  test('shows low stock alerts', async ({ page }) => {
    await page.goto('/fr/merchant/analytics/inventory')

    // Check for low stock section
    await expect(page.locator('[data-testid="low-stock-table"]')).toBeVisible()
  })
})
