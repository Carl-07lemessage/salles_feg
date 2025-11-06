import { getSupabaseServerClient } from "@/lib/supabase-server"
import type { Room } from "@/lib/types"
import { RoomList } from "@/components/room-list"
import { Building2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

async function getRooms(): Promise<Room[]> {
  try {
    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("available", true)
      .eq("reserved", false)
      .order("name")

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

export default async function HomePage() {
  const rooms = await getRooms()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image src="/logo-feg.png" alt="FEG Logo" width={180} height={48} className="h-12 w-auto" priority />
            </Link>
            <Button
              asChild
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10 bg-transparent font-semibold"
            >
              <Link href="/admin/auth">Espace Administrateur</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="border-b border-border/30 bg-gradient-to-b from-accent/10 via-accent/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,140,100,0.05),transparent_50%)]" />
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary shadow-sm">
              <Building2 className="h-4 w-4" />
              <span>Fédération des Entreprises du Gabon</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.1] text-foreground">
              Location de Salles
              <span className="block text-primary mt-2">Professionnelles</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl text-balance leading-relaxed font-light">
              Découvrez nos espaces modernes et parfaitement équipés, conçus pour répondre à tous vos besoins
              professionnels. Réservation simple et sécurisée.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:py-20">
        <RoomList initialRooms={rooms} />
      </section>

      <footer className="border-t border-border/50 bg-muted/30 mt-20">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Image src="/logo-feg.png" alt="FEG Logo" width={120} height={32} className="h-8 w-auto" />
              <span className="text-sm text-muted-foreground font-medium">© 2025 FEG. Tous droits réservés.</span>
            </div>
            <div className="flex items-center gap-8 text-sm">
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
