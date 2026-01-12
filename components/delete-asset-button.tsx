"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

interface DeleteAssetButtonProps {
  assetId: string
  assetName: string
}

export function DeleteAssetButton({ assetId, assetName }: DeleteAssetButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${assetName}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete asset")
      }

      router.push("/assets")
      router.refresh()
    } catch (error) {
      console.error("Error deleting asset:", error)
      alert("Failed to delete asset. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex items-center space-x-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 disabled:opacity-50 transition-colors"
    >
      <Trash2 className="h-4 w-4" />
      <span>{isDeleting ? "Deleting..." : "Delete"}</span>
    </button>
  )
}