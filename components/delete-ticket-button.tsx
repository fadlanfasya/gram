"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

interface DeleteTicketButtonProps {
  ticketId: string
}

export function DeleteTicketButton({ ticketId }: DeleteTicketButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this ticket?")) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete")
      
      router.push("/tickets")
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Failed to delete ticket")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex items-center space-x-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
      <span>Delete</span>
    </button>
  )
}