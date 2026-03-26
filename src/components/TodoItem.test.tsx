import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import TodoItem from './TodoItem'
import { useTodoStore } from '../store/useTodoStore'
import { type Todo } from '../types'

const SAMPLE_TODO: Todo = {
  id: 'test-id-1',
  text: 'Write tests',
  completed: false,
  createdAt: new Date().toISOString(),
}

const COMPLETED_TODO: Todo = {
  ...SAMPLE_TODO,
  completed: true,
}

beforeEach(() => {
  useTodoStore.setState({ todos: [SAMPLE_TODO], filter: 'all' })
})

describe('TodoItem', () => {
  it('renders the todo text', () => {
    render(<TodoItem todo={SAMPLE_TODO} />)
    expect(screen.getByText('Write tests')).toBeInTheDocument()
  })

  it('renders an unchecked checkbox for an active todo', () => {
    render(<TodoItem todo={SAMPLE_TODO} />)
    const checkbox = screen.getByRole('checkbox', { name: /write tests/i })
    expect(checkbox).not.toBeChecked()
  })

  it('renders a checked checkbox for a completed todo', () => {
    render(<TodoItem todo={COMPLETED_TODO} />)
    const checkbox = screen.getByRole('checkbox', { name: /write tests/i })
    expect(checkbox).toBeChecked()
  })

  it('applies line-through style to completed todo label', () => {
    render(<TodoItem todo={COMPLETED_TODO} />)
    const label = screen.getByText('Write tests')
    expect(label).toHaveClass('line-through')
  })

  it('calls toggleTodo when checkbox is clicked', () => {
    render(<TodoItem todo={SAMPLE_TODO} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(useTodoStore.getState().todos[0].completed).toBe(true)
  })

  it('renders a delete button with accessible label', () => {
    render(<TodoItem todo={SAMPLE_TODO} />)
    expect(
      screen.getByRole('button', { name: /delete "write tests"/i }),
    ).toBeInTheDocument()
  })

  it('calls deleteTodo when delete button is clicked', () => {
    render(<TodoItem todo={SAMPLE_TODO} />)
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(useTodoStore.getState().todos).toHaveLength(0)
  })
})
