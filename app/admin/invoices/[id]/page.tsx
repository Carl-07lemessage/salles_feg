import { getSupabaseServerClient } from "@/lib/supabase-server"
import { Invoice } from "@/components/invoice"
import { notFound } from "next/navigation"
import type { Reservation } from "@/lib/types"

export default async function InvoicePage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    notFound()
  }

  const supabase = await getSupabaseServerClient()

  const { data: reservation, error } = await supabase
    .from("reservations")
    .select(`
      *,
      room:rooms(*)
    `)
    .eq("id", id)
    .single()

  if (error || !reservation) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Invoice reservation={reservation as Reservation} isAdmin={true} />
    </div>
  )
}
