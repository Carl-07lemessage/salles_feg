import { RoomForm } from "@/components/room-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewRoomPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/admin">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux salles
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Ajouter une nouvelle salle</h1>
        <p className="text-muted-foreground mt-2">Remplissez les informations de la salle</p>
      </div>

      <RoomForm />
    </div>
  )
}
