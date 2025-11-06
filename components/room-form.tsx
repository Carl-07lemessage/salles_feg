"use client"

import type React from "react"

import { useState, useRef } from "react"
import type { Room } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"

interface RoomFormProps {
  room?: Room
}

export function RoomForm({ room }: RoomFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>(room?.image_url || "")
  const [formData, setFormData] = useState({
    name: room?.name || "",
    description: room?.description || "",
    capacity: room?.capacity || 0,
    price_per_day: room?.price_per_day || 0,
    image_url: room?.image_url || "",
    available: room?.available ?? true,
    reserved: room?.reserved ?? false,
  })
  const [amenities, setAmenities] = useState<string[]>(room?.amenities || [])
  const [newAmenity, setNewAmenity] = useState("")

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      toast.error("Type de fichier non valide. Utilisez JPG, PNG, WebP ou GIF")
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("Le fichier est trop volumineux. Taille maximale: 5MB")
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setIsUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const response = await fetch("/api/upload-room-image", {
        method: "POST",
        body: uploadFormData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Échec du téléchargement")
      }

      const data = await response.json()
      setFormData({ ...formData, image_url: data.url })
      toast.success("Image téléchargée avec succès")
    } catch (error) {
      console.error("[v0] Upload error:", error)
      toast.error("Erreur lors du téléchargement de l'image")
      setImagePreview(formData.image_url)
    } finally {
      setIsUploading(false)
    }
  }

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()])
      setNewAmenity("")
    }
  }

  const handleRemoveAmenity = (amenity: string) => {
    setAmenities(amenities.filter((a) => a !== amenity))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.price_per_day > 99999999) {
      toast.error("Le prix par jour ne peut pas dépasser 99,999,999 FCFA")
      return
    }

    if (formData.price_per_day < 0) {
      toast.error("Le prix par jour doit être positif")
      return
    }

    setIsSubmitting(true)

    try {
      const url = room ? `/api/admin/rooms/${room.id}` : "/api/admin/rooms"
      const method = room ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amenities,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde")
      }

      toast.success(room ? "Salle mise à jour avec succès" : "Salle créée avec succès")
      router.push("/admin")
      router.refresh()
    } catch (error) {
      console.error("[v0] Form error:", error)
      toast.error("Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la salle *</Label>
            <Input
              id="name"
              placeholder="Ex: Salle de Conférence A"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Décrivez la salle et ses caractéristiques..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacité (personnes) *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                placeholder="Ex: 50"
                value={formData.capacity || ""}
                onChange={(e) => setFormData({ ...formData, capacity: Number.parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Prix par jour (FCFA) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                max="99999999"
                step="1"
                placeholder="Ex: 150000"
                value={formData.price_per_day || ""}
                onChange={(e) => setFormData({ ...formData, price_per_day: Number.parseFloat(e.target.value) || 0 })}
                required
              />
              <p className="text-xs text-muted-foreground">Maximum: 99,999,999 FCFA</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Image de la salle</Label>

            {/* Image preview */}
            {imagePreview && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border bg-muted">
                <Image
                  src={imagePreview || "/placeholder.svg"}
                  alt="Aperçu"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            {/* Upload button */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Téléchargement..." : "Télécharger une image"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* URL input as alternative */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm text-muted-foreground">
                Ou entrez une URL d'image
              </Label>
              <Input
                id="image"
                type="url"
                placeholder="https://example.com/image.jpg ou https://drive.google.com/file/d/..."
                value={formData.image_url}
                onChange={(e) => {
                  setFormData({ ...formData, image_url: e.target.value })
                  setImagePreview(e.target.value)
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Équipements</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: WiFi, Projecteur..."
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddAmenity()
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={handleAddAmenity}>
                Ajouter
              </Button>
            </div>
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {amenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="gap-1">
                    {amenity}
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(amenity)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="available">Disponibilité</Label>
              <p className="text-sm text-muted-foreground">La salle est-elle disponible à la réservation ?</p>
            </div>
            <Switch
              id="available"
              checked={formData.available}
              onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
            <div className="space-y-0.5">
              <Label htmlFor="reserved" className="font-semibold">
                Mise en réserve
              </Label>
              <p className="text-sm text-muted-foreground">
                Marquer cette salle comme réservée (indisponible temporairement)
              </p>
            </div>
            <Switch
              id="reserved"
              checked={formData.reserved}
              onCheckedChange={(checked) => setFormData({ ...formData, reserved: checked })}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting || isUploading}>
              {isSubmitting ? "Enregistrement..." : room ? "Mettre à jour" : "Créer la salle"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin")} disabled={isSubmitting}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
