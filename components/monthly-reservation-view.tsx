"use client"

import { useState } from "react"
import type { Reservation } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, CheckCircle, XCircle } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
} from "date-fns"
import { fr } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface MonthlyReservationViewProps {
  reservations: Reservation[]
}

export function MonthlyReservationView({ reservations }: MonthlyReservationViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const [updatingReservationId, setUpdatingReservationId] = useState<string | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Start on Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getReservationsForDay = (day: Date) => {
    return reservations.filter((reservation) => {
      const startDate = new Date(reservation.start_time)
      const endDate = new Date(reservation.end_time)
      return day >= startDate && day <= endDate && reservation.status !== "cancelled"
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmée"
      case "pending":
        return "En attente"
      case "cancelled":
        return "Annulée"
      default:
        return status
    }
  }

  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

  const updateReservationStatus = async (reservationId: string, newStatus: "confirmed" | "cancelled") => {
    setUpdatingReservationId(reservationId)

    try {
      const response = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour")
      }

      toast({
        title: "Succès",
        description: `Réservation ${newStatus === "confirmed" ? "confirmée" : "annulée"} avec succès`,
      })

      // Refresh the page to get updated data
      router.refresh()
      setSelectedDay(null)
    } catch (error) {
      console.error("Error updating reservation:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la réservation",
        variant: "destructive",
      })
    } finally {
      setUpdatingReservationId(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Calendrier des Réservations</CardTitle>
              <CardDescription>Visualisez toutes les réservations par mois</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[200px] text-center">
                <h2 className="text-xl font-semibold capitalize">{format(currentDate, "MMMM yyyy", { locale: fr })}</h2>
              </div>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Week day headers */}
            {weekDays.map((day) => (
              <div key={day} className="text-center font-semibold text-sm py-2 border-b">
                {day}
              </div>
            ))}

            {calendarDays.map((day) => {
              const dayReservations = getReservationsForDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isDayToday = isToday(day)

              return (
                <div
                  key={day.toString()}
                  className={`min-h-[120px] border rounded-lg p-2 ${
                    isCurrentMonth ? "bg-background" : "bg-muted/30"
                  } ${isDayToday ? "ring-2 ring-primary" : ""} hover:bg-accent cursor-pointer transition-colors`}
                  onClick={() => dayReservations.length > 0 && setSelectedDay(day)}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-medium ${
                        isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                      } ${isDayToday ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center" : ""}`}
                    >
                      {format(day, "d")}
                    </span>
                    {dayReservations.length > 0 && (
                      <Badge variant="secondary" className="text-xs px-1 h-5">
                        {dayReservations.length}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayReservations.slice(0, 2).map((reservation) => (
                      <div
                        key={reservation.id}
                        className={`text-xs p-1 rounded ${getStatusColor(reservation.status)} text-white truncate`}
                      >
                        <div className="font-medium truncate">{reservation.room?.name}</div>
                        <div className="truncate opacity-90">
                          {reservation.start_hour?.toString().padStart(2, "0")}:00
                        </div>
                      </div>
                    ))}
                    {dayReservations.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayReservations.length - 2} autre{dayReservations.length - 2 > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Empty state */}
          {reservations.length === 0 && (
            <div className="text-center py-12 text-muted-foreground mt-8">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Aucune réservation</p>
              <p className="text-sm">Les réservations apparaîtront dans le calendrier</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={selectedDay !== null} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Réservations du {selectedDay && format(selectedDay, "EEEE d MMMM yyyy", { locale: fr })}
            </DialogTitle>
            <DialogDescription>
              {selectedDay && getReservationsForDay(selectedDay).length} réservation
              {selectedDay && getReservationsForDay(selectedDay).length > 1 ? "s" : ""} pour cette journée
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[500px] pr-4">
            <div className="space-y-4">
              {selectedDay &&
                getReservationsForDay(selectedDay).map((reservation) => (
                  <div key={reservation.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{reservation.event_object || "Sans objet"}</h4>
                        <p className="text-sm text-muted-foreground">{reservation.room?.name}</p>
                      </div>
                      <Badge
                        variant={reservation.status === "confirmed" ? "default" : "secondary"}
                        className={getStatusColor(reservation.status)}
                      >
                        {getStatusLabel(reservation.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Client:</span> {reservation.customer_name}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {reservation.customer_email}
                      </div>
                      <div>
                        <span className="font-medium">Téléphone:</span> {reservation.customer_phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {reservation.start_hour?.toString().padStart(2, "0")}:00 -{" "}
                          {reservation.end_hour?.toString().padStart(2, "0")}:00
                        </span>
                      </div>
                    </div>

                    {reservation.notes && (
                      <div className="pt-2 border-t">
                        <span className="text-sm font-medium">Notes:</span>
                        <p className="text-sm text-muted-foreground mt-1">{reservation.notes}</p>
                      </div>
                    )}

                    {reservation.status !== "cancelled" && (
                      <div className="flex gap-2 pt-2 border-t">
                        {reservation.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => updateReservationStatus(reservation.id, "confirmed")}
                            disabled={updatingReservationId === reservation.id}
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirmer
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateReservationStatus(reservation.id, "cancelled")}
                          disabled={updatingReservationId === reservation.id}
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Annuler
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
