import { ref, watch } from 'vue'

const STORAGE_KEY = 'color-palette-history'
const MAX_HISTORY = 10

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore
  }
  return []
}

function saveHistory(history: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch {
    // ignore
  }
}

export function useColorHistory(currentHex: { value: string }) {
  const history = ref<string[]>(loadHistory())

  function addToHistory(hex: string) {
    if (!/^#[0-9A-F]{6}$/.test(hex)) return
    const newHistory = [hex, ...history.value.filter((h) => h !== hex)].slice(0, MAX_HISTORY)
    history.value = newHistory
    saveHistory(newHistory)
  }

  function removeFromHistory(hex: string) {
    const newHistory = history.value.filter((h) => h !== hex)
    history.value = newHistory
    saveHistory(newHistory)
  }

  // Watch currentHex and add valid colors to history
  watch(
    () => currentHex.value,
    (hex) => {
      if (/^#[0-9A-F]{6}$/.test(hex)) {
        addToHistory(hex)
      }
    },
    { immediate: false },
  )

  return {
    history,
    addToHistory,
    removeFromHistory,
  }
}
