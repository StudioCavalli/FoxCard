import { test, expect } from '@playwright/test'

test.describe('Services Commerce Type', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fr/stores/salon-demo')
  })

  test('displays service catalog', async ({ page }) => {
    await expect(page.locator('[data-testid="service-list"]')).toBeVisible()
  })

  test('shows service with duration and staff', async ({ page }) => {
    await page.click('[data-testid="service-card"]')

    // Check for duration
    await expect(page.locator('[data-testid="service-duration"]')).toContainText('min')

    // Check for staff selector
    await expect(page.locator('[data-testid="staff-selector"]')).toBeVisible()
  })

  test('displays availability calendar', async ({ page }) => {
    await page.click('[data-testid="service-card"]')

    // Check for date picker
    await expect(page.locator('[data-testid="date-picker"]')).toBeVisible()

    // Check for time slots
    await expect(page.locator('[data-testid="time-slots"]')).toBeVisible()
  })

  test('allows staff selection', async ({ page }) => {
    await page.click('[data-testid="service-card"]')

    // Select staff member
    const staffSelector = page.locator('[data-testid="staff-selector"]')
    await staffSelector.selectOption({ index: 1 })

    // Verify time slots update
    await expect(page.locator('[data-testid="time-slots"]')).toBeVisible()
  })

  test('can select time slot', async ({ page }) => {
    await page.click('[data-testid="service-card"]')

    // Select a date
    await page.click('[data-testid="date-picker"] button:not([disabled])').first()

    // Select time slot
    await page.click('[data-testid="time-slot"]:not([disabled])').first()

    // Verify selection
    await expect(page.locator('[data-testid="selected-time"]')).toBeVisible()
  })

  test('can book appointment', async ({ page }) => {
    await page.click('[data-testid="service-card"]')

    // Select date and time
    await page.click('[data-testid="date-picker"] button:not([disabled])').first()
    await page.click('[data-testid="time-slot"]:not([disabled])').first()

    // Book
    await page.click('[data-testid="book-appointment"]')

    // Verify booking confirmation
    await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible()
  })

  test('displays staff member profiles', async ({ page }) => {
    await page.goto('/fr/stores/salon-demo/staff')

    // Check for staff cards
    await expect(page.locator('[data-testid="staff-card"]')).toBeVisible()

    // Check for specialties
    await expect(page.locator('[data-testid="staff-specialties"]')).toBeVisible()
  })
})

test.describe('Services Merchant Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fr/merchant/login')
    await page.fill('[name="email"]', 'salon@test.com')
    await page.fill('[name="password"]', 'password')
    await page.click('[type="submit"]')
  })

  test('displays appointment calendar', async ({ page }) => {
    await page.goto('/fr/merchant/appointments')

    await expect(page.locator('h1')).toContainText('Rendez-vous')
    await expect(page.locator('[data-testid="appointment-calendar"]')).toBeVisible()
  })

  test('can create manual appointment', async ({ page }) => {
    await page.goto('/fr/merchant/appointments')

    await page.click('[data-testid="add-appointment"]')

    // Fill appointment details
    await page.fill('[name="clientName"]', 'Marie Dupont')
    await page.fill('[name="clientPhone"]', '0612345678')
    await page.selectOption('[name="serviceId"]', { index: 1 })
    await page.selectOption('[name="staffId"]', { index: 1 })

    await page.click('[type="submit"]')

    // Verify appointment added
    await expect(page.locator('[data-testid="appointment-calendar"]')).toContainText('Marie')
  })

  test('displays staff schedule management', async ({ page }) => {
    await page.goto('/fr/merchant/staff')

    await expect(page.locator('[data-testid="staff-list"]')).toBeVisible()
  })

  test('can manage staff availability', async ({ page }) => {
    await page.goto('/fr/merchant/staff')

    // Click on staff member
    await page.click('[data-testid="staff-card"]')

    // Edit schedule
    await page.click('[data-testid="edit-schedule"]')

    // Toggle a day
    await page.click('[data-testid="day-monday"]')

    await page.click('[type="submit"]')

    // Verify schedule updated
    await expect(page.locator('[data-testid="schedule-updated"]')).toBeVisible()
  })
})
