"use client"

import { type Reservation, CATERING_OPTIONS } from "@/lib/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import Image from "next/image"

interface InvoiceProps {
  reservation: Reservation
  invoiceNumber?: string
}

export function Invoice({ reservation, invoiceNumber }: InvoiceProps) {
  const handlePrint = () => {
    window.print()
  }

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
            <p className="text-sm text-muted-foreground">info@lafeg.ga</p>
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
                  <p className="font-semibold">{reservation.room?.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">Objet: {reservation.event_object}</p>
                  <p className="text-sm text-muted-foreground">
                    Du {format(new Date(reservation.start_time), "PPP", { locale: fr })} au{" "}
                    {format(new Date(reservation.end_time), "PPP", { locale: fr })}
                  </p>
                  {reservation.start_hour && reservation.end_hour && (
                    <p className="text-sm text-muted-foreground">
                      Horaires: {reservation.start_hour}h00 - {reservation.end_hour}h00
                    </p>
                  )}
                </td>
                <td className="text-right py-4 font-semibold">
                  {(reservation.total_price - cateringTotal).toLocaleString("fr-FR")} FCFA
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

        {/* Total */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="flex justify-between py-3 border-t-2 border-primary">
              <span className="text-xl font-bold">TOTAL</span>
              <span className="text-xl font-bold text-primary">
                {reservation.total_price.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
          </div>
        </div>

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
