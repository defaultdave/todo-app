import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Todo App', () => {
  test('loads the home page', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Todo App' })).toBeVisible()
  })

  test('has no accessibility violations', async ({ page }) => {
    await page.goto('/')
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})
