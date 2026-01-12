import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, icon, fields } = body

    const assetType = await prisma.assetType.create({
      data: {
        name,
        description: description || null,
        icon: icon || null,
        fields: fields || "[]",
      },
    })

    return NextResponse.json(assetType, { status: 201 })
  } catch (error) {
    console.error("Error creating asset type:", error)
    return NextResponse.json(
      { error: "Failed to create asset type" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const assetTypes = await prisma.assetType.findMany({
      include: {
        _count: {
          select: {
            assets: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(assetTypes)
  } catch (error) {
    console.error("Error fetching asset types:", error)
    return NextResponse.json(
      { error: "Failed to fetch asset types" },
      { status: 500 }
    )
  }
}
