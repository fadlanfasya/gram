"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Trash2 } from "lucide-react"
import { AssetTypeField } from "@/types"

const assetTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  fields: z.array(
    z.object({
      name: z.string().min(1, "Field name is required"),
      type: z.enum(["text", "number", "date", "select", "textarea", "email", "url"]),
      label: z.string().min(1, "Label is required"),
      required: z.boolean().optional(),
      options: z.array(z.string()).optional(),
      placeholder: z.string().optional(),
    })
  ),
})

type AssetTypeFormData = z.infer<typeof assetTypeSchema>

interface AssetTypeFormProps {
  initialData?: {
    id: string
    name: string
    description?: string | null
    icon?: string | null
    fields: string
  }
}

export function AssetTypeForm({ initialData }: AssetTypeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parsedFields = initialData
    ? (JSON.parse(initialData.fields || "[]") as AssetTypeField[])
    : []

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AssetTypeFormData>({
    resolver: zodResolver(assetTypeSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      icon: initialData?.icon || "",
      fields: parsedFields.length > 0 ? parsedFields : [{ name: "", type: "text", label: "", required: false }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  })

  const onSubmit = async (data: AssetTypeFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const url = initialData ? `/api/asset-types/${initialData.id}` : "/api/asset-types"
      const method = initialData ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          fields: JSON.stringify(data.fields),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save asset type")
      }

      router.push("/settings/asset-types")
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
            placeholder="e.g., Server, Router, Application"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            {...register("description")}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe this asset type"
          />
        </div>

        <div>
          <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
            Icon (optional)
          </label>
          <input
            type="text"
            id="icon"
            {...register("icon")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Icon name or emoji"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Custom Fields</h2>
          <button
            type="button"
            onClick={() => append({ name: "", type: "text", label: "", required: false })}
            className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            <span>Add Field</span>
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border border-gray-200 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field Name *
                  </label>
                  <input
                    {...register(`fields.${index}.name`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., ipAddress"
                  />
                  {errors.fields?.[index]?.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.fields[index]?.name?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    {...register(`fields.${index}.type`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Select</option>
                    <option value="textarea">Textarea</option>
                    <option value="email">Email</option>
                    <option value="url">URL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Label *
                </label>
                <input
                  {...register(`fields.${index}.label`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., IP Address"
                />
                {errors.fields?.[index]?.label && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.fields[index]?.label?.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register(`fields.${index}.required`)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Required</span>
                </label>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="ml-auto flex items-center space-x-1 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm">Remove</span>
                </button>
              </div>
            </div>
          ))}
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
          {isSubmitting ? "Saving..." : initialData ? "Update Asset Type" : "Create Asset Type"}
        </button>
      </div>
    </form>
  )
}
