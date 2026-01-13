import Link from "next/link"
import { Plus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { AssetFilters } from "@/components/asset-filters"
import { Prisma } from "@prisma/client"

async function getAssets(
  search?: string,
  assetTypeId?: string,
  status?: string
) {
  const where: Prisma.AssetWhereInput = {
    ...(search && {
      name: {
        contains: search,
        // mode: 'insensitive', // Uncomment if using Postgres
      },
    }),
    ...(assetTypeId && { assetTypeId }),
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

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const search = params.search
  const assetTypeId = params.assetTypeId
  const status = params.status

  const [assets, assetTypes] = await Promise.all([
    getAssets(search, assetTypeId, status),
    getAssetTypes(),
  ])

  // Updated Status Colors for Dark Mode compatibility
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": 
        return "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900"
      case "inactive": 
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800"
      case "maintenance": 
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900"
      case "retired": 
        return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900"
      default: 
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assets</h1>
          <p className="mt-2 text-muted-foreground">Manage your configuration items and assets</p>
        </div>
        <Link
          href="/assets/new"
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Asset</span>
        </Link>
      </div>

      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="p-4 border-b border-border">
          <AssetFilters assetTypes={assetTypes} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <p className="text-lg font-medium">No assets found</p>
                    <p className="mt-2 text-sm">
                      {search || assetTypeId || status 
                        ? "Try adjusting your filters" 
                        : "Get started by creating your first asset"}
                    </p>
                    {!(search || assetTypeId || status) && (
                      <Link
                        href="/assets/new"
                        className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                      >
                        Create Asset
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/assets/${asset.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {asset.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {asset.createdBy.name || asset.createdBy.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/assets/${asset.id}`}
                        className="text-primary hover:text-primary/80 mr-4"
                      >
                        View
                      </Link>
                      <Link
                        href={`/assets/${asset.id}/edit`}
                        className="text-muted-foreground hover:text-foreground"
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