"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface RoomFiltersProps {
  onFilterChange: (filters: FilterValues) => void
}

export interface FilterValues {
  search: string
  minCapacity: string
  maxPrice: string
  sortBy: string
}

export function RoomFilters({ onFilterChange }: RoomFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    minCapacity: "",
    maxPrice: "",
    sortBy: "name",
  })

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    const resetFilters: FilterValues = {
      search: "",
      minCapacity: "",
      maxPrice: "",
      sortBy: "name",
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <SlidersHorizontal className="h-5 w-5" />
            <span>Filtres</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search">Rechercher</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Nom de la salle..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacité minimale</Label>
            <Input
              id="capacity"
              type="number"
              placeholder="Ex: 10"
              value={filters.minCapacity}
              onChange={(e) => handleFilterChange("minCapacity", e.target.value)}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Prix maximum (fcfa/heure)</Label>
            <Input
              id="price"
              type="number"
              placeholder="Ex: 150"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort">Trier par</Label>
            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
              <SelectTrigger id="sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nom</SelectItem>
                <SelectItem value="price-asc">Prix croissant</SelectItem>
                <SelectItem value="price-desc">Prix décroissant</SelectItem>
                <SelectItem value="capacity-asc">Capacité croissante</SelectItem>
                <SelectItem value="capacity-desc">Capacité décroissante</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={handleReset} className="w-full bg-transparent">
            Réinitialiser les filtres
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
