import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import App from './App'
import { useTodoStore } from './store/useTodoStore'

beforeEach(() => {
  useTodoStore.setState({ todos: [], filter: 'all' })
})

describe('App', () => {
  it('renders the Todos heading', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /^todos$/i }),
    ).toBeInTheDocument()
  })

  it('renders the add todo input', () => {
    render(<App />)
    expect(
      screen.getByRole('textbox', { name: /what needs to be done/i }),
    ).toBeInTheDocument()
  })

  it('renders filter tabs', () => {
    render(<App />)
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('renders the footer with item count', () => {
    render(<App />)
    expect(screen.getByText(/items left/i)).toBeInTheDocument()
  })
})
