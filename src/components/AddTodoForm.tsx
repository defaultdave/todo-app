import { useState } from 'react'
import { useTodoStore } from '../store/useTodoStore'

export default function AddTodoForm() {
  const [text, setText] = useState('')
  const addTodo = useTodoStore((s) => s.addTodo)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    addTodo(trimmed)
    setText('')
  }

  const isEmpty = text.trim().length === 0

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 px-6 py-4 border-b border-gray-200"
    >
      <label htmlFor="new-todo" className="sr-only">
        What needs to be done?
      </label>
      <input
        id="new-todo"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs to be done?"
        autoFocus
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      />
      <button
        type="submit"
        disabled={isEmpty}
        className="bg-indigo-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-indigo-700 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 transition-colors"
      >
        Add
      </button>
    </form>
  )
}
