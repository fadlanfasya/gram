import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { RelationshipManager } from "@/components/relationship-manager"

interface PageProps {
  params: Promise<{ id: string }>
}

async function getAsset(id: string) {
  return prisma.asset.findUnique({
    where: { id },
    include: {
      assetType: true,
      relationships: {
        include: {
          targetAsset: {
            include: {
              assetType: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
    },
  })
}

async function getAvailableAssets(currentAssetId: string) {
  return prisma.asset.findMany({
    where: {
      id: {
        not: currentAssetId,
      },
    },
    include: {
      assetType: true,
    },
    orderBy: {
      name: "asc",
    },
  })
}

export default async function ManageRelationshipsPage({ params }: PageProps) {
  const { id } = await params
  const [asset, availableAssets] = await Promise.all([
    getAsset(id),
    getAvailableAssets(id),
  ])

  if (!asset) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href={`/assets/${asset.id}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Relationships</h1>
          <p className="mt-1 text-gray-600">
            Configure dependencies for <span className="font-semibold">{asset.name}</span>
          </p>
        </div>
      </div>

      <RelationshipManager 
        assetId={asset.id}
        initialRelationships={asset.relationships}
        availableAssets={availableAssets}
      />
    </div>
  )
}