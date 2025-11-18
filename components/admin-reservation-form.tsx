"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Room } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { format, differenceInDays, addDays } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { DateRange } from "react-day-picker"

interface AdminReservationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AdminReservationForm({ open, onOpenChange, onSuccess }: AdminReservationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [occupiedDates, setOccupiedDates] = useState<Date[]>([])
  const [startHour, setStartHour] = useState<string>("8")
  const [endHour, setEndHour] = useState<string>("18")
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    eventObject: "",
    notes: "",
  })

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch("/api/admin/rooms")
        if (response.ok) {
          const data = await response.json()
          setRooms(data)
        }
      } catch (error) {
        console.error("Error fetching rooms:", error)
      }
    }
    if (open) {
      fetchRooms()
    }
  }, [open])

  useEffect(() => {
    if (!selectedRoom) return

    const fetchOccupiedDates = async () => {
      try {
        const response = await fetch(`/api/reservations?room_id=${selectedRoom.id}`)
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
        console.error("Error fetching occupied dates:", error)
      }
    }
    fetchOccupiedDates()
  }, [selectedRoom])

  const calculateTotalPrice = () => {
    if (!dateRange?.from || !dateRange?.to || !selectedRoom) return 0
    const days = differenceInDays(dateRange.to, dateRange.from) + 1
    return days * selectedRoom.price_per_day
  }

  const totalPrice = calculateTotalPrice()
  const numberOfDays = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) + 1 : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedRoom) {
      toast.error("Veuillez sélectionner une salle")
      return
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Veuillez sélectionner une période de réservation")
      return
    }

    if (totalPrice <= 0) {
      toast.error("Veuillez sélectionner des dates valides")
      return
    }

    if (!formData.eventObject.trim()) {
      toast.error("Veuillez spécifier l'objet de l'événement")
      return
    }

    if (!formData.customerPhone.trim()) {
      toast.error("Veuillez fournir un numéro de téléphone")
      return
    }

    setIsSubmitting(true)

    try {
      const startDateTime = new Date(dateRange.from)
      startDateTime.setHours(Number.parseInt(startHour), 0, 0, 0)

      const endDateTime = new Date(dateRange.to)
      endDateTime.setHours(Number.parseInt(endHour), 59, 59, 999)

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room_id: selectedRoom.id,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          event_object: formData.eventObject,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          start_hour: Number.parseInt(startHour),
          end_hour: Number.parseInt(endHour),
          total_price: totalPrice,
          notes: formData.notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création de la réservation")
      }

      toast.success("Réservation créée avec succès !")
      onOpenChange(false)
      onSuccess()

      setSelectedRoom(null)
      setDateRange(undefined)
      setStartHour("8")
      setEndHour("18")
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        eventObject: "",
        notes: "",
      })
    } catch (error: any) {
      console.error("Booking error:", error)
      toast.error(error.message || "Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une réservation</DialogTitle>
          <DialogDescription>Créez une nouvelle réservation pour un client</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room">Salle *</Label>
            <Select
              value={selectedRoom?.id}
              onValueChange={(value) => {
                const room = rooms.find((r) => r.id === value)
                setSelectedRoom(room || null)
                setDateRange(undefined)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une salle" />
              </SelectTrigger>
              <SelectContent className="bg-gray-100">
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name} - {room.price_per_day.toLocaleString("fr-FR")} FCFA/jour
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom du client *</Label>
            <Input
              id="name"
              placeholder="Jean Dupont"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email du client *</Label>
            <Input
              id="email"
              type="email"
              placeholder="jean@example.com"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone du client *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+241 XX XX XX XX"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              required
            />
          </div>

          {selectedRoom && (
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
                          {format(dateRange.from, "PPP", { locale: fr })} -{" "}
                          {format(dateRange.to, "PPP", { locale: fr })}
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
                      if (date < new Date()) return true
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
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startHour">Heure de début *</Label>
              <Select value={startHour} onValueChange={setStartHour} required>
                <SelectTrigger id="startHour">
                  <SelectValue placeholder="Heure de début" />
                </SelectTrigger>
                <SelectContent className="bg-gray-100">
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, "0")}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endHour">Heure de fin *</Label>
              <Select  value={endHour} onValueChange={setEndHour} required>
                <SelectTrigger id="endHour">
                  <SelectValue placeholder="Heure de fin" />
                </SelectTrigger>
                <SelectContent className="bg-gray-100">
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()} disabled={i <= Number.parseInt(startHour)}>
                      {i.toString().padStart(2, "0")}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventObject">Objet de l'événement *</Label>
            <Input
              id="eventObject"
              placeholder="Ex: Réunion d'équipe, Formation, Conférence..."
              value={formData.eventObject}
              onChange={(e) => setFormData({ ...formData, eventObject: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Informations supplémentaires sur la réservation..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {totalPrice > 0 && selectedRoom && (
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {numberOfDays} jour{numberOfDays > 1 ? "s" : ""} ×{" "}
                  {selectedRoom.price_per_day.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-medium">Prix total</span>
                <div className="text-2xl font-bold">
                  {totalPrice.toLocaleString("fr-FR")} <span className="text-lg">FCFA</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Création en cours..." : "Créer la réservation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
