import { getSupabaseServerClient } from "@/lib/supabase-server"
import type { Room } from "@/lib/types"
import { RoomForm } from "@/components/room-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

async function getRoom(id: string): Promise<Room | null> {
  try {
    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase.from("rooms").select("*").eq("id", id).single()

    if (error) {
      console.error("[v0] Erreur Supabase:", error.message)
      return null
    }

    return data
  } catch (error: any) {
    console.error("[v0] Erreur de connexion:", error?.message || "Erreur inconnue")
    return null
  }
}

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const room = await getRoom(id)

  if (!room) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/admin">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux salles
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Modifier la salle</h1>
        <p className="text-muted-foreground mt-2">Mettez à jour les informations de la salle</p>
      </div>

      <RoomForm room={room} />
    </div>
  )
}
