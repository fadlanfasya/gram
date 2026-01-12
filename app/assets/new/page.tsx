import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AssetForm } from "@/components/asset-form"

async function getAssetTypes() {
  return prisma.assetType.findMany({
    orderBy: {
      name: "asc",
    },
  })
}

export default async function NewAssetPage() {
  const assetTypes = await getAssetTypes()

  if (assetTypes.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Asset</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            No asset types available. Please create an asset type first before creating assets.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Asset</h1>
        <p className="mt-2 text-gray-600">Add a new configuration item to your inventory</p>
      </div>

      <AssetForm assetTypes={assetTypes} />
    </div>
  )
}
