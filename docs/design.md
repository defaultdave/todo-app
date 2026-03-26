# Todo App — Design Document

## Stack

- Vite + React 19 + TypeScript strict
- Tailwind CSS 4 (via `@tailwindcss/vite`)
- Zustand 5 with persist middleware
- Vitest + Testing Library for unit tests; Playwright + `@axe-core/playwright` for e2e
- Zod 4 for runtime validation of persisted data

---

## 1. Data Model

```ts
interface Todo {
  id: string // crypto.randomUUID()
  text: string // trimmed, non-empty
  completed: boolean
  createdAt: string // ISO-8601 timestamp
}

type FilterValue = 'all' | 'active' | 'completed'
```

Zod schema mirrors the interface and is used to parse data read back from localStorage, guarding against stale or malformed persisted state.

```ts
const TodoSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  completed: z.boolean(),
  createdAt: z.string(),
})
```

---

## 2. Component Tree

```
App
└── TodoPage                          (page shell, max-w-2xl centered)
    ├── AppHeader                     (h1 "Todos")
    ├── AddTodoForm                   (controlled input + submit button)
    ├── FilterTabs                    (All / Active / Completed)
    ├── TodoList                      (renders filtered list or EmptyState)
    │   ├── TodoItem (×N)             (checkbox, label, delete button)
    │   └── EmptyState                (conditional, shown when list is empty)
    └── TodoFooter                    (item count, "Clear completed" button)
```

All components are co-located under `src/components/`. The store lives at `src/store/useTodoStore.ts`. Types live at `src/types.ts`.

---

## 3. UI Layout

Single-page app, no routing needed.

```
┌─────────────────────────────────────┐
│            Todos             (h1)   │
├─────────────────────────────────────┤
│  [ What needs to be done?  ] [Add]  │  ← AddTodoForm
├─────────────────────────────────────┤
│  [All]  [Active]  [Completed]       │  ← FilterTabs
├─────────────────────────────────────┤
│  ☐  Buy groceries             [✕]   │
│  ☑  Write tests               [✕]   │  ← TodoList
│  ☐  Read a book               [✕]   │
├─────────────────────────────────────┤
│  2 items left      [Clear completed]│  ← TodoFooter
└─────────────────────────────────────┘
```

**Responsive:** Full-width on mobile, `max-w-2xl` centered on desktop. Comfortable padding (`px-4 py-6` on mobile, `px-0` on desktop).

---

## 4. User Interactions

### Add todo

1. User types text into the input.
2. Submit via Enter key or "Add" button.
3. Input is trimmed; empty strings are rejected (no error message needed — button is disabled when input is empty).
4. New todo is prepended to the list (newest first).
5. Input clears after successful add.

### Toggle complete

1. User clicks the checkbox next to a todo.
2. `completed` toggles. Completed todos render with a line-through label.
3. Active filter count in the footer updates immediately.

### Delete todo

