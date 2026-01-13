import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, priority, category, assetId } = body

    // Mock user auth (same as assets)
    let user = await prisma.user.findFirst()
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "admin@example.com",
          password: "temp",
          name: "Admin",
        },
      })
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: priority || "medium",
        category,
        assetId: assetId || null,
        createdById: user.id,
        status: "open",
      },
      include: {
        asset: {
            include: {
                assetType: true
            }
        },
        createdBy: true,
      },
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const assetId = searchParams.get("assetId")

    const tickets = await prisma.ticket.findMany({
      where: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assetId && { assetId }),
      },
      include: {
        asset: {
          include: {
            assetType: true
          }
        },
        createdBy: true,
        assignedTo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(tickets)
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    )
  }
}