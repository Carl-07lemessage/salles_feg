"use client"

import { useState } from "react"
import type { Reservation } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ReservationDetailsDialog } from "@/components/reservation-details-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReservationListProps {
  reservations: Reservation[]
}

export function ReservationList({ reservations }: ReservationListProps) {
  console.log("ReservationList received", reservations.length, "reservations")
  // </CHANGE>

  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredReservations = reservations.filter((reservation) => {
    if (statusFilter === "all") return true
    return reservation.status === statusFilter
  })

  console.log("After filtering by", statusFilter, ":", filteredReservations.length, "reservations")
  // </CHANGE>

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmée</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">En attente</Badge>
      case "cancelled":
        return <Badge variant="destructive">Annulée</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-4">
        <span className="text-sm font-medium">Filtrer par statut:</span>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="confirmed">Confirmées</SelectItem>
            <SelectItem value="cancelled">Annulées</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filteredReservations.length} réservation{filteredReservations.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Salle</TableHead>
              <TableHead>Date et heure</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Aucune réservation trouvée
                </TableCell>
              </TableRow>
            ) : (
              filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{reservation.customer_name}</div>
                      <div className="text-sm text-muted-foreground">{reservation.customer_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{reservation.room?.name || "N/A"}</TableCell>
                  <TableCell>
                    <div>
                      <div>{format(new Date(reservation.start_time), "PPP", { locale: fr })}</div>
                      <div className="text-sm text-muted-foreground">
                        au {format(new Date(reservation.end_time), "PPP", { locale: fr })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{reservation.total_price.toLocaleString("fr-FR")} FCFA</TableCell>
                  <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleViewDetails(reservation)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedReservation && (
        <ReservationDetailsDialog reservation={selectedReservation} open={dialogOpen} onOpenChange={setDialogOpen} />
      )}
    </>
  )
}
