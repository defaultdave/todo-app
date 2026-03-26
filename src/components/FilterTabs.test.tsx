import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import FilterTabs from './FilterTabs'
import { useTodoStore } from '../store/useTodoStore'

beforeEach(() => {
  useTodoStore.setState({ todos: [], filter: 'all' })
})

describe('FilterTabs', () => {
  it('renders All, Active, and Completed tabs', () => {
    render(<FilterTabs />)
    expect(screen.getByRole('tab', { name: /^all$/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /^active$/i })).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /^completed$/i }),
    ).toBeInTheDocument()
  })

  it('has a tablist with accessible label', () => {
    render(<FilterTabs />)
    expect(
      screen.getByRole('tablist', { name: /filter todos/i }),
    ).toBeInTheDocument()
  })

  it('marks the current filter tab as aria-selected', () => {
    render(<FilterTabs />)
    expect(screen.getByRole('tab', { name: /^all$/i })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: /^active$/i })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    expect(screen.getByRole('tab', { name: /^completed$/i })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  it('calls setFilter with "active" when Active tab is clicked', () => {
    render(<FilterTabs />)
    fireEvent.click(screen.getByRole('tab', { name: /^active$/i }))
    expect(useTodoStore.getState().filter).toBe('active')
  })

  it('calls setFilter with "completed" when Completed tab is clicked', () => {
    render(<FilterTabs />)
    fireEvent.click(screen.getByRole('tab', { name: /^completed$/i }))
    expect(useTodoStore.getState().filter).toBe('completed')
  })

  it('calls setFilter with "all" when All tab is clicked', () => {
    useTodoStore.setState({ filter: 'active' })
    render(<FilterTabs />)
    fireEvent.click(screen.getByRole('tab', { name: /^all$/i }))
    expect(useTodoStore.getState().filter).toBe('all')
  })

  it('updates aria-selected after clicking a different tab', () => {
    render(<FilterTabs />)
    fireEvent.click(screen.getByRole('tab', { name: /^active$/i }))
    expect(screen.getByRole('tab', { name: /^active$/i })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: /^all$/i })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })
})
