"use client"

import { useState, useMemo } from "react"
import type { Room } from "@/lib/types"
import { RoomCard } from "@/components/room-card"
import { RoomFilters, type FilterValues } from "@/components/room-filters"

interface RoomListProps {
  initialRooms: Room[]
}

export function RoomList({ initialRooms }: RoomListProps) {
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    minCapacity: "",
    maxPrice: "",
    sortBy: "name",
  })

  const filteredAndSortedRooms = useMemo(() => {
    let filtered = [...initialRooms]

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (room) =>
          room.name.toLowerCase().includes(searchLower) || room.description?.toLowerCase().includes(searchLower),
      )
    }

    // Apply capacity filter
    if (filters.minCapacity) {
      const minCap = Number.parseInt(filters.minCapacity)
      filtered = filtered.filter((room) => room.capacity >= minCap)
    }

    // Apply price filter
    if (filters.maxPrice) {
      const maxPrice = Number.parseFloat(filters.maxPrice)
      filtered = filtered.filter((room) => room.price_per_day <= maxPrice)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "price-asc":
          return a.price_per_day - b.price_per_day
        case "price-desc":
          return b.price_per_day - a.price_per_day
        case "capacity-asc":
          return a.capacity - b.capacity
        case "capacity-desc":
          return b.capacity - a.capacity
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [initialRooms, filters])

  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-4">
      {/* Filters Sidebar */}
      <aside className="lg:sticky lg:top-4 h-fit">
        <RoomFilters onFilterChange={setFilters} />
      </aside>

      {/* Rooms Grid */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">
            {filteredAndSortedRooms.length}{" "}
            {filteredAndSortedRooms.length === 1 ? "salle disponible" : "salles disponibles"}
          </h2>
        </div>

        {filteredAndSortedRooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Aucune salle ne correspond à vos critères de recherche.</p>
            <p className="text-sm text-muted-foreground mt-2">Essayez de modifier vos filtres.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-1 xl:grid-cols-2 gap-5">
            {filteredAndSortedRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
