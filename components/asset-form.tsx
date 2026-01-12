"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AssetType } from "@prisma/client"

const assetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  assetTypeId: z.string().min(1, "Asset type is required"),
  status: z.enum(["active", "inactive", "maintenance", "retired"]),
  data: z.string().optional(),
})

type AssetFormData = z.infer<typeof assetSchema>

interface AssetFormProps {
  assetTypes: AssetType[]
  initialData?: {
    name: string
    assetTypeId: string
    status: string
    data?: string
  }
  assetId?: string
}

export function AssetForm({ assetTypes, initialData, assetId }: AssetFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          assetTypeId: initialData.assetTypeId,
          status: initialData.status as "active" | "inactive" | "maintenance" | "retired",
          data: initialData.data || "{}",
        }
      : {
          name: "",
          assetTypeId: "",
          status: "active" as const,
          data: "{}",
        },
  })

  const onSubmit = async (data: AssetFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const url = assetId ? `/api/assets/${assetId}` : "/api/assets"
      const method = assetId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save asset")
      }

      const result = await response.json()
      router.push(`/assets/${result.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            {...register("name")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter asset name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="assetTypeId" className="block text-sm font-medium text-gray-700 mb-2">
            Asset Type *
          </label>
          <select
            id="assetTypeId"
            {...register("assetTypeId")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select an asset type</option>
            {assetTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          {errors.assetTypeId && (
            <p className="mt-1 text-sm text-red-600">{errors.assetTypeId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status *
          </label>
          <select
            id="status"
            {...register("status")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Retired</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-2">
            Custom Data (JSON)
          </label>
          <textarea
            id="data"
            {...register("data")}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder='{"key": "value"}'
          />
          {errors.data && (
            <p className="mt-1 text-sm text-red-600">{errors.data.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : assetId ? "Update Asset" : "Create Asset"}
        </button>
      </div>
    </form>
  )
}
