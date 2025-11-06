"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Room } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format, differenceInDays, addDays } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { DateRange } from "react-day-picker"

interface BookingFormProps {
  room: Room
}

export function BookingForm({ room }: BookingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [occupiedDates, setOccupiedDates] = useState<Date[]>([])
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
  })

  useEffect(() => {
    const fetchOccupiedDates = async () => {
      try {
        const response = await fetch(`/api/reservations?room_id=${room.id}`)
        if (response.ok) {
          const reservations = await response.json()
          const dates: Date[] = []
          reservations.forEach((reservation: any) => {
            if (reservation.status !== "cancelled") {
              const start = new Date(reservation.start_time)
              const end = new Date(reservation.end_time)
              const days = differenceInDays(end, start)
              for (let i = 0; i <= days; i++) {
                dates.push(addDays(start, i))
              }
            }
          })
          setOccupiedDates(dates)
        }
      } catch (error) {
        console.error("[v0] Error fetching occupied dates:", error)
      }
    }
    fetchOccupiedDates()
  }, [room.id])

  const calculateTotalPrice = () => {
    if (!dateRange?.from || !dateRange?.to) return 0
    const days = differenceInDays(dateRange.to, dateRange.from) + 1 // +1 to include both start and end days
    return days * room.price_per_day
  }

  const totalPrice = calculateTotalPrice()
  const numberOfDays = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) + 1 : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Veuillez sélectionner une période de réservation")
      return
    }

    if (totalPrice <= 0) {
      toast.error("Veuillez sélectionner des dates valides")
      return
    }

    setIsSubmitting(true)

    try {
      const startDateTime = new Date(dateRange.from)
      startDateTime.setHours(0, 0, 0, 0)

      const endDateTime = new Date(dateRange.to)
      endDateTime.setHours(23, 59, 59, 999)

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room_id: room.id,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          total_price: totalPrice,
          notes: formData.notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création de la réservation")
      }

      toast.success("Demande de réservation envoyée avec succès !")
      router.push("/")
    } catch (error: any) {
      console.error("[v0] Booking error:", error)
      toast.error(error.message || "Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Réserver cette salle</CardTitle>
        <CardDescription>Remplissez le formulaire pour faire une demande de réservation</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet *</Label>
            <Input
              id="name"
              placeholder="Jean Dupont"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              required
            />
          </div>

          {/* Customer Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="jean.dupont@example.com"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              required
            />
          </div>

          {/* Customer Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+241 XX XX XX XX"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Période de réservation *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "PPP", { locale: fr })} - {format(dateRange.to, "PPP", { locale: fr })}
                      </>
                    ) : (
                      format(dateRange.from, "PPP", { locale: fr })
                    )
                  ) : (
                    "Sélectionner les dates"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  disabled={(date) => {
                    // Disable past dates
                    if (date < new Date()) return true
                    // Disable occupied dates
                    return occupiedDates.some((occupiedDate) => occupiedDate.toDateString() === date.toDateString())
                  }}
                  numberOfMonths={2}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
            {occupiedDates.length > 0 && (
              <p className="text-xs text-muted-foreground">Les dates grisées sont déjà réservées</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Informations supplémentaires sur votre réservation..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {totalPrice > 0 && (
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {numberOfDays} jour{numberOfDays > 1 ? "s" : ""} × {room.price_per_day.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-medium">Prix total estimé</span>
                <div className="text-2xl font-bold">
                  {totalPrice.toLocaleString("fr-FR")} <span className="text-lg">FCFA</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Votre demande sera examinée et vous recevrez une confirmation par email.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
