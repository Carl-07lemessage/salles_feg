import type { Room } from "@/lib/types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getDirectImageUrl } from "@/lib/image-utils"

interface RoomCardProps {
  room: Room
}

export function RoomCard({ room }: RoomCardProps) {
  const isReserved = room.reserved

  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-border/50 bg-card h-full flex flex-col">
      <div className="relative h-64 w-full bg-muted overflow-hidden">
        <Image
          src={room.image_url ? getDirectImageUrl(room.image_url) : "/feg.png"}
          alt={room.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {isReserved && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-amber-500 text-white border-0 shadow-lg font-semibold px-3 py-1.5">En réserve</Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3 pt-5">
        <CardTitle className="text-xl font-semibold tracking-tight text-balance leading-tight">{room.name}</CardTitle>
        <CardDescription className="line-clamp-2 text-base leading-relaxed mt-2">
          {room.description || "Aucune description disponible"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium text-sm">{room.capacity} pers.</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{room.price_per_day.toLocaleString("fr-FR")}</div>
            <div className="text-xs text-muted-foreground font-medium">FCFA / jour</div>
          </div>
        </div>

        {room.amenities && room.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {room.amenities.slice(0, 3).map((amenity) => (
              <Badge
                key={amenity}
                variant="secondary"
                className="text-xs font-medium bg-accent/50 text-accent-foreground border-0 px-3 py-1"
              >
                {amenity}
              </Badge>
            ))}
            {room.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs border-border/50 px-3 py-1">
                +{room.amenities.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 pb-5">
        {isReserved ? (
          <Button disabled className="w-full h-11 font-semibold text-base" variant="secondary">
            Salle en réserve
          </Button>
        ) : (
          <Button asChild className="w-full h-11 font-semibold text-base shadow-sm hover:shadow-md transition-shadow">
            <Link href={`/rooms/${room.id}`}>Réserver</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
