import {
  useTodoStore,
  selectActiveCount,
  selectHasCompleted,
} from '../store/useTodoStore'

export default function TodoFooter() {
  const activeCount = useTodoStore(selectActiveCount)
  const hasCompleted = useTodoStore(selectHasCompleted)
  const clearCompleted = useTodoStore((s) => s.clearCompleted)

  return (
    <footer className="flex justify-between items-center px-6 py-4 text-sm text-gray-500">
      <div aria-live="polite" aria-atomic="true">
        {activeCount} {activeCount === 1 ? 'item' : 'items'} left
      </div>
      {hasCompleted && (
        <button
          type="button"
          onClick={clearCompleted}
          className="hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded transition-colors"
        >
          Clear completed
        </button>
      )}
    </footer>
  )
}
