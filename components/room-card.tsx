import type { Room } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, MapPin, Wifi, Coffee, Award, Clock, Sparkles, ChevronRight, Maximize2, Sun } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getDirectImageUrl } from "@/lib/image-utils"

interface RoomCardProps {
  room: Room
}

// Mapping d'icônes pour les équipements courants
const amenityIcons: Record<string, React.ReactNode> = {
  "Wifi": <Wifi className="h-3 w-3" />,
  "Climatisation": <Sparkles className="h-3 w-3" />,
  "Parking": <MapPin className="h-3 w-3" />,
  "Café": <Coffee className="h-3 w-3" />,
  "Premium": <Award className="h-3 w-3" />,
  "Vue": <Sun className="h-3 w-3" />,
  "Espace": <Maximize2 className="h-3 w-3" />,
}

export function RoomCard({ room }: RoomCardProps) {
  const isReserved = room.reserved
  const isPremium = room.price_per_day > 500000 // Exemple de seuil pour les salles premium

  return (
    <Card className="group relative overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-500 bg-white h-full flex flex-col">
      {/* Image avec overlay minimal */}
      <div className="relative h-62 w-full overflow-hidden">
        <Image
          src={room.image_url ? getDirectImageUrl(room.image_url) : "/feg.png"}
          alt={room.name}
          fill
          className="object-cover px-3 rounded-lg  transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
        
        {/* Badges repositionnés */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isPremium && (
            <Badge className="bg-white/95 text-primary border-0 shadow-sm px-3 py-1.5 rounded-md text-xs font-medium tracking-wide flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5" />
              COLLECTION PRESTIGE
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-1 px-6">
        <div className="flex justify-between items-start ">
          <div>
            <CardTitle className="text-xl font-medium text-gray-900 mb-1.5">
              {room.name}
            </CardTitle>
            <CardDescription className="text-gray-500 text-sm leading-relaxed line-clamp-2">
              {room.description || "Espace soigneusement aménagé pour vos événements professionnels"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 flex-1 px-6">
        {/* Capacité et prix - Structure améliorée */}
        <div className="grid grid-cols-2 gap-4 py-2 border-t border-b border-gray-100">
          {/* Capacité */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-0.5">Capacité</span>
              <span className="block text-base font-medium text-gray-900">{room.capacity} <span className="text-xs font-normal text-gray-500">personnes</span></span>
            </div>
          </div>

          {/* Prix */}
          <div className="flex items-center gap-3 justify-end">
            <div className="text-right">
              <span className="block text-xs text-gray-500 mb-0.5">Tarif journalier</span>
              <span className="block text-xl font-light text-primary">
                {room.price_per_day.toLocaleString("fr-FR")}
                <span className="text-xs text-gray-400 ml-1 font-normal">FCFA</span>
              </span>
            </div>
          </div>
        </div>

        {/* Équipements - Structure améliorée */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-medium text-gray-400 mb-0.5 tracking-wider uppercase">Équipements et services</span>
            <div className="flex flex-wrap gap-2">
              {room.amenities.slice(0, 4).map((amenity) => (
                <div
                  key={amenity}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-md text-xs text-gray-600 border border-gray-100"
                >
                  {amenityIcons[amenity] || <Sparkles className="h-3 w-3 text-gray-400" />}
                  <span>{amenity}</span>
                </div>
              ))}
              {room.amenities.length > 4 && (
                <div className="px-3 py-1.5 bg-gray-50 rounded-md text-xs text-gray-500 border border-gray-100">
                  +{room.amenities.length - 4}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-1 pb-1 px-6">
        {isReserved ? (
          <Button 
            disabled 
            variant="outline"
            className="w-full h-11 border-gray-200 text-gray-400 font-normal cursor-not-allowed"
          >
            Salle actuellement réservée
          </Button>
        ) : (
          <Button 
            asChild 
            className="group/btn relative w-full h-12 bg-primary hover:bg-primary/90 text-white font-light tracking-wide overflow-hidden transition-all duration-300"
          >
            <Link href={`/rooms/${room.id}`} className="flex items-center justify-center gap-2">
              <span>RÉSERVER CET ESPACE</span>
              <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}