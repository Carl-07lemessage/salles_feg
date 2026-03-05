import { getSupabaseStatic } from "@/lib/proxy"
import type { Room, Advertisement } from "@/lib/types"
import { RoomList } from "@/components/room-list"
import { AdBanner } from "@/components/ad-banner"
import { 
  Building2, 
  CalendarDays, 
  Sparkles, 
  Shield, 
  Clock,
  ChevronRight,
  Award,
  Gem,
  Star,
  MapPin,
  Phone,
  Mail,
  Users,
  Crown,
  Infinity,
  TrendingUp,
  Coffee,
  Wifi,
  Zap
} from "lucide-react"
import Image from "next/image"
import { Metadata } from "next"
import Link from "next/link"


// Ads feature flag
const ADS_ENABLED = true

export const revalidate = 3600

async function getAds(position: string): Promise<Advertisement[]> {
  if (!ADS_ENABLED) return []
  try {
    const supabase = getSupabaseStatic()
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
    const supabase = getSupabaseStatic()
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

async function getStats() {
  try {
    const supabase = getSupabaseStatic()
    const { count: totalRooms } = await supabase
      .from("rooms")
      .select("*", { count: "exact", head: true })
    
    const { count: availableRooms } = await supabase
      .from("rooms")
      .select("*", { count: "exact", head: true })
      .eq("available", true)
      .eq("reserved", false)

    return {
      totalRooms: totalRooms || 0,
      availableRooms: availableRooms || 0,
    }
  } catch {
    return {
      totalRooms: 0,
      availableRooms: 0,
    }
  }
}

export default async function HomePage() {
  const [rooms, topAds, bottomAds, stats] = await Promise.all([
    getRooms(),
    getAds("homepage_top"),
    getAds("homepage_bottom"),
    getStats(),
  ])

  // Liste des logos d'entreprises
  const companyLogos = [
    { name: "FEG", logo: "/logo-feg.png" },
    { name: "TotalEnergies", logo: "/TotalEnergies.jpg" },
    { name: "LEADS GLOBAL", logo: "/leads.svg" },
    { name: "BGFI Gabon", logo: "/bgfi.jpg" },
    { name: "ACK HOLDING", logo: "/mika.webp" },
    { name: "AGL", logo: "/agl.jpg" },
    { name: "ERAMET", logo: "/eramet.jpg" },
    { name: "SOGAFRIC", logo: "/sogafric.jpg" },
    { name: "CECA-GADIS", logo: "/ceca.png" }, 
    { name: "Trans Form", logo: "/transform-gabon.png" },  
  ]


  return (
    <div className="min-h-screen bg-white">
      {/* TOP AD BANNER avec animation */}
      {topAds.length > 0 && (
        <div className="container mx-auto px-6 pt-24 animate-fade-in-down">
          <AdBanner ad={topAds[0]} variant="horizontal" priority="high" />
        </div>
      )}

<section className="relative min-h-[30%] md:min-h-[60%] lg:min-h-[60%] flex items-center justify-center overflow-hidden">
  {/* Image d'arrière-plan */}
  <div className="absolute inset-0 z-0">
    <Image
      src="/section.png"
      alt="Salle prestige"
      fill
      className="object-cover optional:0"
      priority
      quality={100}
    />
    {/* Overlay sophistiqué avec les nouvelles couleurs */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#063d21]/90 via-[#063d21]/70 to-[#063d21]/90" />
    
    {/* Motif de fond subtil */}
    <div className="absolute inset-0 opacity-10" 
         style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z' fill='%23afaf79' fill-opacity='0.2'/%3E%3C/svg%3E\")" }} />
  </div>

  {/* Contenu */}
  <div className="relative z-10 container mx-auto px-4 sm:px-6 py-20 md:py-24 lg:py-32">
    <div className="max-w-4xl mx-auto text-center">
      {/* Badge prestige avec les nouvelles couleurs */}
      <div className="inline-flex flex-col items-center gap sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-md 
          bg-white/10 backdrop-blur-md border border-[#afaf79]/30 mb-6 sm:mb-8 
          animate-fade-in-down hover:bg-white/15 transition-all duration-300">
        <div className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full">
          <Image src="/logo_blanc.png" alt="logo" width={40} height={40} />
        </div>
        <span className="text-xs sm:text-sm font-medium text-white tracking-wide">
          FÉDÉRATION DES ENTREPRISES DU GABON
        </span>
      </div>

      {/* Élément décoratif manquant - Ligne dorée */}
      <div className="flex justify-center items-center gap-2 mb-4 animate-fade-in-up">
        <div className="w-12 h-px bg-[#afaf79]/50" />
        <span className="text-[#afaf79] text-xs tracking-[0.3em] uppercase">Depuis 1959</span>
        <div className="w-12 h-px bg-[#afaf79]/50" />
      </div>

      {/* Titre principal */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-white mb-4 sm:mb-6 animate-fade-in-up">
        <span className="block font-serif italic text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 
            bg-gradient-to-r from-[#afaf79] via-[#afaf79] to-[#afaf79] bg-clip-text text-transparent mb-2
            drop-shadow-2xl">
          Location des Salles
        </span>
        <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white/90 font-light">
          Professionnelles
        </span>
      </h1>

      {/* Description */}
      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 font-light max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed animate-fade-in-up animation-delay-200 px-4">
        Des espaces d'exception où le raffinement rencontre la fonctionnalité, 
        pour des moments professionnels inoubliables.
      </p>
    </div>
  </div>

  {/* Effet de lumière mobile */}
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full lg:hidden bg-[radial-gradient(circle,_#afaf79_0%,_transparent_70%)] opacity-10 pointer-events-none" />
</section>

      {/* MARQUES DE CONFIANCE - SCROLL INFINI AMÉLIORÉ */}
      <section className="py-10 bg-gradient-to-r from-gray-50 to-gray-50 overflow-hidden">
        <div className="container mx-auto px-6 mb-8">
          <div className="text-center">
            <span className="text-sm font-medium text-primary tracking-wider uppercase animate-pulse">Ils nous font confiance</span>
            <h2 className="text-2xl md:text-3xl font-light text-gray-900 mt-2">
              Plus de <span className="font-serif italic text-primary">1000 entreprises</span> membres
            </h2>
          </div>
        </div>

        <div className="relative flex overflow-hidden w-full group">
          <div className="animate-marquee flex items-center gap-10 py-4">
            {[...companyLogos, ...companyLogos, ...companyLogos].map((company, index) => (
              <div
                key={index}
                className="inline-flex flex-col items-center justify-center group/logo min-w-[120px] transform hover:scale-110 transition-all duration-300"
              >
                <div className="w-24 h-24 rounded-full bg-white shadow-sm border border-primary flex items-center justify-center p-4 
                    group-hover/logo:shadow-xl group-hover/logo:border-primary/30 transition-all duration-300
                    hover:rotate-3">
                  <div className="relative w-20 h-20">
                    <Image
                      src={company.logo}
                      alt={company.name}
                      fill
                      className="object-contain "
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400 mt-2 group-hover/logo:text-primary transition-colors">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Badge de confiance animé */}
        <div className="container mx-auto px-6 mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-lg 
              hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default
              border border-gray-100">
            <Infinity className="h-4 w-4 text-primary" />
            <span>Des entreprises de renom nous font confiance depuis <strong className="text-primary">1959</strong></span>
          </div>
        </div>
      </section>
      
      {/* ROOMS SECTION AVEC ANIMATION */}
      <section id="salles" className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="relative container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary text-sm font-medium tracking-wider uppercase animate-pulse">Collection Prestige</span>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mt-4 mb-6">
              Nos salles <span className="font-serif italic text-primary">d'exception</span>
            </h2>
            <p className="text-gray-500">
              Chaque espace a été conçu pour offrir une expérience unique, 
              alliant luxe discret et fonctionnalité moderne.
            </p>
          </div>
          
          <div className="animate-fade-in">
            <RoomList initialRooms={rooms} />
          </div>
        </div>
      </section>

      {/* BOTTOM AD BANNER avec animation */}
      {bottomAds.length > 0 && (
        <div className="container mx-auto px-6 py-20 animate-fade-in-up">
          <AdBanner ad={bottomAds[0]} variant="horizontal" />
        </div>
      )}
    </div>
  )
}