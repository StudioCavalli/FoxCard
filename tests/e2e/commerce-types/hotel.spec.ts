import { test, expect } from '@playwright/test'

test.describe('Hotel Commerce Type', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a hotel store
    await page.goto('/fr/stores/hotel-demo')
  })

  test('displays room availability calendar', async ({ page }) => {
    // Navigate to a room product
    await page.click('[data-testid="product-card"]')

    // Check for booking calendar
    await expect(page.locator('[data-testid="booking-calendar"]')).toBeVisible()
  })

  test('allows date selection for booking', async ({ page }) => {
    await page.click('[data-testid="product-card"]')

    // Select check-in date
    const calendar = page.locator('[data-testid="booking-calendar"]')
    await calendar.locator('button:not([disabled])').first().click()

    // Select check-out date
    await calendar.locator('button:not([disabled])').nth(3).click()

    // Verify dates are selected
    await expect(page.locator('[data-testid="selected-dates"]')).toContainText('nuit')
  })

  test('shows amenities list', async ({ page }) => {
    await page.click('[data-testid="product-card"]')

    // Check for amenities section
    await expect(page.locator('[data-testid="amenity-list"]')).toBeVisible()
  })

  test('displays guest selector', async ({ page }) => {
    await page.click('[data-testid="product-card"]')

    // Check for guest count input
    const guestInput = page.locator('[data-testid="guest-selector"]')
    await expect(guestInput).toBeVisible()

    // Increment guests
    await guestInput.locator('button:last-child').click()
    await expect(guestInput.locator('input')).toHaveValue('2')
  })

  test('calculates total price based on nights', async ({ page }) => {
    await page.click('[data-testid="product-card"]')

    // Select dates (3 nights)
    const calendar = page.locator('[data-testid="booking-calendar"]')
    await calendar.locator('button:not([disabled])').first().click()
    await calendar.locator('button:not([disabled])').nth(3).click()

    // Verify price calculation
    await expect(page.locator('[data-testid="total-price"]')).toContainText('€')
  })

  test('can add room to cart', async ({ page }) => {
    await page.click('[data-testid="product-card"]')

    // Select dates
    const calendar = page.locator('[data-testid="booking-calendar"]')
    await calendar.locator('button:not([disabled])').first().click()
    await calendar.locator('button:not([disabled])').nth(1).click()

    // Add to cart
    await page.click('[data-testid="add-to-cart"]')

    // Verify cart updated
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')
  })
})

test.describe('Hotel Merchant Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as merchant
    await page.goto('/fr/merchant/login')
    await page.fill('[name="email"]', 'hotel@test.com')
    await page.fill('[name="password"]', 'password')
    await page.click('[type="submit"]')
  })

  test('displays room management page', async ({ page }) => {
    await page.goto('/fr/merchant/rooms')

    await expect(page.locator('h1')).toContainText('Chambres')
    await expect(page.locator('table')).toBeVisible()
  })

  test('can add new room', async ({ page }) => {
    await page.goto('/fr/merchant/rooms')

    await page.click('[data-testid="add-room"]')

    // Fill room details
    await page.fill('[name="name"]', 'Suite Deluxe')
    await page.fill('[name="basePrice"]', '250')
    await page.fill('[name="maxGuests"]', '4')

    await page.click('[type="submit"]')

    // Verify room added
    await expect(page.locator('table')).toContainText('Suite Deluxe')
  })

  test('displays housekeeping schedule', async ({ page }) => {
    await page.goto('/fr/merchant/housekeeping')

    await expect(page.locator('h1')).toContainText('Housekeeping')
    await expect(page.locator('[data-testid="room-grid"]')).toBeVisible()
  })

  test('can update room status', async ({ page }) => {
    await page.goto('/fr/merchant/housekeeping')

    // Click on a room
    await page.click('[data-testid="room-card"]')

    // Update status
    await page.click('[data-testid="status-clean"]')

    // Verify status updated
    await expect(page.locator('[data-testid="room-card"]')).toHaveClass(/clean/)
  })
})
