// composables/useTheme.js
import { ref } from 'vue'

// Global state - shared across all components
const isDarkMode = ref(true)  // Default to dark mode
const isInitialized = ref(false)

export function useTheme() {
  // Toggle theme function
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value

    // Update HTML element class
    if (typeof document !== 'undefined') {
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    // Save preference to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
    }
  }

  // Initialize theme from localStorage or system preference
  const initTheme = () => {
    if (isInitialized.value) return // Only initialize once
    if (typeof window === 'undefined') return

    const savedTheme = localStorage.getItem('theme')

    if (savedTheme === 'dark') {
      isDarkMode.value = true
      document.documentElement.classList.add('dark')
    } else if (savedTheme === 'light') {
      isDarkMode.value = false
      document.documentElement.classList.remove('dark')
    } else {
      // Default to dark mode if no saved preference
      isDarkMode.value = true
      document.documentElement.classList.add('dark')
    }

    isInitialized.value = true
  }

  return {
    isDarkMode,
    isDark: isDarkMode, // Alias for compatibility
    toggleTheme,
    initTheme
  }
}
