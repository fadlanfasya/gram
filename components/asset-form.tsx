"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AssetType } from "@prisma/client"

// Define the field structure (matching what you saved in AssetTypeForm)
interface AssetTypeField {
  name: string
  type: "text" | "number" | "date" | "select" | "textarea" | "email" | "url"
  label: string
  required?: boolean
  options?: string[]
  placeholder?: string
}

const assetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  assetTypeId: z.string().min(1, "Asset type is required"),
  status: z.enum(["active", "inactive", "maintenance", "retired"]),
  // We keep 'data' in the schema for the API, but the form uses customFields
  data: z.string().optional(),
  customFields: z.record(z.string(), z.any()).optional(),
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
  
  // State to hold the currently selected asset type's definition
  const [selectedType, setSelectedType] = useState<AssetType | null>(null)
  const [dynamicFields, setDynamicFields] = useState<AssetTypeField[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          assetTypeId: initialData.assetTypeId,
          status: initialData.status as "active" | "inactive" | "maintenance" | "retired",
          data: initialData.data || "{}",
          // Pre-fill custom fields from the saved JSON data
          customFields: JSON.parse(initialData.data || "{}"),
        }
      : {
          name: "",
          assetTypeId: "",
          status: "active" as const,
          data: "{}",
          customFields: {},
        },
  })

  // Watch for changes to assetTypeId to update the dynamic fields
  const selectedTypeId = watch("assetTypeId")

  useEffect(() => {
    if (selectedTypeId) {
      const type = assetTypes.find((t) => t.id === selectedTypeId)
      setSelectedType(type || null)
      
      if (type && type.fields) {
        try {
          const parsedFields = JSON.parse(type.fields) as AssetTypeField[]
          setDynamicFields(parsedFields)
        } catch (e) {
          console.error("Failed to parse asset type fields", e)
          setDynamicFields([])
        }
      } else {
        setDynamicFields([])
      }
    } else {
      setSelectedType(null)
      setDynamicFields([])
    }
  }, [selectedTypeId, assetTypes])

  const onSubmit = async (formData: AssetFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Stringify the custom fields back into the 'data' field for storage
      const payload = {
        ...formData,
        data: JSON.stringify(formData.customFields || {}),
      }

      // Remove the temporary customFields object before sending
      // @ts-ignore
      delete payload.customFields

      const url = assetId ? `/api/assets/${assetId}` : "/api/assets"
      const method = assetId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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

  // Helper to render the correct input based on field type
  const renderFieldInput = (field: AssetTypeField) => {
    const fieldName = `customFields.${field.name}` as const // Type assertion for RHF
    const commonClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            {...register(fieldName, { required: field.required })}
            placeholder={field.placeholder}
            className={commonClasses}
            rows={3}
          />
        )
      case "select":
        return (
          <select
            {...register(fieldName, { required: field.required })}
            className={commonClasses}
          >
            <option value="">Select option</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )
      case "number":
        return (
          <input
            type="number"
            {...register(fieldName, { required: field.required })}
            placeholder={field.placeholder}
            className={commonClasses}
          />
        )
      case "date":
        return (
          <input
            type="date"
            {...register(fieldName, { required: field.required })}
            className={commonClasses}
          />
        )
      default: // text, email, url
        return (
          <input
            type={field.type}
            {...register(fieldName, { required: field.required })}
            placeholder={field.placeholder}
            className={commonClasses}
          />
        )
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="assetTypeId" className="block text-sm font-medium text-gray-700 mb-2">
              Asset Type *
            </label>
            <select
              id="assetTypeId"
              {...register("assetTypeId")}
              disabled={!!assetId} // Disable changing type when editing existing asset to prevent data mismatch
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
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
          </div>
        </div>
      </div>

      {/* Dynamic Fields Section */}
      {selectedType && dynamicFields.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedType.name} Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dynamicFields.map((field) => (
              <div key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {renderFieldInput(field)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback/Empty State if type selected but no fields */}
      {selectedType && dynamicFields.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
          This asset type has no custom fields defined.
        </div>
      )}

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