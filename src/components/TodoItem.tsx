import { type Todo } from '../types'
import { useTodoStore } from '../store/useTodoStore'

interface TodoItemProps {
  todo: Todo
}

export default function TodoItem({ todo }: TodoItemProps) {
  const toggleTodo = useTodoStore((s) => s.toggleTodo)
  const deleteTodo = useTodoStore((s) => s.deleteTodo)

  return (
    <li className="flex items-center gap-3 px-6 py-3">
      <input
        type="checkbox"
        id={todo.id}
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer flex-shrink-0"
      />
      <label
        htmlFor={todo.id}
        className={`flex-1 text-base cursor-pointer select-none ${
          todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
        }`}
      >
        {todo.text}
      </label>
      <button
        type="button"
        onClick={() => deleteTodo(todo.id)}
        aria-label={`Delete "${todo.text}"`}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded transition-colors"
      >
        ×
      </button>
    </li>
  )
}
