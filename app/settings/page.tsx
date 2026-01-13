import Link from "next/link"
import { Palette, Box, ChevronRight, Settings } from "lucide-react"

export default function SettingsPage() {
  const settingsGroups = [
    {
      title: "General",
      items: [
        {
          name: "Appearance",
          description: "Customize the look and feel (Light/Dark mode)",
          href: "/settings/theme",
          icon: Palette,
        },
      ],
    },
    {
      title: "Configuration",
      items: [
        {
          name: "Asset Types",
          description: "Manage custom asset definitions and fields",
          href: "/settings/asset-types",
          icon: Box,
        },
      ],
    },
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your workspace preferences</p>
      </div>

      <div className="grid gap-6">
        {settingsGroups.map((group) => (
          <div key={group.title} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                {group.title}
              </h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {group.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="flex-shrink-0 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}