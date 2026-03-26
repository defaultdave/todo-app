import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import AddTodoForm from './AddTodoForm'
import { useTodoStore } from '../store/useTodoStore'

beforeEach(() => {
  useTodoStore.setState({ todos: [], filter: 'all' })
})

describe('AddTodoForm', () => {
  it('renders an input and Add button', () => {
    render(<AddTodoForm />)
    expect(
      screen.getByRole('textbox', { name: /what needs to be done/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
  })

  it('Add button is disabled when input is empty', () => {
    render(<AddTodoForm />)
    expect(screen.getByRole('button', { name: /add/i })).toBeDisabled()
  })

  it('Add button is enabled when input has text', () => {
    render(<AddTodoForm />)
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Hello' },
    })
    expect(screen.getByRole('button', { name: /add/i })).toBeEnabled()
  })

  it('adds a todo on button click and clears the input', () => {
    render(<AddTodoForm />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Buy groceries' } })
    fireEvent.click(screen.getByRole('button', { name: /add/i }))
    expect(useTodoStore.getState().todos).toHaveLength(1)
    expect(useTodoStore.getState().todos[0].text).toBe('Buy groceries')
    expect(input).toHaveValue('')
  })

  it('adds a todo on Enter key and clears the input', () => {
    render(<AddTodoForm />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Read a book' } })
    fireEvent.submit(input.closest('form')!)
    expect(useTodoStore.getState().todos).toHaveLength(1)
    expect(useTodoStore.getState().todos[0].text).toBe('Read a book')
    expect(input).toHaveValue('')
  })

  it('does not add a todo when input is only whitespace', () => {
    render(<AddTodoForm />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '   ' } })
    // Button stays disabled for whitespace
    expect(screen.getByRole('button', { name: /add/i })).toBeDisabled()
    expect(useTodoStore.getState().todos).toHaveLength(0)
  })
})
