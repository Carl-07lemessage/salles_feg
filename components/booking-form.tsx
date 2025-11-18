"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Room } from "@/lib/types"
import { CATERING_OPTIONS } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { CalendarIcon, Check } from 'lucide-react'
import { format, differenceInDays, addDays } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useRouter } from 'next/navigation'
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
  const [startHour, setStartHour] = useState<string>("8")
  const [endHour, setEndHour] = useState<string>("18")
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    eventObject: "",
    notes: "",
    numberOfGuests: 1,
  })

  const [cateringOptions, setCateringOptions] = useState({
    lunchSelected: false,
    breakfastOption: null as number | null,
    coffeeBreakSelected: false,
  })
  // </CHANGE>

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
        console.error("Error fetching occupied dates:", error)
      }
    }
    fetchOccupiedDates()
  }, [room.id])

  const calculateCateringCost = () => {
    let cost = 0
    const guests = formData.numberOfGuests

    if (cateringOptions.lunchSelected) {
      cost += CATERING_OPTIONS.lunch.price * guests
    }

    if (cateringOptions.breakfastOption) {
      const breakfast = CATERING_OPTIONS.breakfast.find((b) => b.id === cateringOptions.breakfastOption)
      if (breakfast) {
        cost += breakfast.price * guests
      }
    }

    if (cateringOptions.coffeeBreakSelected) {
      cost += CATERING_OPTIONS.coffeeBreak.price * guests
    }

    return cost
  }
  // </CHANGE>

  const calculateTotalPrice = () => {
    if (!dateRange?.from || !dateRange?.to) return 0
    const days = differenceInDays(dateRange.to, dateRange.from) + 1
    const roomCost = days * room.price_per_day
    const cateringCost = calculateCateringCost()
    return roomCost + cateringCost
  }

  const totalPrice = calculateTotalPrice()
  const numberOfDays = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) + 1 : 0
  const cateringCost = calculateCateringCost()
  const roomCost = numberOfDays * room.price_per_day

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
          room_id: room.id,
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
          lunch_selected: cateringOptions.lunchSelected,
          breakfast_option: cateringOptions.breakfastOption,
          coffee_break_selected: cateringOptions.coffeeBreakSelected,
          number_of_guests: formData.numberOfGuests,
          // </CHANGE>
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création de la réservation")
      }

      toast.success("Demande de réservation envoyée avec succès !")
      router.push("/")
    } catch (error: any) {
      console.error("Booking error:", error)
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
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <Label htmlFor="phone">Téléphone *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+241 XX XX XX XX"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              required
            />
          </div>

          {/* Event Object */}
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

          {/* Number of Guests */}
          <div className="space-y-2">
            <Label htmlFor="guests">Nombre de participants *</Label>
            <Input
              id="guests"
              type="number"
              min="1"
              max={room.capacity}
              value={formData.numberOfGuests}
              onChange={(e) => setFormData({ ...formData, numberOfGuests: Number.parseInt(e.target.value) || 1 })}
              required
            />
            <p className="text-xs text-muted-foreground">Capacité maximale : {room.capacity} personnes</p>
          </div>

          <div className="space-y-2">
            <Label>Période de réservation *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full bg-gray-50 justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
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

          {/* Time Slots Selection */}
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
              <Select value={endHour} onValueChange={setEndHour} required>
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

          <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Options de Restauration</h3>
              <span className="text-sm text-muted-foreground">Optionnel</span>
            </div>

            {/* Lunch Option */}
            <div className="flex items-start justify-between space-x-4 rounded-lg border bg-card p-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="lunch" className="text-base font-semibold">
                    {CATERING_OPTIONS.lunch.name}
                  </Label>
                  <Switch
                    id="lunch"
                    checked={cateringOptions.lunchSelected}
                    onCheckedChange={(checked) =>
                      setCateringOptions({ ...cateringOptions, lunchSelected: checked })
                    }
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-2">{CATERING_OPTIONS.lunch.description}</p>
                <p className="text-sm font-semibold text-primary">
                  {CATERING_OPTIONS.lunch.price.toLocaleString("fr-FR")} FCFA/pers
                </p>
              </div>
            </div>

            {/* Breakfast Options */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Petit-déjeuner</Label>
              {CATERING_OPTIONS.breakfast.map((breakfast) => (
                <div
                  key={breakfast.id}
                  className={cn(
                    "rounded-lg border bg-card p-4 cursor-pointer transition-all",
                    cateringOptions.breakfastOption === breakfast.id && "ring-2 ring-primary",
                  )}
                  onClick={() =>
                    setCateringOptions({
                      ...cateringOptions,
                      breakfastOption: cateringOptions.breakfastOption === breakfast.id ? null : breakfast.id,
                    })
                  }
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          cateringOptions.breakfastOption === breakfast.id
                            ? "border-primary bg-primary"
                            : "border-muted-foreground",
                        )}
                      >
                        {cateringOptions.breakfastOption === breakfast.id && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="font-semibold">{breakfast.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      {breakfast.price.toLocaleString("fr-FR")} FCFA/pers
                    </span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                    {breakfast.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Coffee Break Option */}
            <div className="flex items-start justify-between space-x-4 rounded-lg border bg-card p-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="coffeeBreak" className="text-base font-semibold">
                    {CATERING_OPTIONS.coffeeBreak.name}
                  </Label>
                  <Switch
                    id="coffeeBreak"
                    checked={cateringOptions.coffeeBreakSelected}
                    onCheckedChange={(checked) =>
                      setCateringOptions({ ...cateringOptions, coffeeBreakSelected: checked })
                    }
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-2">{CATERING_OPTIONS.coffeeBreak.description}</p>
                <p className="text-sm font-semibold text-primary">
                  {CATERING_OPTIONS.coffeeBreak.price.toLocaleString("fr-FR")} FCFA/pers
                </p>
              </div>
            </div>
          </div>
          {/* </CHANGE> */}

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
                <span>Location de salle ({numberOfDays} jour{numberOfDays > 1 ? "s" : ""})</span>
                <span>{roomCost.toLocaleString("fr-FR")} FCFA</span>
              </div>
              {cateringCost > 0 && (
                <>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Restauration ({formData.numberOfGuests} pers.)</span>
                    <span>{cateringCost.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                  <div className="text-xs text-muted-foreground pl-4 space-y-1">
                    {cateringOptions.lunchSelected && (
                      <div className="flex justify-between">
                        <span>• Déjeuner</span>
                        <span>
                          {(CATERING_OPTIONS.lunch.price * formData.numberOfGuests).toLocaleString("fr-FR")} FCFA
                        </span>
                      </div>
                    )}
                    {cateringOptions.breakfastOption && (
                      <div className="flex justify-between">
                        <span>
                          • Petit-déjeuner Option {cateringOptions.breakfastOption}
                        </span>
                        <span>
                          {(
                            CATERING_OPTIONS.breakfast.find((b) => b.id === cateringOptions.breakfastOption)!.price *
                            formData.numberOfGuests
                          ).toLocaleString("fr-FR")}{" "}
                          FCFA
                        </span>
                      </div>
                    )}
                    {cateringOptions.coffeeBreakSelected && (
                      <div className="flex justify-between">
                        <span>• Pause-café</span>
                        <span>
                          {(CATERING_OPTIONS.coffeeBreak.price * formData.numberOfGuests).toLocaleString("fr-FR")} FCFA
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-medium">Prix total estimé</span>
                <div className="text-2xl font-bold">
                  {totalPrice.toLocaleString("fr-FR")} <span className="text-lg">FCFA</span>
                </div>
              </div>
            </div>
          )}
          {/* </CHANGE> */}

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
