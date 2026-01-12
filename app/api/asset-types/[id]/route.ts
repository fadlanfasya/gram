import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const assetType = await prisma.assetType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            assets: true,
          },
        },
      },
    })

    if (!assetType) {
      return NextResponse.json({ error: "Asset type not found" }, { status: 404 })
    }

    return NextResponse.json(assetType)
  } catch (error) {
    console.error("Error fetching asset type:", error)
    return NextResponse.json(
      { error: "Failed to fetch asset type" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, icon, fields } = body

    const assetType = await prisma.assetType.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(fields && { fields }),
      },
    })

    return NextResponse.json(assetType)
  } catch (error) {
    console.error("Error updating asset type:", error)
    return NextResponse.json(
      { error: "Failed to update asset type" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.assetType.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting asset type:", error)
    return NextResponse.json(
      { error: "Failed to delete asset type" },
      { status: 500 }
    )
  }
}
