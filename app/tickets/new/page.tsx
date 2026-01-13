import { prisma } from "@/lib/prisma"
import { TicketForm } from "@/components/ticket-form"

async function getAssets() {
  return prisma.asset.findMany({
    orderBy: { name: "asc" },
  })
}

export default async function NewTicketPage() {
  const assets = await getAssets()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Ticket</h1>
        <p className="mt-2 text-gray-600">Raise a new issue or service request</p>
      </div>
      <TicketForm assets={assets} />
    </div>
  )
}