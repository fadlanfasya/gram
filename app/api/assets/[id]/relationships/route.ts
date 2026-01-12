import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sourceId } = await params
    const body = await request.json()
    const { targetId, relationType, description } = body

    if (!targetId || !relationType) {
      return NextResponse.json(
        { error: "Target asset and relation type are required" },
        { status: 400 }
      )
    }

    if (sourceId === targetId) {
      return NextResponse.json(
        { error: "Cannot create relationship to self" },
        { status: 400 }
      )
    }

    const relationship = await prisma.assetRelation.create({
      data: {
        sourceId,
        targetId,
        relationType,
        description,
      },
      include: {
        targetAsset: {
          include: {
            assetType: true,
          },
        },
      },
    })

    return NextResponse.json(relationship, { status: 201 })
  } catch (error) {
    console.error("Error creating relationship:", error)
    return NextResponse.json(
      { error: "Failed to create relationship" },
      { status: 500 }
    )
  }
}