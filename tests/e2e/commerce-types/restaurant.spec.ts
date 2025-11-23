import { test, expect } from '@playwright/test'

test.describe('Restaurant Commerce Type', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fr/stores/restaurant-demo')
  })

  test('displays menu with categories', async ({ page }) => {
    // Check for category tabs
    await expect(page.locator('[data-testid="menu-categories"]')).toBeVisible()

    // Verify category navigation
    await page.click('[data-testid="category-entrees"]')
    await expect(page.locator('[data-testid="menu-items"]')).toBeVisible()
  })

  test('shows menu item with modifiers', async ({ page }) => {
    await page.click('[data-testid="menu-item"]')

    // Check for modifier options
    await expect(page.locator('[data-testid="modifier-group"]')).toBeVisible()
  })

  test('allows customization of menu item', async ({ page }) => {
    await page.click('[data-testid="menu-item"]')

    // Select modifiers
    await page.click('[data-testid="modifier-option"]:first-child')

    // Verify price updates
    await expect(page.locator('[data-testid="item-price"]')).toContainText('€')
  })

  test('can add item to cart with modifiers', async ({ page }) => {
    await page.click('[data-testid="menu-item"]')

    // Select a modifier
    await page.click('[data-testid="modifier-option"]')

    // Add to cart
    await page.click('[data-testid="add-to-cart"]')

    // Verify cart
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')
  })

  test('displays allergen information', async ({ page }) => {
    await page.click('[data-testid="menu-item"]')

    // Check for allergen icons
    await expect(page.locator('[data-testid="allergen-list"]')).toBeVisible()
  })

  test('shows preparation time', async ({ page }) => {
    await page.click('[data-testid="menu-item"]')

    // Check for prep time
    await expect(page.locator('[data-testid="prep-time"]')).toContainText('min')
  })

  test('can filter by dietary preferences', async ({ page }) => {
    // Apply vegetarian filter
    await page.click('[data-testid="filter-vegetarian"]')

    // Verify filtered results
    const items = page.locator('[data-testid="menu-item"]')
    const count = await items.count()

    for (let i = 0; i < count; i++) {
      await expect(items.nth(i).locator('[data-testid="vegetarian-badge"]')).toBeVisible()
    }
  })
})

test.describe('Restaurant Merchant Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fr/merchant/login')
    await page.fill('[name="email"]', 'restaurant@test.com')
    await page.fill('[name="password"]', 'password')
    await page.click('[type="submit"]')
  })

  test('displays live orders', async ({ page }) => {
    await page.goto('/fr/merchant/orders/live')

    await expect(page.locator('h1')).toContainText('Commandes')
    await expect(page.locator('[data-testid="order-kanban"]')).toBeVisible()
  })

  test('can update order status', async ({ page }) => {
    await page.goto('/fr/merchant/orders/live')

    // Drag order to next column or click status button
    const order = page.locator('[data-testid="order-card"]').first()
    await order.locator('[data-testid="mark-preparing"]').click()

    // Verify status updated
    await expect(order).toHaveAttribute('data-status', 'preparing')
  })

  test('displays table management', async ({ page }) => {
    await page.goto('/fr/merchant/tables')

    await expect(page.locator('h1')).toContainText('Tables')
    await expect(page.locator('[data-testid="table-grid"]')).toBeVisible()
  })

  test('can manage kitchen display', async ({ page }) => {
    await page.goto('/fr/merchant/kitchen')

    await expect(page.locator('[data-testid="kitchen-display"]')).toBeVisible()

    // Mark item as completed
    await page.click('[data-testid="complete-item"]')

    // Verify item marked
    await expect(page.locator('[data-testid="completed-items"]')).toContainText('1')
  })
})
