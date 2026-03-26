import AppHeader from '../components/AppHeader'
import AddTodoForm from '../components/AddTodoForm'
import FilterTabs from '../components/FilterTabs'
import TodoList from '../components/TodoList'
import TodoFooter from '../components/TodoFooter'

export default function TodoPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <AppHeader />
          <main>
            <AddTodoForm />
            <FilterTabs />
            <TodoList />
          </main>
          <TodoFooter />
        </div>
      </div>
    </div>
  )
}
