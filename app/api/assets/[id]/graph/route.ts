import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch the central asset
    const centerAsset = await prisma.asset.findUnique({
      where: { id },
      include: { assetType: true }
    })

    if (!centerAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    // Fetch all relationships where this asset is source OR target
    const relationships = await prisma.assetRelation.findMany({
      where: {
        OR: [
          { sourceId: id },
          { targetId: id }
        ]
      },
      include: {
        sourceAsset: { include: { assetType: true } },
        targetAsset: { include: { assetType: true } }
      }
    })

    // Format Nodes
    // We use a Map to ensure unique nodes if multiple relations point to same asset
    const nodesMap = new Map()

    // Add center node
    nodesMap.set(centerAsset.id, {
      id: centerAsset.id,
      data: { 
        label: centerAsset.name,
        type: centerAsset.assetType.name,
        isCenter: true 
      },
      position: { x: 0, y: 0 }, // Initial position, will be calculated by layout
      type: 'custom' // We'll use a custom node type
    })

    // Add neighbor nodes
    relationships.forEach(rel => {
      const neighbor = rel.sourceId === id ? rel.targetAsset : rel.sourceAsset
      if (!nodesMap.has(neighbor.id)) {
        nodesMap.set(neighbor.id, {
          id: neighbor.id,
          data: { 
            label: neighbor.name,
            type: neighbor.assetType.name,
            isCenter: false
          },
          position: { x: 0, y: 0 },
          type: 'custom'
        })
      }
    })

    // Format Edges
    const edges = relationships.map(rel => ({
      id: rel.id,
      source: rel.sourceId,
      target: rel.targetId,
      label: rel.relationType.replace(/_/g, ' '),
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#94a3b8' },
      labelStyle: { fill: '#64748b', fontWeight: 500, fontSize: 10 },
      labelBgStyle: { fill: '#f1f5f9' },
    }))

    return NextResponse.json({
      nodes: Array.from(nodesMap.values()),
      edges
    })
  } catch (error) {
    console.error("Error fetching graph data:", error)
    return NextResponse.json(
      { error: "Failed to fetch graph data" },
      { status: 500 }
    )
  }
}