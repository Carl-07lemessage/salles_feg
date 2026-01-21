"use client"

import { useState } from "react"
import { type Reservation, CATERING_OPTIONS } from "@/lib/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Printer, Edit2, X, Check, RotateCcw } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface InvoiceProps {
  reservation: Reservation
  invoiceNumber?: string
  isAdmin?: boolean
  onPriceUpdate?: (updatedReservation: Reservation) => void
}

export function Invoice({ reservation, invoiceNumber, isAdmin = false, onPriceUpdate }: InvoiceProps) {
  const [isEditingPrice, setIsEditingPrice] = useState(false)
  const [adjustedPrice, setAdjustedPrice] = useState<string>(
    reservation.admin_adjusted_price?.toString() || reservation.total_price.toString()
  )
  const [priceNote, setPriceNote] = useState<string>(reservation.admin_price_note || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentReservation, setCurrentReservation] = useState(reservation)

  const handlePrint = () => {
    window.print()
  }

  const handleSavePrice = async () => {
    const newPrice = Number.parseFloat(adjustedPrice)
    if (Number.isNaN(newPrice) || newPrice < 0) {
      toast.error("Veuillez entrer un prix valide")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/reservations/${reservation.id}/price`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_adjusted_price: newPrice,
          admin_price_note: priceNote || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour")
      }

      const updatedReservation = await response.json()
      setCurrentReservation({ ...currentReservation, ...updatedReservation })
      setIsEditingPrice(false)
      toast.success("Prix mis à jour avec succès")
      if (onPriceUpdate) {
        onPriceUpdate({ ...currentReservation, ...updatedReservation })
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du prix")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPrice = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/admin/reservations/${reservation.id}/price`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la réinitialisation")
      }

      const updatedReservation = await response.json()
      setCurrentReservation({ ...currentReservation, admin_adjusted_price: null, admin_price_note: null })
      setAdjustedPrice(currentReservation.total_price.toString())
      setPriceNote("")
      setIsEditingPrice(false)
      toast.success("Prix réinitialisé au montant calculé")
      if (onPriceUpdate) {
        onPriceUpdate({ ...currentReservation, admin_adjusted_price: null, admin_price_note: null })
      }
    } catch (error) {
      toast.error("Erreur lors de la réinitialisation du prix")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Use currentReservation for display
  const displayReservation = currentReservation

  // Calculate catering costs
  const cateringCosts = []
  let cateringTotal = 0

  if (reservation.lunch_selected && reservation.number_of_guests) {
    const cost = CATERING_OPTIONS.lunch.price * reservation.number_of_guests
    cateringCosts.push({
      name: CATERING_OPTIONS.lunch.name,
      description: CATERING_OPTIONS.lunch.description,
      quantity: reservation.number_of_guests,
      unitPrice: CATERING_OPTIONS.lunch.price,
      total: cost,
    })
    cateringTotal += cost
  }

  if (reservation.breakfast_option && reservation.number_of_guests) {
    const option = CATERING_OPTIONS.breakfast.find((opt) => opt.id === reservation.breakfast_option)
    if (option) {
      const cost = option.price * reservation.number_of_guests
      cateringCosts.push({
        name: option.name,
        description: option.items.join(", "),
        quantity: reservation.number_of_guests,
        unitPrice: option.price,
        total: cost,
      })
      cateringTotal += cost
    }
  }

  if (reservation.coffee_break_selected && reservation.number_of_guests) {
    const cost = CATERING_OPTIONS.coffeeBreak.price * reservation.number_of_guests
    cateringCosts.push({
      name: CATERING_OPTIONS.coffeeBreak.name,
      description: CATERING_OPTIONS.coffeeBreak.description,
      quantity: reservation.number_of_guests,
      unitPrice: CATERING_OPTIONS.coffeeBreak.price,
      total: cost,
    })
    cateringTotal += cost
  }

  return (
    <div className="bg-white">
      <div className="print:block hidden">
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .invoice-container, .invoice-container * {
              visibility: visible;
            }
            .invoice-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </div>

      <div className="invoice-container max-w-4xl mx-auto p-8">
        {/* Header avec logo */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-primary">
          <div>
            <Image src="/logo-feg.png" alt="FEG Logo" width={150} height={50} className="mb-4" />
            <h1 className="text-3xl font-bold text-primary">FACTURE</h1>
            <p className="text-lg text-muted-foreground mt-1">
              {invoiceNumber || `INV-${reservation.id.slice(0, 8).toUpperCase()}`}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg">Fédération des Entreprises du Gabon</p>
            <p className="text-sm text-muted-foreground mt-1">Libreville, Gabon</p>
            <p className="text-sm text-muted-foreground">info@feg-gabon.org</p>
          </div>
        </div>

        {/* Informations client et réservation */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-3">Facturé à</h3>
            <p className="font-semibold text-lg">{reservation.customer_name}</p>
            <p className="text-sm text-muted-foreground">{reservation.customer_email}</p>
            <p className="text-sm text-muted-foreground">{reservation.customer_phone}</p>
          </div>
          <div>
            <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-3">Détails de la réservation</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Date d'émission:</span>{" "}
                {format(new Date(reservation.created_at), "PPP", { locale: fr })}
              </p>
              <p>
                <span className="font-medium">Statut:</span>{" "}
                <span
                  className={`font-semibold ${
                    reservation.status === "confirmed"
                      ? "text-green-600"
                      : reservation.status === "pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {reservation.status === "confirmed"
                    ? "Confirmée"
                    : reservation.status === "pending"
                      ? "En attente"
                      : "Annulée"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Détails de la location */}
        <div className="mb-8">
          <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-4 pb-2 border-b">
            Détails de la location
          </h3>
          <table className="w-full">
            <thead>
              <tr className="border-b text-sm">
                <th className="text-left py-3 font-semibold">Description</th>
                <th className="text-right py-3 font-semibold">Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-4">
                  <p className="font-semibold">{displayReservation.room?.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">Objet: {displayReservation.event_object}</p>
                  <p className="text-sm text-muted-foreground">
                    Du {format(new Date(displayReservation.start_time), "PPP", { locale: fr })} au{" "}
                    {format(new Date(displayReservation.end_time), "PPP", { locale: fr })}
                  </p>
                  {displayReservation.start_hour && displayReservation.end_hour && (
                    <p className="text-sm text-muted-foreground">
                      Horaires: {displayReservation.start_hour}h00 - {displayReservation.end_hour}h00
                    </p>
                  )}
                  {/* Half-day indicator */}
                  {displayReservation.is_half_day && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      Tarif demi-journée appliqué (-50%)
                    </p>
                  )}
                </td>
                <td className="text-right py-4">
                  {/* Show original and applied price if half-day */}
                  {displayReservation.is_half_day && displayReservation.room_price_original && (
                    <p className="text-sm text-muted-foreground line-through">
                      {displayReservation.room_price_original.toLocaleString("fr-FR")} FCFA
                    </p>
                  )}
                  <p className="font-semibold">
                    {(displayReservation.room_price_applied || (displayReservation.total_price - cateringTotal)).toLocaleString("fr-FR")} FCFA
                  </p>
                </td>
              </tr>

              {/* Catering items */}
              {cateringCosts.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-4">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} personne{item.quantity > 1 ? "s" : ""} × {item.unitPrice.toLocaleString("fr-FR")}{" "}
                      FCFA
                    </p>
                  </td>
                  <td className="text-right py-4 font-semibold">{item.total.toLocaleString("fr-FR")} FCFA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {reservation.notes && (
          <div className="mb-8 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold text-sm uppercase text-muted-foreground mb-2">Notes</h3>
            <p className="text-sm">{reservation.notes}</p>
          </div>
        )}

        {/* Total Section */}
        <div className="flex justify-end mb-8">
          <div className="w-96">
            {/* Calculated Total */}
            <div className="flex justify-between py-2 text-sm">
              <span className="text-muted-foreground">Sous-total calculé</span>
              <span className={displayReservation.admin_adjusted_price ? "line-through text-muted-foreground" : "font-semibold"}>
                {displayReservation.total_price.toLocaleString("fr-FR")} FCFA
              </span>
            </div>

            {/* Admin Adjusted Price Display */}
            {displayReservation.admin_adjusted_price !== null && displayReservation.admin_adjusted_price !== undefined && (
              <div className="py-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-amber-600 font-medium">Montant ajusté par l'admin</span>
                  <span className="font-semibold text-amber-600">
                    {displayReservation.admin_adjusted_price.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                {displayReservation.admin_price_note && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    Note: {displayReservation.admin_price_note}
                  </p>
                )}
              </div>
            )}

            {/* Final Total */}
            <div className="flex justify-between py-3 border-t-2 border-primary mt-2">
              <span className="text-xl font-bold">TOTAL À PAYER</span>
              <span className="text-xl font-bold text-primary">
                {(displayReservation.admin_adjusted_price ?? displayReservation.total_price).toLocaleString("fr-FR")} FCFA
              </span>
            </div>
          </div>
        </div>

        {/* Admin Price Adjustment Section */}
        {isAdmin && (
          <div className="no-print mb-8 p-4 border-2 border-dashed border-amber-300 rounded-lg bg-amber-50 dark:bg-amber-950/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-amber-700 dark:text-amber-400">
                Ajustement du prix (Admin)
              </h3>
              {!isEditingPrice && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingPrice(true)}
                  className="gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Modifier le montant
                </Button>
              )}
            </div>

            {isEditingPrice ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adjustedPrice">Nouveau montant total (FCFA)</Label>
                  <Input
                    id="adjustedPrice"
                    type="number"
                    min="0"
                    value={adjustedPrice}
                    onChange={(e) => setAdjustedPrice(e.target.value)}
                    placeholder="Entrez le nouveau montant"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceNote">Note explicative (optionnel)</Label>
                  <Textarea
                    id="priceNote"
                    value={priceNote}
                    onChange={(e) => setPriceNote(e.target.value)}
                    placeholder="Ex: Remise accordée suite à partenariat..."
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSavePrice}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    <Check className="h-4 w-4" />
                    {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingPrice(false)
                      setAdjustedPrice(displayReservation.admin_adjusted_price?.toString() || displayReservation.total_price.toString())
                      setPriceNote(displayReservation.admin_price_note || "")
                    }}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Annuler
                  </Button>
                  {displayReservation.admin_adjusted_price !== null && displayReservation.admin_adjusted_price !== undefined && (
                    <Button
                      variant="destructive"
                      onClick={handleResetPrice}
                      disabled={isSubmitting}
                      className="gap-2 ml-auto"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Réinitialiser
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {displayReservation.admin_adjusted_price !== null && displayReservation.admin_adjusted_price !== undefined
                  ? `Le montant a été ajusté de ${displayReservation.total_price.toLocaleString("fr-FR")} FCFA à ${displayReservation.admin_adjusted_price.toLocaleString("fr-FR")} FCFA`
                  : "Cliquez sur 'Modifier le montant' pour ajuster le prix final de cette facture."}
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="border-t pt-6 mt-8 text-center text-sm text-muted-foreground">
          <p>Merci pour votre confiance</p>
          <p className="mt-2">Fédération des Entreprises du Gabon - Location de salles professionnelles</p>
        </div>

        {/* Print button */}
        <div className="no-print flex justify-center mt-8">
          <Button onClick={handlePrint} size="lg" className="gap-2">
            <Printer className="h-5 w-5" />
            Imprimer la facture
          </Button>
        </div>
      </div>
    </div>
  )
}
