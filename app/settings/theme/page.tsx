"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ThemeSettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        <Link
          href="/settings"
          className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appearance</h1>
          <p className="text-gray-600 dark:text-gray-400">Customize how the app looks on your device</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Interface Theme</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setTheme("light")}
            className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
              theme === "light"
                ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <div className="p-3 rounded-full bg-white shadow-sm border border-gray-100 mb-3 text-orange-500">
              <Sun className="h-6 w-6" />
            </div>
            <span className={`font-medium ${theme === "light" ? "text-blue-600" : "text-gray-900 dark:text-gray-100"}`}>
              Light
            </span>
          </button>

          <button
            onClick={() => setTheme("dark")}
            className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
              theme === "dark"
                ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <div className="p-3 rounded-full bg-gray-900 shadow-sm border border-gray-800 mb-3 text-blue-400">
              <Moon className="h-6 w-6" />
            </div>
            <span className={`font-medium ${theme === "dark" ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-gray-100"}`}>
              Dark
            </span>
          </button>

          <button
            onClick={() => setTheme("system")}
            className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
              theme === "system"
                ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 mb-3 text-gray-600 dark:text-gray-400">
              <Monitor className="h-6 w-6" />
            </div>
            <span className={`font-medium ${theme === "system" ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-gray-100"}`}>
              System
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}