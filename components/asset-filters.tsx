"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search, Filter, X } from "lucide-react"
import { AssetType } from "@prisma/client"
import { useState, useTransition } from "react"
import { useDebouncedCallback } from "use-debounce"

interface AssetFiltersProps {
  assetTypes: AssetType[]
}

export function AssetFilters({ assetTypes }: AssetFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showFilters, setShowFilters] = useState(false)

  const currentSearch = searchParams.get("search") || ""
  const currentType = searchParams.get("assetTypeId") || ""
  const currentStatus = searchParams.get("status") || ""

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set("search", term)
    } else {
      params.delete("search")
    }
    startTransition(() => {
      router.replace(`/assets?${params.toString()}`)
    })
  }, 300)

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    startTransition(() => {
      router.replace(`/assets?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    router.replace("/assets")
    setShowFilters(false)
  }

  const hasActiveFilters = currentType || currentStatus

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assets..."
            defaultValue={currentSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground"
          />
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
            hasActiveFilters || showFilters
              ? "border-primary text-primary bg-primary/10"
              : "border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <div className="bg-muted/50 p-4 rounded-lg border border-border grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Asset Type
            </label>
            <select
              value={currentType}
              onChange={(e) => handleFilterChange("assetTypeId", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="">All Types</option>
              {assetTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Status
            </label>
            <select
              value={currentStatus}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters && !currentSearch}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}