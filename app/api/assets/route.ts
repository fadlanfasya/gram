import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, assetTypeId, status, data } = body

    // TODO: Get actual user from session/auth
    // For now, create or get a default user
    let user = await prisma.user.findFirst()
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "admin@example.com",
          password: "temp", // This should be hashed
          name: "Admin",
        },
      })
    }

    const asset = await prisma.asset.create({
      data: {
        name,
        assetTypeId,
        status: status || "active",
        data: data || "{}",
        createdById: user.id,
      },
      include: {
        assetType: true,
        createdBy: true,
      },
    })

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error("Error creating asset:", error)
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const assetTypeId = searchParams.get("assetTypeId")
    const status = searchParams.get("status")

    const assets = await prisma.asset.findMany({
      where: {
        ...(assetTypeId && { assetTypeId }),
        ...(status && { status }),
      },
      include: {
        assetType: true,
        createdBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(assets)
  } catch (error) {
    console.error("Error fetching assets:", error)
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    )
  }
}
