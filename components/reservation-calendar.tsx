"use client"

import { useState, useMemo } from "react"
import type { Reservation } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { ReservationDetailsDialog } from "@/components/reservation-details-dialog"

interface ReservationCalendarProps {
  reservations: Reservation[]
}

export function ReservationCalendar({ reservations }: ReservationCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const reservationsByDate = useMemo(() => {
    const map = new Map<string, Reservation[]>()
    reservations.forEach((reservation) => {
      const date = format(new Date(reservation.start_time), "yyyy-MM-dd")
      if (!map.has(date)) {
        map.set(date, [])
      }
      map.get(date)?.push(reservation)
    })
    return map
  }, [reservations])

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleReservationClick = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setDialogOpen(true)
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(currentMonth, "MMMM yyyy", { locale: fr })}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-24 border rounded-lg bg-muted/30" />
            ))}

            {/* Calendar Days */}
            {daysInMonth.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd")
              const dayReservations = reservationsByDate.get(dateKey) || []
              const isToday = isSameDay(day, new Date())

              return (
                <div
                  key={dateKey}
                  className={cn(
                    "min-h-24 border rounded-lg p-2 space-y-1",
                    isToday && "border-primary border-2",
                    !isSameMonth(day, currentMonth) && "bg-muted/30",
                  )}
                >
                  <div className={cn("text-sm font-medium", isToday && "text-primary")}>{format(day, "d")}</div>
                  <div className="space-y-1">
                    {dayReservations.slice(0, 2).map((reservation) => (
                      <button
                        key={reservation.id}
                        onClick={() => handleReservationClick(reservation)}
                        className="w-full text-left"
                      >
                        <div
                          className={cn("text-xs p-1 rounded truncate text-white", getStatusColor(reservation.status))}
                        >
                          {reservation.room?.name}
                        </div>
                      </button>
                    ))}
                    {dayReservations.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center">+{dayReservations.length - 2}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-6 pt-6 border-t">
            <span className="text-sm font-medium">Légende:</span>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-500" />
              <span className="text-sm">Confirmée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-yellow-500" />
              <span className="text-sm">En attente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-red-500" />
              <span className="text-sm">Annulée</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedReservation && (
        <ReservationDetailsDialog reservation={selectedReservation} open={dialogOpen} onOpenChange={setDialogOpen} />
      )}
    </>
  )
}
