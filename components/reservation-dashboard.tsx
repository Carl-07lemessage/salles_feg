"use client"

import { useState } from "react"
import type { Reservation } from "@/lib/types"
import { ReservationCalendar } from "@/components/reservation-calendar"
import { ReservationList } from "@/components/reservation-list"
import { AdminReservationForm } from "@/components/admin-reservation-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface ReservationDashboardProps {
  reservations: Reservation[]
  view: "calendar" | "list"
}

export function ReservationDashboard({ reservations, view }: ReservationDashboardProps) {
  const router = useRouter()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const handleSuccess = () => {
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Créer une réservation
        </Button>
      </div>

      {view === "calendar" ? (
        <ReservationCalendar reservations={reservations} />
      ) : (
        <ReservationList reservations={reservations} />
      )}

      <AdminReservationForm open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={handleSuccess} />
    </div>
  )
}
