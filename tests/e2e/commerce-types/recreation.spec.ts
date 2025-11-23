import { test, expect } from '@playwright/test'

test.describe('Recreation Commerce Type', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fr/stores/fitness-demo')
  })

  test('displays activity catalog', async ({ page }) => {
    await expect(page.locator('[data-testid="activity-list"]')).toBeVisible()
  })

  test('shows activity with schedule', async ({ page }) => {
    await page.click('[data-testid="activity-card"]')

    // Check for schedule
    await expect(page.locator('[data-testid="activity-schedule"]')).toBeVisible()
  })

  test('displays available sessions', async ({ page }) => {
    await page.click('[data-testid="activity-card"]')

    // Check for session list
    await expect(page.locator('[data-testid="session-list"]')).toBeVisible()
  })

  test('shows instructor info', async ({ page }) => {
    await page.click('[data-testid="activity-card"]')

    // Check for instructor
    await expect(page.locator('[data-testid="instructor-info"]')).toBeVisible()
  })

  test('displays capacity and spots remaining', async ({ page }) => {
    await page.click('[data-testid="activity-card"]')

    // Check for capacity info
    await expect(page.locator('[data-testid="spots-remaining"]')).toBeVisible()
  })

  test('can select session', async ({ page }) => {
    await page.click('[data-testid="activity-card"]')

    // Select a session
    await page.locator('[data-testid="session-slot"]:not([disabled])').first().click()

    // Verify selection
    await expect(page.locator('[data-testid="selected-session"]')).toBeVisible()
  })

  test('can book session', async ({ page }) => {
    await page.click('[data-testid="activity-card"]')

    // Select session
    await page.locator('[data-testid="session-slot"]:not([disabled])').first().click()

    // Book
    await page.click('[data-testid="book-session"]')

    // Verify cart
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')
  })

  test('displays membership options', async ({ page }) => {
    await page.goto('/fr/stores/fitness-demo/memberships')

    // Check for membership plans
    await expect(page.locator('[data-testid="membership-plans"]')).toBeVisible()
  })

  test('can filter activities by type', async ({ page }) => {
    // Apply filter
    await page.click('[data-testid="filter-yoga"]')

    // Verify filtered results
    const count = await page.locator('[data-testid="activity-card"]').count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})

test.describe('Recreation Merchant Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fr/merchant/login')
    await page.fill('[name="email"]', 'fitness@test.com')
    await page.fill('[name="password"]', 'password')
    await page.click('[type="submit"]')
  })

  test('displays schedule management', async ({ page }) => {
    await page.goto('/fr/merchant/schedules')

    await expect(page.locator('h1')).toContainText('Horaires')
    await expect(page.locator('[data-testid="weekly-schedule"]')).toBeVisible()
  })

  test('can add session to schedule', async ({ page }) => {
    await page.goto('/fr/merchant/schedules')

    await page.click('[data-testid="add-session"]')

    // Fill session details
    await page.selectOption('[name="activityId"]', { index: 1 })
    await page.selectOption('[name="day"]', 'monday')
    await page.fill('[name="time"]', '09:00')

    await page.click('[type="submit"]')

    // Verify session added
    await expect(page.locator('[data-testid="weekly-schedule"]')).toContainText('09:00')
  })

  test('displays calendar view', async ({ page }) => {
    await page.goto('/fr/merchant/calendar')

    await expect(page.locator('[data-testid="monthly-calendar"]')).toBeVisible()
  })

  test('can view session details', async ({ page }) => {
    await page.goto('/fr/merchant/calendar')

    // Click on a session
    await page.click('[data-testid="calendar-session"]')

    // Check for detail modal
    await expect(page.locator('[data-testid="session-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="participants-list"]')).toBeVisible()
  })

  test('displays attendance analytics', async ({ page }) => {
    await page.goto('/fr/merchant/analytics/attendance')

    await expect(page.locator('h1')).toContainText('Fréquentation')
    await expect(page.locator('[data-testid="attendance-chart"]')).toBeVisible()
  })

  test('shows no-show rates', async ({ page }) => {
    await page.goto('/fr/merchant/analytics/attendance')

    // Check for no-show stats
    await expect(page.locator('[data-testid="noshow-rate"]')).toBeVisible()
  })

  test('can check-in participants', async ({ page }) => {
    await page.goto('/fr/merchant/calendar')

    // Open session
    await page.click('[data-testid="calendar-session"]')

    // Check in a participant
    await page.locator('[data-testid="checkin-button"]').first().click()

    // Verify checked in
    await expect(page.locator('[data-testid="participant-row"]').first()).toHaveClass(/checked-in/)
  })
})
