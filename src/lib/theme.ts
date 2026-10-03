// A tiny external store so every component (header toggle, toaster) shares one theme.
// index.html applies the saved theme before first paint to avoid a flash.

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'
const listeners = new Set<() => void>()

function readInitial(): Theme {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'light' || value === 'dark') return value
  } catch {
    // Storage can be blocked (private mode, site data cleared); fall back to the OS.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

let current = readInitial()

function apply() {
  document.documentElement.classList.toggle('dark', current === 'dark')
}
apply()

export function getTheme() {
  return current
}

export function subscribeTheme(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setTheme(theme: Theme) {
  current = theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Not persisted, but still applied for this session.
  }
  apply()
  listeners.forEach((l) => l())
}
