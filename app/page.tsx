import { getSupabaseServerClient } from "@/lib/supabase-server"
import type { Room, Advertisement } from "@/lib/types"
import { RoomList } from "@/components/room-list"
import { AdBanner } from "@/components/ad-banner"
import { Building2 } from "lucide-react"
import Image from "next/image"

// Ads feature flag - set to true after creating the advertisements table
const ADS_ENABLED = true

async function getAds(position: string): Promise<Advertisement[]> {
  // Return empty array if ads are disabled or table doesn't exist yet
  if (!ADS_ENABLED) return []
  
  try {
    const supabase = await getSupabaseServerClient()
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from("advertisements")
      .select("*")
      .eq("position", position)
      .eq("is_active", true)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) return []
    return data || []
  } catch {
    return []
  }
}

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
      console.error("Erreur Supabase:", error)
      return []
    }

    return data || []
  } catch (error: any) {
    console.error("Erreur de connexion:", error)
    return []
  }
}

export default async function HomePage() {
  const [rooms, topAds, bottomAds] = await Promise.all([
    getRooms(),
    getAds("homepage_top"),
    getAds("homepage_bottom"),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/20 to-white">
      {/* Top Ad Banner */}
      {topAds.length > 0 && (
        <div className="container mx-auto px-4 pt-4">
          <AdBanner ad={topAds[0]} variant="horizontal" priority="high" />
        </div>
      )}

      <section className="relative overflow-hidden">
        {/*Image d’arrière-plan*/}
        <img
          src="/logo-feg.png"
          alt="FEG Logo"
          className="absolute inset-0 w-full h-full mt-4 object-contain opacity-10 pointer-events-none"
        />

        {/* Contenu principal */}
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-[10px] border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
              <Building2 className="h-4 w-4" />
              <span>Fédération des Entreprises du Gabon</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-tight text-primary">
              Location de Salles Professionnelles
            </h1>
            <p className="text-lg md:text-xl text-foreground/70 max-w-2xl text-balance leading-relaxed">
              Découvrez nos espaces modernes et parfaitement équipés, conçus pour répondre à tous vos besoins
              professionnels. Réservation simple et sécurisée.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 md:py-20">
        <RoomList initialRooms={rooms} />
      </section>

      {/* Bottom Ad Banner */}
      {bottomAds.length > 0 && (
        <div className="container mx-auto px-4 pb-8">
          <AdBanner ad={bottomAds[0]} variant="horizontal" />
        </div>
      )}

      <footer className="border-t border-border/50 bg-muted/30 mt-20">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Image src="/logo-feg.png" alt="FEG Logo" width={120} height={32} className="h-8 w-auto" />
              <span className="text-sm text-muted-foreground font-medium">© 2025 FEG. Tous droits réservés.</span>
            </div>
            <div className="flex items-center gap-8 text-sm"></div>
          </div>
        </div>
      </footer>
    </div>
  )
}