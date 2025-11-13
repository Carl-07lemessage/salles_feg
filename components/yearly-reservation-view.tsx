"use client"

import { useState } from "react"
import type { Reservation } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { CalendarIcon, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
} from "date-fns"
import { fr } from "date-fns/locale"

interface YearlyReservationViewProps {
  reservations: Reservation[]
}

export function YearlyReservationView({ reservations }: YearlyReservationViewProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const [updatingReservationId, setUpdatingReservationId] = useState<string | null>(null)

  const yearStart = startOfYear(new Date(currentYear, 0, 1))
  const yearEnd = endOfYear(new Date(currentYear, 11, 31))
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd })

  const previousYear = () => {
    setCurrentYear(currentYear - 1)
  }

  const nextYear = () => {
    setCurrentYear(currentYear + 1)
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

  const weekDaysShort = ["L", "M", "M", "J", "V", "S", "D"]

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

  const renderMonth = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    return (
      <Card key={monthDate.toString()} className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base capitalize">{format(monthDate, "MMMM", { locale: fr })}</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="grid grid-cols-7 gap-1">
            {/* Week day headers */}
            {weekDaysShort.map((day, index) => (
              <div key={`${day}-${index}`} className="text-center text-xs font-medium text-muted-foreground py-1">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day) => {
              const dayReservations = getReservationsForDay(day)
              const isCurrentMonth = isSameMonth(day, monthDate)
              const isDayToday = isToday(day)

              return (
                <div
                  key={day.toString()}
                  className={`aspect-square text-xs border rounded flex flex-col items-center justify-center relative ${
                    isCurrentMonth ? "bg-background" : "bg-muted/30"
                  } ${isDayToday ? "ring-1 ring-primary" : ""} ${
                    dayReservations.length > 0 ? "cursor-pointer hover:bg-accent" : ""
                  } transition-colors`}
                  onClick={() => dayReservations.length > 0 && setSelectedDay(day)}
                >
                  <span
                    className={`font-medium ${isCurrentMonth ? "text-foreground" : "text-muted-foreground"} ${
                      isDayToday
                        ? "bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        : ""
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {dayReservations.length > 0 && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {dayReservations.slice(0, 3).map((res) => (
                        <div key={res.id} className={`w-1 h-1 rounded-full ${getStatusColor(res.status)}`} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vue Annuelle des Réservations</CardTitle>
              <CardDescription>Tous les mois de l'année en un coup d'œil</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={previousYear}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[100px] text-center">
                <h2 className="text-xl font-semibold">{currentYear}</h2>
              </div>
              <Button variant="outline" size="icon" onClick={nextYear}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Grid of 12 months */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {months.map(renderMonth)}
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

      {/* Dialog for day details */}
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
