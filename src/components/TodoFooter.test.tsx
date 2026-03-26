import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import TodoFooter from './TodoFooter'
import { useTodoStore } from '../store/useTodoStore'

beforeEach(() => {
  useTodoStore.setState({ todos: [], filter: 'all' })
})

describe('TodoFooter', () => {
  it('shows "0 items left" when no todos', () => {
    render(<TodoFooter />)
    expect(screen.getByText(/0 items left/i)).toBeInTheDocument()
  })

  it('shows "1 item left" (singular) for one active todo', () => {
    useTodoStore.getState().addTodo('One task')
    render(<TodoFooter />)
    expect(screen.getByText('1 item left')).toBeInTheDocument()
  })

  it('shows correct active count with multiple todos', () => {
    useTodoStore.getState().addTodo('A')
    useTodoStore.getState().addTodo('B')
    useTodoStore.getState().addTodo('C')
    render(<TodoFooter />)
    expect(screen.getByText('3 items left')).toBeInTheDocument()
  })

  it('does not count completed todos in the active count', () => {
    useTodoStore.getState().addTodo('Active')
    useTodoStore.getState().addTodo('Done')
    const id = useTodoStore.getState().todos[0].id
    useTodoStore.getState().toggleTodo(id)
    render(<TodoFooter />)
    expect(screen.getByText('1 item left')).toBeInTheDocument()
  })

  it('hides "Clear completed" button when no completed todos', () => {
    useTodoStore.getState().addTodo('Active')
    render(<TodoFooter />)
    expect(
      screen.queryByRole('button', { name: /clear completed/i }),
    ).not.toBeInTheDocument()
  })

  it('shows "Clear completed" button when there are completed todos', () => {
    useTodoStore.getState().addTodo('Task')
    const id = useTodoStore.getState().todos[0].id
    useTodoStore.getState().toggleTodo(id)
    render(<TodoFooter />)
    expect(
      screen.getByRole('button', { name: /clear completed/i }),
    ).toBeInTheDocument()
  })

  it('clears completed todos when button is clicked', () => {
    useTodoStore.getState().addTodo('Active')
    useTodoStore.getState().addTodo('Done')
    const id = useTodoStore.getState().todos[0].id
    useTodoStore.getState().toggleTodo(id)
    render(<TodoFooter />)
    fireEvent.click(screen.getByRole('button', { name: /clear completed/i }))
    expect(useTodoStore.getState().todos).toHaveLength(1)
    expect(useTodoStore.getState().todos[0].text).toBe('Active')
  })
})
