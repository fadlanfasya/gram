import { AssetTypeForm } from "@/components/asset-type-form"

export default function NewAssetTypePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Asset Type</h1>
        <p className="mt-2 text-gray-600">Define a new asset type with custom fields</p>
      </div>

      <AssetTypeForm />
    </div>
  )
}
