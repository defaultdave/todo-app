import { describe, it, expect, beforeEach } from 'vitest'
import {
  useTodoStore,
  selectFilteredTodos,
  selectActiveCount,
  selectHasCompleted,
} from './useTodoStore'

// Helper to get a fresh store state for each test
beforeEach(() => {
  useTodoStore.setState({ todos: [], filter: 'all' })
})

describe('useTodoStore — addTodo', () => {
  it('adds a todo to the list', () => {
    useTodoStore.getState().addTodo('Buy milk')
    const { todos } = useTodoStore.getState()
    expect(todos).toHaveLength(1)
    expect(todos[0].text).toBe('Buy milk')
    expect(todos[0].completed).toBe(false)
    expect(todos[0].id).toBeTruthy()
    expect(todos[0].createdAt).toBeTruthy()
  })

  it('prepends new todos (newest first)', () => {
    useTodoStore.getState().addTodo('First')
    useTodoStore.getState().addTodo('Second')
    const { todos } = useTodoStore.getState()
    expect(todos[0].text).toBe('Second')
    expect(todos[1].text).toBe('First')
  })

  it('trims whitespace from todo text', () => {
    useTodoStore.getState().addTodo('  hello  ')
    expect(useTodoStore.getState().todos[0].text).toBe('hello')
  })

  it('rejects empty text', () => {
    useTodoStore.getState().addTodo('')
    expect(useTodoStore.getState().todos).toHaveLength(0)
  })

  it('rejects whitespace-only text', () => {
    useTodoStore.getState().addTodo('   ')
    expect(useTodoStore.getState().todos).toHaveLength(0)
  })
})

describe('useTodoStore — toggleTodo', () => {
  it('toggles a todo to completed', () => {
    useTodoStore.getState().addTodo('Task')
    const id = useTodoStore.getState().todos[0].id
    useTodoStore.getState().toggleTodo(id)
    expect(useTodoStore.getState().todos[0].completed).toBe(true)
  })

  it('toggles a todo back to active', () => {
    useTodoStore.getState().addTodo('Task')
    const id = useTodoStore.getState().todos[0].id
    useTodoStore.getState().toggleTodo(id)
    useTodoStore.getState().toggleTodo(id)
    expect(useTodoStore.getState().todos[0].completed).toBe(false)
  })

  it('only toggles the targeted todo', () => {
    useTodoStore.getState().addTodo('A')
    useTodoStore.getState().addTodo('B')
    const todos = useTodoStore.getState().todos
    useTodoStore.getState().toggleTodo(todos[0].id)
    expect(useTodoStore.getState().todos[0].completed).toBe(true)
    expect(useTodoStore.getState().todos[1].completed).toBe(false)
  })
})

describe('useTodoStore — deleteTodo', () => {
  it('removes a todo by id', () => {
    useTodoStore.getState().addTodo('Delete me')
    const id = useTodoStore.getState().todos[0].id
    useTodoStore.getState().deleteTodo(id)
    expect(useTodoStore.getState().todos).toHaveLength(0)
  })

  it('only removes the targeted todo', () => {
    useTodoStore.getState().addTodo('Keep')
    useTodoStore.getState().addTodo('Remove')
    const todos = useTodoStore.getState().todos
    useTodoStore.getState().deleteTodo(todos[0].id)
    expect(useTodoStore.getState().todos).toHaveLength(1)
    expect(useTodoStore.getState().todos[0].text).toBe('Keep')
  })
})

describe('useTodoStore — clearCompleted', () => {
  it('removes all completed todos', () => {
    useTodoStore.getState().addTodo('Active')
    useTodoStore.getState().addTodo('Done')
    const todos = useTodoStore.getState().todos
    useTodoStore.getState().toggleTodo(todos[0].id)
    useTodoStore.getState().clearCompleted()
    const remaining = useTodoStore.getState().todos
    expect(remaining).toHaveLength(1)
    expect(remaining[0].text).toBe('Active')
  })

  it('does nothing when no todos are completed', () => {
    useTodoStore.getState().addTodo('Active')
    useTodoStore.getState().clearCompleted()
    expect(useTodoStore.getState().todos).toHaveLength(1)
  })
})

describe('useTodoStore — setFilter', () => {
  it('sets the filter value', () => {
    useTodoStore.getState().setFilter('active')
    expect(useTodoStore.getState().filter).toBe('active')
  })
})

describe('selectFilteredTodos', () => {
  it('returns all todos when filter is "all"', () => {
    useTodoStore.getState().addTodo('A')
    useTodoStore.getState().addTodo('B')
    const filtered = selectFilteredTodos(useTodoStore.getState())
    expect(filtered).toHaveLength(2)
  })

  it('returns only active todos when filter is "active"', () => {
    useTodoStore.getState().addTodo('Active')
    useTodoStore.getState().addTodo('Done')
    const id = useTodoStore.getState().todos[0].id
    useTodoStore.getState().toggleTodo(id)
    useTodoStore.setState({ filter: 'active' })
    const filtered = selectFilteredTodos(useTodoStore.getState())
    expect(filtered).toHaveLength(1)
    expect(filtered[0].text).toBe('Active')
  })

  it('returns only completed todos when filter is "completed"', () => {
    useTodoStore.getState().addTodo('Active')
    useTodoStore.getState().addTodo('Done')
    const id = useTodoStore.getState().todos[0].id
    useTodoStore.getState().toggleTodo(id)
    useTodoStore.setState({ filter: 'completed' })
    const filtered = selectFilteredTodos(useTodoStore.getState())
    expect(filtered).toHaveLength(1)
    expect(filtered[0].text).toBe('Done')
  })
})

describe('selectActiveCount', () => {
  it('counts only active todos', () => {
    useTodoStore.getState().addTodo('A')
    useTodoStore.getState().addTodo('B')
    useTodoStore.getState().addTodo('C')
    const id = useTodoStore.getState().todos[0].id
    useTodoStore.getState().toggleTodo(id)
    expect(selectActiveCount(useTodoStore.getState())).toBe(2)
  })
})

describe('selectHasCompleted', () => {
  it('returns false when no todos are completed', () => {
    useTodoStore.getState().addTodo('Active')
    expect(selectHasCompleted(useTodoStore.getState())).toBe(false)
  })

  it('returns true when at least one todo is completed', () => {
    useTodoStore.getState().addTodo('Task')
    const id = useTodoStore.getState().todos[0].id
    useTodoStore.getState().toggleTodo(id)
    expect(selectHasCompleted(useTodoStore.getState())).toBe(true)
  })
})
