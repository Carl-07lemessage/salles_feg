import { getSupabaseServerClient } from "@/lib/supabase-server"
import type { Room } from "@/lib/types"
import { notFound } from "next/navigation"
import { BookingForm } from "@/components/booking-form"
import { Card, CardContent } from "@/components/ui/card"
import { Users, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getDirectImageUrl } from "@/lib/image-utils"

async function getRoom(id: string): Promise<Room | null> {
  try {
    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase.from("rooms").select("*").eq("id", id).single()

    if (error) {
      console.error("] Erreur Supabase:", error.message)
      return null
    }

    return data
  } catch (error: any) {
    console.error("Erreur de connexion:", error?.message || "Erreur inconnue")
    return null
  }
}

export default async function RoomDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params

  if (!id) {
    notFound()
  }
  const room = await getRoom(id)

  if (!room) {
    notFound()
  }

  // Ensure Image src is always a string and avoid passing `null` to getDirectImageUrl
  const imageSrc = room.image_url ? (getDirectImageUrl(room.image_url) ?? "/feg.png") : "/feg.png"

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image src="/logo-feg.png" alt="FEG Logo" width={180} height={48} className="h-12 w-auto" priority />
            </Link>
            <Button variant="ghost" asChild className="font-semibold">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid lg:grid-cols-[1fr_440px] gap-10 lg:gap-16">
          {/* Left Column - Room Details */}
          <div className="space-y-10">
            <div className="relative h-[420px] md:h-[540px] w-full rounded-2xl overflow-hidden bg-muted shadow-xl">
              <Image
                src={imageSrc}
                alt={room.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            </div>

            <div className="space-y-5">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance leading-tight">{room.name}</h1>
              <p className="text-xl text-muted-foreground leading-relaxed font-light">{room.description}</p>
            </div>

            <Card className="border-border/50 shadow-lg">
              <CardContent className="pt-8 pb-8">
                <h2 className="text-2xl font-semibold mb-8 tracking-tight">Caractéristiques principales</h2>
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                        Capacité
                      </p>
                      <p className="font-bold text-2xl text-foreground">{room.capacity} personnes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-3xl font-bold text-primary">₣</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                        Tarif journalier
                      </p>
                      <p className="font-bold text-2xl text-foreground">
                        {room.price_per_day.toLocaleString("fr-FR")}{" "}
                        <span className="text-lg font-normal text-muted-foreground">FCFA</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {room.amenities && room.amenities.length > 0 && (
              <Card className="border-border/50 shadow-lg">
                <CardContent className="pt-8 pb-8">
                  <h2 className="text-2xl font-semibold mb-8 tracking-tight">Équipements disponibles</h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    {room.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-4 group">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium text-base">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:sticky lg:top-28 h-fit">
            <BookingForm room={room} />
          </div>
        </div>
      </div>
    </div>
  )
}
