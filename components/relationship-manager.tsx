"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Asset, AssetRelation, AssetType } from "@prisma/client"
import { Plus, Trash2, ArrowRight } from "lucide-react"

type AssetWithDetails = Asset & {
  assetType: AssetType
}

type RelationWithDetails = AssetRelation & {
  targetAsset: AssetWithDetails
}

interface RelationshipManagerProps {
  assetId: string
  initialRelationships: RelationWithDetails[]
  availableAssets: AssetWithDetails[]
}

const RELATION_TYPES = [
  "depends_on",
  "connected_to",
  "runs_on",
  "hosted_on",
  "contains",
  "member_of",
  "backup_of",
]

export function RelationshipManager({ 
  assetId, 
  initialRelationships, 
  availableAssets 
}: RelationshipManagerProps) {
  const router = useRouter()
  const [relationships, setRelationships] = useState(initialRelationships)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [targetId, setTargetId] = useState("")
  const [relationType, setRelationType] = useState(RELATION_TYPES[0])
  const [description, setDescription] = useState("")

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetId) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/assets/${assetId}/relationships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId,
          relationType,
          description,
        }),
      })

      if (!response.ok) throw new Error("Failed to add relationship")

      const newRel = await response.json()
      setRelationships([...relationships, newRel])
      
      // Reset form
      setTargetId("")
      setDescription("")
      router.refresh()
    } catch (error) {
      console.error("Error adding relationship:", error)
      alert("Failed to add relationship")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (relId: string) => {
    if (!confirm("Are you sure you want to remove this relationship?")) return

    try {
      const response = await fetch(`/api/relationships/${relId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete relationship")

      setRelationships(relationships.filter(r => r.id !== relId))
      router.refresh()
    } catch (error) {
      console.error("Error deleting relationship:", error)
      alert("Failed to delete relationship")
    }
  }

  return (
    <div className="space-y-8">
      {/* Add New Relationship Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Relationship</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship Type
            </label>
            <select
              value={relationType}
              onChange={(e) => setRelationType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {RELATION_TYPES.map(type => (
                <option key={type} value={type}>{type.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Asset
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an asset...</option>
              {availableAssets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.assetType.name})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Primary database connection"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !targetId}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              <span>{isSubmitting ? "Adding..." : "Add Relationship"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Relationships List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Current Relationships</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Asset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {relationships.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No relationships found. Add one above.
                  </td>
                </tr>
              ) : (
                relationships.map((rel) => (
                  <tr key={rel.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rel.relationType.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      <ArrowRight className="h-4 w-4" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      {rel.targetAsset.name} 
                      <span className="text-gray-500 ml-1">
                        ({rel.targetAsset.assetType.name})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rel.description || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(rel.id)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}