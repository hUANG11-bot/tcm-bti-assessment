import React, { createContext, useContext, useState } from "react"
import Taro from '@tarojs/taro'

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme?: () => void
  switchable: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  switchable?: boolean
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (switchable) {
      try {
        const stored = Taro.getStorageSync("theme")
        return (stored as Theme) || defaultTheme
      } catch {
        return defaultTheme
      }
    }
    return defaultTheme
  })

  const toggleTheme = switchable
    ? () => {
        const newTheme = theme === "light" ? "dark" : "light"
        setTheme(newTheme)
        try {
          Taro.setStorageSync("theme", newTheme)
        } catch (e) {
          console.error('Failed to save theme:', e)
        }
      }
    : undefined

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
