import '@testing-library/jest-dom/vitest'

// Provide a localStorage implementation for the jsdom test environment.
// Zustand's persist middleware calls localStorage.setItem on every setState,
// but jsdom only exposes localStorage when a valid origin (url) is configured.
// This in-memory stub satisfies the interface without requiring any environment
// configuration changes.
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})
