import { type FilterValue } from '../types'
import { useTodoStore } from '../store/useTodoStore'

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

export default function FilterTabs() {
  const filter = useTodoStore((s) => s.filter)
  const setFilter = useTodoStore((s) => s.setFilter)

  return (
    <div
      role="tablist"
      aria-label="Filter todos"
      className="flex gap-1 px-6 py-3 border-b border-gray-200"
    >
      {FILTERS.map(({ value, label }) => {
        const isActive = filter === value
        return (
          <button
            key={value}
            role="tab"
            aria-selected={isActive}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isActive
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
