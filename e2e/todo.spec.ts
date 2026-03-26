import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Helper: clear persisted store state and reload so Zustand reinitializes fresh
async function freshLoad(
  page: Parameters<typeof test>[1] extends { page: infer P } ? P : never,
) {
  await page.evaluate(() => localStorage.clear())
  await page.reload()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await freshLoad(page)
})

// ─── Helpers ────────────────────────────────────────────────────────────────

async function addTodo(
  page: Parameters<typeof test>[1] extends { page: infer P } ? P : never,
  text: string,
) {
  await page.getByPlaceholder('What needs to be done?').fill(text)
  await page.getByRole('button', { name: 'Add' }).click()
}

// ─── Core Flows ──────────────────────────────────────────────────────────────

test.describe('Core Flows', () => {
  test('add todo via button click', async ({ page }) => {
    await page.getByPlaceholder('What needs to be done?').fill('Buy groceries')
    await page.getByRole('button', { name: 'Add' }).click()

    await expect(page.getByText('Buy groceries')).toBeVisible()
  })

  test('add todo via Enter key', async ({ page }) => {
    await page.getByPlaceholder('What needs to be done?').fill('Walk the dog')
    await page.keyboard.press('Enter')

    await expect(page.getByText('Walk the dog')).toBeVisible()
  })

  test('toggle todo marks it as completed with line-through', async ({
    page,
  }) => {
    await addTodo(page, 'Read a book')

    const checkbox = page.getByRole('checkbox', { name: 'Read a book' })
    await checkbox.check()

    // Label should have line-through styling (completed class)
    const label = page.getByText('Read a book')
    await expect(label).toHaveClass(/line-through/)
    await expect(checkbox).toBeChecked()
  })

  test('delete todo removes it from the list', async ({ page }) => {
    await addTodo(page, 'Clean the house')

    await page.getByRole('button', { name: 'Delete "Clean the house"' }).click()

    await expect(page.getByText('Clean the house')).not.toBeVisible()
  })

  test('clear completed removes completed todos and keeps active ones', async ({
    page,
  }) => {
    await addTodo(page, 'Active task')
    await addTodo(page, 'Completed task')

    await page.getByRole('checkbox', { name: 'Completed task' }).check()
    await page.getByRole('button', { name: 'Clear completed' }).click()

    await expect(page.getByText('Active task')).toBeVisible()
    await expect(page.getByText('Completed task')).not.toBeVisible()
  })
})

// ─── Filtering ───────────────────────────────────────────────────────────────

test.describe('Filtering', () => {
  test.beforeEach(async ({ page }) => {
    // Set up: two todos, one completed
    await addTodo(page, 'Active todo')
    await addTodo(page, 'Completed todo')
    await page.getByRole('checkbox', { name: 'Completed todo' }).check()
  })

  test('Active filter shows only uncompleted todos', async ({ page }) => {
    await page.getByRole('tab', { name: 'Active' }).click()

    await expect(page.getByText('Active todo')).toBeVisible()
    await expect(page.getByText('Completed todo')).not.toBeVisible()
  })

  test('Completed filter shows only completed todos', async ({ page }) => {
    await page.getByRole('tab', { name: 'Completed' }).click()

    await expect(page.getByText('Completed todo')).toBeVisible()
    await expect(page.getByText('Active todo')).not.toBeVisible()
  })

  test('All filter shows all todos after filtering', async ({ page }) => {
    await page.getByRole('tab', { name: 'Completed' }).click()
    await page.getByRole('tab', { name: 'All' }).click()

    await expect(page.getByText('Active todo')).toBeVisible()
    await expect(page.getByText('Completed todo')).toBeVisible()
  })

  test('footer count shows active items regardless of current filter', async ({
    page,
  }) => {
    await addTodo(page, 'Another active todo')
    // Now we have: Active todo, Another active todo (2 active), Completed todo (1 completed)

    // Check count on All filter
    await expect(
      page.getByRole('contentinfo').getByText('2 items left'),
    ).toBeVisible()

    // Switch to Completed — count should still reflect total active
    await page.getByRole('tab', { name: 'Completed' }).click()
    await expect(
      page.getByRole('contentinfo').getByText('2 items left'),
    ).toBeVisible()

    // Switch to Active — count stays the same
    await page.getByRole('tab', { name: 'Active' }).click()
    await expect(
      page.getByRole('contentinfo').getByText('2 items left'),
    ).toBeVisible()
  })
})

// ─── Persistence ─────────────────────────────────────────────────────────────

test.describe('Persistence', () => {
  test('todos persist after page reload', async ({ page }) => {
    await addTodo(page, 'Persistent todo')
    await page.getByRole('checkbox', { name: 'Persistent todo' }).check()

    await page.reload()

    const todo = page.getByText('Persistent todo')
    await expect(todo).toBeVisible()
    await expect(todo).toHaveClass(/line-through/)
  })
})

// ─── Empty States ─────────────────────────────────────────────────────────────

test.describe('Empty States', () => {
  test('shows default empty state when no todos exist', async ({ page }) => {
    await expect(page.getByText('No todos yet. Add one above.')).toBeVisible()
  })

  test('Active filter empty state when all todos are completed', async ({
    page,
  }) => {
    await addTodo(page, 'Finish it')
    await page.getByRole('checkbox', { name: 'Finish it' }).check()

    await page.getByRole('tab', { name: 'Active' }).click()

    await expect(
      page.getByText('Nothing left to do. Great work.'),
    ).toBeVisible()
  })

  test('Completed filter empty state with no completed todos', async ({
    page,
  }) => {
    await page.getByRole('tab', { name: 'Completed' }).click()

    await expect(page.getByText('No completed todos yet.')).toBeVisible()
  })
})

// ─── Keyboard Navigation ──────────────────────────────────────────────────────

test.describe('Keyboard Navigation', () => {
  test('input has autofocus and submits with Enter', async ({ page }) => {
    // Input has autoFocus, so it should be focused on load
    const input = page.getByPlaceholder('What needs to be done?')
    await expect(input).toBeFocused()

    await input.fill('Keyboard added todo')
    await page.keyboard.press('Enter')

    await expect(page.getByText('Keyboard added todo')).toBeVisible()
  })

  test('can toggle a todo with keyboard Space on checkbox', async ({
    page,
  }) => {
    await addTodo(page, 'Toggle with keyboard')

    const checkbox = page.getByRole('checkbox', {
      name: 'Toggle with keyboard',
    })
    await checkbox.focus()
    await page.keyboard.press('Space')

    await expect(checkbox).toBeChecked()
    await expect(page.getByText('Toggle with keyboard')).toHaveClass(
      /line-through/,
    )
  })
})

// ─── Accessibility ────────────────────────────────────────────────────────────

test.describe('Accessibility', () => {
  test('page with todos has no axe violations', async ({ page }) => {
    await addTodo(page, 'Axe test todo one')
    await addTodo(page, 'Axe test todo two')
    await page.getByRole('checkbox', { name: 'Axe test todo two' }).check()

    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})
