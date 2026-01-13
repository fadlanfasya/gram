import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { TicketForm } from "@/components/ticket-form"
import { Asset } from "@prisma/client"

interface PageProps {
  params: Promise<{ id: string }>
}

async function getTicket(id: string) {
  return prisma.ticket.findUnique({ where: { id } })
}

async function getAssets() {
  return prisma.asset.findMany({ orderBy: { name: "asc" } })
}

export default async function EditTicketPage({ params }: PageProps) {
  const { id } = await params
  const [ticket, assets] = await Promise.all([
    getTicket(id),
    getAssets(),
  ])

  if (!ticket) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Ticket</h1>
        <p className="mt-2 text-gray-600">Update ticket details</p>
      </div>

      <TicketForm 
        assets={assets} 
        initialData={{
            title: ticket.title,
            description: ticket.description,
            priority: ticket.priority as "low" | "medium" | "high" | "critical",
            category: ticket.category || "",
            status: ticket.status as "open" | "in_progress" | "resolved" | "closed",
            assetId: ticket.assetId || ""
        }}
        ticketId={ticket.id}
      />
    </div>
  )
}