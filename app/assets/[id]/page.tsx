import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Trash2, Network } from "lucide-react"
import { prisma } from "@/lib/prisma"

async function getAsset(id: string) {
  return prisma.asset.findUnique({
    where: { id },
    include: {
      assetType: true,
      createdBy: true,
      relationships: {
        include: {
          targetAsset: {
            include: {
              assetType: true,
            },
          },
        },
      },
      relationshipsTo: {
        include: {
          sourceAsset: {
            include: {
              assetType: true,
            },
          },
        },
      },
    },
  })
}

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const asset = await getAsset(id)

  if (!asset) {
    notFound()
  }

  const assetData = JSON.parse(asset.data || "{}")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      case "retired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/assets"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{asset.name}</h1>
            <p className="mt-1 text-gray-600">{asset.assetType.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/assets/${asset.id}/edit`}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Link>
          <Link
            href={`/graph?asset=${asset.id}`}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Network className="h-4 w-4" />
            <span>View Graph</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      asset.status
                    )}`}
                  >
                    {asset.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created By</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {asset.createdBy.name || asset.createdBy.email}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(asset.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(asset.updatedAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>

          {Object.keys(assetData).length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom Fields</h2>
              <dl className="grid grid-cols-1 gap-4">
                {Object.entries(assetData).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm font-medium text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {asset.relationships.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Relationships</h2>
              <div className="space-y-3">
                {asset.relationships.map((rel) => (
                  <div
                    key={rel.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {rel.relationType.replace(/_/g, " ")}
                      </p>
                      <Link
                        href={`/assets/${rel.targetAsset.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {rel.targetAsset.name} ({rel.targetAsset.assetType.name})
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href={`/tickets/new?asset=${asset.id}`}
                className="block w-full text-left px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Create Ticket
              </Link>
              <Link
                href={`/assets/${asset.id}/relationships`}
                className="block w-full text-left px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Manage Relationships
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Outgoing Relations</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {asset.relationships.length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-500">Incoming Relations</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {asset.relationshipsTo.length}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
