import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Calendar, User, Tag, AlertCircle } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { DeleteTicketButton } from "@/components/delete-ticket-button"

async function getTicket(id: string) {
  return prisma.ticket.findUnique({
    where: { id },
    include: {
      asset: true,
      assignedTo: true,
      createdBy: true,
    },
  })
}

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ticket = await getTicket(id)

  if (!ticket) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/tickets" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-gray-400 font-normal">#{ticket.id.slice(-6)}</span>
              {ticket.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Created by {ticket.createdBy.name} on {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/tickets/${ticket.id}/edit`}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Link>
          <DeleteTicketButton ticketId={ticket.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Ticket Info</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 capitalize px-2 py-1 bg-gray-100 inline-block rounded text-sm font-semibold">
                  {ticket.status.replace("_", " ")}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Priority</dt>
                <dd className="mt-1 capitalize">{ticket.priority}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  {ticket.assignedTo?.name || "Unassigned"}
                </dd>
              </div>
              {ticket.asset && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Related Asset</dt>
                  <dd className="mt-1">
                    <Link href={`/assets/${ticket.asset.id}`} className="text-blue-600 hover:underline flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      {ticket.asset.name}
                    </Link>
                  </dd>
                </div>
              )}
               {ticket.category && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="mt-1">{ticket.category}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}