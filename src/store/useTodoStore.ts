import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { z } from 'zod'
import {
  type Todo,
  type FilterValue,
  TodoSchema,
  FilterValueSchema,
} from '../types'

interface TodoState {
  todos: Todo[]
  filter: FilterValue
}

interface TodoActions {
  addTodo: (text: string) => void
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  clearCompleted: () => void
  setFilter: (filter: FilterValue) => void
}

type TodoStore = TodoState & TodoActions

export const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [],
      filter: 'all',
      addTodo: (text) => {
        const trimmed = text.trim()
        if (!trimmed) return
        set((s) => ({
          todos: [
            {
              id: crypto.randomUUID(),
              text: trimmed,
              completed: false,
              createdAt: new Date().toISOString(),
            },
            ...s.todos,
          ],
        }))
      },
      toggleTodo: (id) =>
        set((s) => ({
          todos: s.todos.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t,
          ),
        })),
      deleteTodo: (id) =>
        set((s) => ({ todos: s.todos.filter((t) => t.id !== id) })),
      clearCompleted: () =>
        set((s) => ({ todos: s.todos.filter((t) => !t.completed) })),
      setFilter: (filter) => set({ filter }),
    }),
    {
      name: 'todo-store',
      merge: (persisted, current) => {
        const parsed = z
          .object({ todos: z.array(TodoSchema), filter: FilterValueSchema })
          .safeParse(persisted)
        return parsed.success ? { ...current, ...parsed.data } : current
      },
    },
  ),
)

export const selectFilteredTodos = (s: TodoStore): Todo[] => {
  if (s.filter === 'active') return s.todos.filter((t) => !t.completed)
  if (s.filter === 'completed') return s.todos.filter((t) => t.completed)
  return s.todos
}

export const selectActiveCount = (s: TodoStore): number =>
  s.todos.filter((t) => !t.completed).length

export const selectHasCompleted = (s: TodoStore): boolean =>
  s.todos.some((t) => t.completed)