1. User clicks the "×" button on a todo row.
2. Todo is removed immediately — no confirmation dialog (it's a simple app).

### Clear completed

1. User clicks "Clear completed" in the footer.
2. All todos where `completed === true` are removed in one action.
3. Button is hidden when there are no completed todos.

### Filter

1. Clicking a filter tab updates `activeFilter` in the store.
2. The displayed list re-derives from the full `todos` array — no separate array stored.
3. Active tab is visually distinguished (underline + text color).

---

## 5. State Management

```ts
// src/store/useTodoStore.ts

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
```

### Zustand persist setup

```ts
export const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [],
      filter: 'all',
      addTodo: (text) =>
        set((s) => ({
          todos: [
            {
              id: crypto.randomUUID(),
              text: text.trim(),
              completed: false,
              createdAt: new Date().toISOString(),
            },
            ...s.todos,
          ],
        })),
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
      // Validate on rehydration to protect against stale localStorage schema
      merge: (persisted, current) => {
        const parsed = z
          .object({ todos: z.array(TodoSchema), filter: FilterValueSchema })
          .safeParse(persisted)
        return parsed.success ? { ...current, ...parsed.data } : current
      },
    },
  ),
)
```

### Derived selectors (co-locate with store)

```ts
export const selectFilteredTodos = (s: TodoStore): Todo[] => {
  if (s.filter === 'active') return s.todos.filter((t) => !t.completed)
  if (s.filter === 'completed') return s.todos.filter((t) => t.completed)
  return s.todos
}

export const selectActiveCount = (s: TodoStore): number =>
  s.todos.filter((t) => !t.completed).length

export const selectHasCompleted = (s: TodoStore): boolean =>
  s.todos.some((t) => t.completed)
```

Components subscribe to individual selectors to minimise re-renders.

---

## 6. Accessibility

### Semantic structure

- `<header>` wraps `AppHeader`
- `<main>` wraps the form, filters, and list
- `<footer>` wraps `TodoFooter`
- `<ul>` / `<li>` for `TodoList` / `TodoItem`
- Native `<button>` and `<input type="checkbox">` elements — no ARIA role overrides needed

### Keyboard navigation

- `autoFocus` on the text input on page load
- Tab order: input → Add button → filter tabs → todo checkboxes and delete buttons (left to right within each row) → footer controls
- Enter submits the add form
- Delete buttons are focusable and activated with Enter/Space

### Labels and identifiers

- `<input>` has `id="new-todo"` and an associated `<label>` (visually hidden with `sr-only`)
- Each checkbox is `<input type="checkbox" id={todo.id}>` with `<label htmlFor={todo.id}>`
- Delete buttons: `aria-label={`Delete "${todo.text}"`}`
- Filter tabs: rendered as `<button role="tab">` inside a `<div role="tablist" aria-label="Filter todos">`
- Active filter tab: `aria-selected="true"`, inactive tabs: `aria-selected="false"`

### Live region

- A visually hidden `<div aria-live="polite" aria-atomic="true">` announces filter/count changes to screen readers (e.g. "3 items left")

### Color contrast

- Body text on white: use `text-gray-900` — passes 4.5:1
- Completed (struck-through) text: `text-gray-400` — acceptable for decorative secondary text; primary state is conveyed by the checkbox, not colour alone
- Focus rings: Tailwind's default `focus-visible:ring-2 focus-visible:ring-indigo-500` on all interactive elements

### Touch targets

- All interactive elements 44×44px minimum (use `min-h-[44px] min-w-[44px]` where needed on icon buttons)

### Motion

- No animations are planned; if added later, wrap in `@media (prefers-reduced-motion: no-preference)`

---

## 7. Visual Design

Tailwind CSS 4, clean and minimal. No custom design tokens needed.

### Palette

- Background: `bg-gray-50` (page), `bg-white` (card)
- Primary accent: `indigo-600` (Add button, active filter underline, focus rings)
- Text: `gray-900` (primary), `gray-500` (secondary/meta), `gray-400` (completed todo text)
- Borders: `gray-200`
- Destructive: `red-500` (delete button hover)

### Card layout

The entire `TodoPage` content sits inside a single white card with a subtle shadow:

```
bg-white rounded-xl shadow-sm border border-gray-200
```

### AddTodoForm

- Full-width text input, right-aligned "Add" button inside the form row
- Input: `border border-gray-300 rounded-lg px-3 py-2 focus-visible:ring-2 focus-visible:ring-indigo-500`
- Button: `bg-indigo-600 text-white rounded-lg px-4 py-2 disabled:opacity-40`
- Button disabled when input is empty (trimmed)

### FilterTabs

- Three buttons in a row with a bottom border on the active tab
- Active: `text-indigo-600 border-b-2 border-indigo-600 font-medium`
- Inactive: `text-gray-500 hover:text-gray-700`

### TodoItem

- Flex row: `[checkbox] [label] [spacer] [delete button]`
- Completed label: `line-through text-gray-400`
- Delete button: icon-only "×", visible on row hover and on focus; `text-gray-400 hover:text-red-500`
- Row separator: `divide-y divide-gray-100` on the `<ul>`

### TodoFooter

- `flex justify-between items-center text-sm text-gray-500`
- "Clear completed" only visible when `hasCompleted === true`

### Empty state

Shown when the filtered list has zero items:

- "All / Active / Completed" variants have distinct messages
  - All: "No todos yet. Add one above."
  - Active: "Nothing left to do. Great work."
  - Completed: "No completed todos yet."
- Centred, `text-gray-400 py-8`

---

## 8. Filtering

Filter state lives in the store (persisted). The active filter is applied client-side via `selectFilteredTodos`. The full `todos` array is always the source of truth — filters never mutate it.

Footer count ("N items left") always reflects **active** (not completed) todos across the full list, regardless of the active filter. This is consistent with TodoMVC convention.

---

## 9. Empty States

| Scenario                                         | Message                                    |
| ------------------------------------------------ | ------------------------------------------ |
| No todos at all (filter = All)                   | "No todos yet. Add one above."             |
| No active todos (filter = Active)                | "Nothing left to do. Great work."          |
| No completed todos (filter = Completed)          | "No completed todos yet."                  |
| Filter = All or Active, after clearing completed | Falls through to appropriate message above |

Empty state is `EmptyState` component accepting a `message: string` prop. `TodoList` decides which message to pass based on current filter.

---

## 10. File Structure

```
src/
  types.ts                   # Todo, FilterValue interfaces + Zod schemas
  store/
    useTodoStore.ts           # Zustand store + selectors
  components/
    AddTodoForm.tsx
    FilterTabs.tsx
    TodoList.tsx
    TodoItem.tsx
    TodoFooter.tsx
    EmptyState.tsx
    AppHeader.tsx
  pages/
    TodoPage.tsx              # Composes all components
  App.tsx                     # Mounts TodoPage, sets up any global layout
  main.tsx                    # ReactDOM.createRoot entry point
  index.css                   # @import "tailwindcss"
```

---

## 11. Testing Strategy

### Unit (Vitest + Testing Library)

- `useTodoStore` — test all actions and selectors in isolation using `create` directly (reset store between tests)
- `AddTodoForm` — submit with valid text adds todo; submit with empty/whitespace does not; input clears after submit
- `TodoItem` — checkbox toggle calls `toggleTodo`; delete button calls `deleteTodo` with correct id
- `FilterTabs` — clicking each tab calls `setFilter` with correct value; active tab has `aria-selected="true"`
- `TodoFooter` — count reflects active todos; "Clear completed" absent when none completed

### a11y (axe-core)

- Every component that renders interactive elements should have an axe scan in its test:
  ```ts
  import { axe } from 'vitest-axe'; // add vitest-axe to devDependencies
  it('has no a11y violations', async () => {
    const { container } = render(<ComponentUnderTest />);
    expect(await axe(container)).toHaveNoViolations();
  });
  ```

### E2E (Playwright + @axe-core/playwright)

- Full add → toggle → filter → delete flow
- Persistence: add todos, reload page, assert todos still present
- Keyboard flow: tab to input, type, Enter to add, tab to checkbox, Space to toggle
- axe scan on loaded page for full accessibility audit
