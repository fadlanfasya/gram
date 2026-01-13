import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        asset: {
          include: {
            assetType: true
          }
        },
        createdBy: true,
        assignedTo: true,
        comments: {
            include: {
                user: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        }
      },
    })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Error fetching ticket:", error)
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
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
    const { title, description, status, priority, category, assetId, assignedToId } = body

    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(category && { category }),
        // Allow unassigning asset/user by passing explicit null, or updating if string
        ...(assetId !== undefined && { assetId }), 
        ...(assignedToId !== undefined && { assignedToId }),
      },
      include: {
        asset: true,
        createdBy: true,
        assignedTo: true,
      },
    })

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Error updating ticket:", error)
    return NextResponse.json(
      { error: "Failed to update ticket" },
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
    await prisma.ticket.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting ticket:", error)
    return NextResponse.json(
      { error: "Failed to delete ticket" },
      { status: 500 }
    )
  }
}