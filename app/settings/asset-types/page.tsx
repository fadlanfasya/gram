import Link from "next/link"
import { Plus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { AssetTypeForm } from "@/components/asset-type-form"

async function getAssetTypes() {
  return prisma.assetType.findMany({
    include: {
      _count: {
        select: {
          assets: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  })
}

export default async function AssetTypesPage() {
  const assetTypes = await getAssetTypes()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asset Types</h1>
          <p className="mt-2 text-gray-600">Define custom asset types with flexible fields</p>
        </div>
        <Link
          href="/settings/asset-types/new"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Asset Type</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assetTypes.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-lg font-medium text-gray-900">No asset types found</p>
            <p className="mt-2 text-gray-600">Create your first asset type to get started</p>
            <Link
              href="/settings/asset-types/new"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Asset Type
            </Link>
          </div>
        ) : (
          assetTypes.map((type) => {
            const fields = JSON.parse(type.fields || "[]")
            return (
              <div
                key={type.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                    {type.description && (
                      <p className="mt-1 text-sm text-gray-600">{type.description}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Fields</span>
                    <span className="font-medium text-gray-900">{fields.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Assets</span>
                    <span className="font-medium text-gray-900">
                      {type._count.assets}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                  <Link
                    href={`/settings/asset-types/${type.id}`}
                    className="flex-1 text-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    View
                  </Link>
                  <Link
                    href={`/settings/asset-types/${type.id}/edit`}
                    className="flex-1 text-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
