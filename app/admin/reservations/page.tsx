import { getSupabaseServerClient } from "@/lib/supabase-server"
import type { Reservation } from "@/lib/types"
import { ReservationDashboard } from "@/components/reservation-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"

async function getReservations(): Promise<Reservation[]> {
  try {
    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase
      .from("reservations")
      .select(
        `
        *,
        room:rooms(*)
      `,
      )
      .order("start_time", { ascending: true })

    if (error) {
      console.error("[v0] Erreur Supabase:", error.message)
      return []
    }

    return data || []
  } catch (error: any) {
    console.error("[v0] Erreur de connexion:", error?.message || "Erreur inconnue")
    return []
  }
}

export default async function ReservationsPage() {
  const reservations = await getReservations()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gestion des Réservations</h1>
        <p className="text-muted-foreground mt-2">Visualisez et gérez toutes les réservations</p>
      </div>

      <div className="mb-4">
        <Link href="/admin/reservations/create">
          <Button variant="default">Créer une Réservation</Button>
        </Link>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar">Vue Calendrier</TabsTrigger>
          <TabsTrigger value="list">Vue Liste</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <ReservationDashboard reservations={reservations} view="calendar" />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <ReservationDashboard reservations={reservations} view="list" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
