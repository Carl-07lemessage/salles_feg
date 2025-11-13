"use client"

import type { Reservation } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format, differenceInDays } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar, Mail, Phone, User, Building2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ReservationDetailsDialogProps {
  reservation: Reservation
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReservationDetailsDialog({ reservation, open, onOpenChange }: ReservationDetailsDialogProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async (newStatus: "confirmed" | "cancelled") => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour")
      }

      toast.success(`Réservation ${newStatus === "confirmed" ? "confirmée" : "annulée"} avec succès`)
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Update error:", error)
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setIsUpdating(false)
    }
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

  const numberOfDays = differenceInDays(new Date(reservation.end_time), new Date(reservation.start_time)) + 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails de la réservation</DialogTitle>
          <DialogDescription>Informations complètes sur la réservation</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Statut</span>
            {getStatusBadge(reservation.status)}
          </div>

          {/* Room Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="h-4 w-4" />
              <span>Salle</span>
            </div>
            <div className="pl-6">
              <p className="font-medium">{reservation.room?.name || "N/A"}</p>
              <p className="text-sm text-muted-foreground">{reservation.room?.description}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Informations client</div>
            <div className="space-y-2 pl-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{reservation.customer_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{reservation.customer_email}</span>
              </div>
              {reservation.customer_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{reservation.customer_phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">Période de réservation</div>
            <div className="space-y-2 pl-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Du {format(new Date(reservation.start_time), "PPP", { locale: fr })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Au {format(new Date(reservation.end_time), "PPP", { locale: fr })}</span>
              </div>
              <div className="text-sm text-muted-foreground pl-6">
                ({numberOfDays} jour{numberOfDays > 1 ? "s" : ""})
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-2xl">₣</span>
              <span>Prix total</span>
            </div>
            <span className="text-lg font-bold">{reservation.total_price.toLocaleString("fr-FR")} FCFA</span>
          </div>

          {/* Notes */}
          {reservation.notes && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Notes</div>
              <p className="text-sm text-muted-foreground pl-6">{reservation.notes}</p>
            </div>
          )}

          {/* Actions */}
          {reservation.status === "pending" && (
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => handleStatusUpdate("confirmed")}
                disabled={isUpdating}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                Confirmer la réservation
              </Button>
              <Button
                onClick={() => handleStatusUpdate("cancelled")}
                disabled={isUpdating}
                variant="destructive"
                className="flex-1"
              >
                Annuler la réservation
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
