"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="flex items-center space-x-1 border border-zinc-200 dark:border-zinc-800 rounded-md p-1">
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('light')}
        className="h-7 w-7 p-0"
      >
        <Sun className="h-3 w-3" />
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('dark')}
        className="h-7 w-7 p-0"
      >
        <Moon className="h-3 w-3" />
      </Button>
    </div>
  )
}