import { useShallow } from 'zustand/react/shallow'
import { useTodoStore, selectFilteredTodos } from '../store/useTodoStore'
import TodoItem from './TodoItem'
import EmptyState from './EmptyState'

const EMPTY_MESSAGES = {
  all: 'No todos yet. Add one above.',
  active: 'Nothing left to do. Great work.',
  completed: 'No completed todos yet.',
} as const

export default function TodoList() {
  const filteredTodos = useTodoStore(useShallow(selectFilteredTodos))
  const filter = useTodoStore((s) => s.filter)

  return (
    <ul className="divide-y divide-gray-100">
      {filteredTodos.length === 0 ? (
        <EmptyState message={EMPTY_MESSAGES[filter]} />
      ) : (
        filteredTodos.map((todo) => <TodoItem key={todo.id} todo={todo} />)
      )}
    </ul>
  )
}
