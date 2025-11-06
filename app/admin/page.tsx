import { getSupabaseServerClient } from "@/lib/supabase-server"
import type { Room } from "@/lib/types"
import { RoomManagementTable } from "@/components/room-management-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

async function getRooms(): Promise<Room[]> {
  try {
    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase.from("rooms").select("*").order("created_at", { ascending: false })

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

export default async function AdminDashboardPage() {
  const rooms = await getRooms()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Salles</h1>
          <p className="text-muted-foreground mt-2">Gérez vos salles et leurs disponibilités</p>
        </div>
        <Button asChild>
          <Link href="/admin/rooms/new">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une salle
          </Link>
        </Button>
      </div>

      <RoomManagementTable rooms={rooms} />
    </div>
  )
}
