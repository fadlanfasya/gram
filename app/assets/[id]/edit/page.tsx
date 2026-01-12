import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AssetForm } from "@/components/asset-form"

interface PageProps {
  params: Promise<{ id: string }>
}

async function getAsset(id: string) {
  return prisma.asset.findUnique({
    where: { id },
    include: {
      assetType: true,
    },
  })
}

async function getAssetTypes() {
  return prisma.assetType.findMany({
    orderBy: {
      name: "asc",
    },
  })
}

export default async function EditAssetPage({ params }: PageProps) {
  const { id } = await params
  const [asset, assetTypes] = await Promise.all([
    getAsset(id),
    getAssetTypes(),
  ])

  if (!asset) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Asset</h1>
        <p className="mt-2 text-gray-600">Update configuration for {asset.name}</p>
      </div>

      <AssetForm 
        assetTypes={assetTypes} 
        initialData={{
          name: asset.name,
          assetTypeId: asset.assetTypeId,
          status: asset.status,
          data: asset.data
        }}
        assetId={asset.id}
      />
    </div>
  )
}