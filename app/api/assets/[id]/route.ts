import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const asset = await prisma.asset.findUnique({
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

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error("Error fetching asset:", error)
    return NextResponse.json(
      { error: "Failed to fetch asset" },
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
    const { name, assetTypeId, status, data } = body

    const asset = await prisma.asset.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(assetTypeId && { assetTypeId }),
        ...(status && { status }),
        ...(data && { data }),
      },
      include: {
        assetType: true,
        createdBy: true,
      },
    })

    return NextResponse.json(asset)
  } catch (error) {
    console.error("Error updating asset:", error)
    return NextResponse.json(
      { error: "Failed to update asset" },
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
    await prisma.asset.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting asset:", error)
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    )
  }
}
