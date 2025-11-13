"use client"

import type { Room } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface RoomManagementTableProps {
  rooms: Room[]
}

export function RoomManagementTable({ rooms }: RoomManagementTableProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (room: Room) => {
    setRoomToDelete(room)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!roomToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/rooms/${roomToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression")
      }

      toast.success("Salle supprimée avec succès")
      router.refresh()
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Erreur lors de la suppression")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setRoomToDelete(null)
    }
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/50">
        <p className="text-lg text-muted-foreground">Aucune salle disponible</p>
        <p className="text-sm text-muted-foreground mt-2">Commencez par ajouter votre première salle</p>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Capacité</TableHead>
              <TableHead>Prix/jour</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell className="font-medium">{room.name}</TableCell>
                <TableCell>{room.capacity} personnes</TableCell>
                <TableCell>{room.price_per_day.toLocaleString()} FCFA</TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    {room.reserved ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        En réserve
                      </Badge>
                    ) : room.available ? (
                      <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        Disponible
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Indisponible</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/rooms/${room.id}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/rooms/${room.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(room)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la salle "{roomToDelete?.name}" ? Cette action est irréversible et
              supprimera également toutes les réservations associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive">
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
