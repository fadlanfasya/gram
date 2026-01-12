import Link from "next/link"
import { Plus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { AssetFilters } from "@/components/asset-filters"
import { Prisma } from "@prisma/client"

// 1. Update getAssets to accept filters
async function getAssets(
  search?: string,
  assetTypeId?: string,
  status?: string
) {
  const where: Prisma.AssetWhereInput = {
    // Search by name (case-insensitive contains)
    ...(search && {
      name: {
        contains: search,
        // mode: 'insensitive', // Uncomment if your DB supports it (Postgres/Mongo). SQLite defaults to case-insensitive for ASCII.
      },
    }),
    // Filter by Type
    ...(assetTypeId && { assetTypeId }),
    // Filter by Status
    ...(status && { status }),
  }

  return prisma.asset.findMany({
    where,
    include: {
      assetType: true,
      createdBy: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

async function getAssetTypes() {
  return prisma.assetType.findMany({
    orderBy: { name: "asc" },
  })
}

// 2. Update Page Props to receive searchParams
export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const search = params.search
  const assetTypeId = params.assetTypeId
  const status = params.status

  // 3. Fetch data in parallel
  const [assets, assetTypes] = await Promise.all([
    getAssets(search, assetTypeId, status),
    getAssetTypes(),
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "inactive": return "bg-gray-100 text-gray-800"
      case "maintenance": return "bg-yellow-100 text-yellow-800"
      case "retired": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
          <p className="mt-2 text-gray-600">Manage your configuration items and assets</p>
        </div>
        <Link
          href="/assets/new"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Asset</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* 4. Insert the Filter Component here */}
        <div className="p-4 border-b border-gray-200">
          <AssetFilters assetTypes={assetTypes} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg font-medium">No assets found</p>
                    <p className="mt-2 text-sm">
                      {search || assetTypeId || status 
                        ? "Try adjusting your filters" 
                        : "Get started by creating your first asset"}
                    </p>
                    {!(search || assetTypeId || status) && (
                      <Link
                        href="/assets/new"
                        className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Create Asset
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/assets/${asset.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {asset.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {asset.assetType.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          asset.status
                        )}`}
                      >
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {asset.createdBy.name || asset.createdBy.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/assets/${asset.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </Link>
                      <Link
                        href={`/assets/${asset.id}/edit`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Edit
                      </Link>
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