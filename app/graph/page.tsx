import { Suspense } from 'react'
import { prisma } from "@/lib/prisma"
import CIExplorer from "@/components/ci-explorer"
import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'

// Helper to fetch asset name for the header
async function getAssetName(id: string) {
  if (!id) return null
  const asset = await prisma.asset.findUnique({ 
    where: { id },
    select: { name: true, assetType: { select: { name: true } } }
  })
  return asset
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function GraphPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const assetId = typeof resolvedSearchParams.asset === 'string' ? resolvedSearchParams.asset : null
  
  const assetData = assetId ? await getAssetName(assetId) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href={assetId ? `/assets/${assetId}` : "/assets"}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              CI Explorer
            </h1>
            <p className="mt-1 text-gray-600">
              {assetData 
                ? `Visualizing dependencies for ${assetData.name}`
                : "Explore asset relationships graphically"
              }
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <Suspense fallback={<div className="h-[700px] flex items-center justify-center bg-gray-50">Loading explorer...</div>}>
          <CIExplorer initialAssetId={assetId} />
        </Suspense>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>Tip:</strong> Click on any node to expand its relationships and uncover deeper dependencies in your infrastructure.
      </div>
    </div>
  )
}