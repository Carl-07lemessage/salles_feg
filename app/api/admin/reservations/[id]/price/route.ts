import { getSupabaseServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { admin_adjusted_price, admin_price_note } = body

    if (admin_adjusted_price === undefined || admin_adjusted_price === null) {
      return NextResponse.json(
        { error: "Le prix ajusté est requis" },
        { status: 400 }
      )
    }

    if (admin_adjusted_price < 0) {
      return NextResponse.json(
        { error: "Le prix ne peut pas être négatif" },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase
      .from("reservations")
      .update({
        admin_adjusted_price,
        admin_price_note: admin_price_note || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour du prix" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Request error:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// Reset admin adjusted price
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase
      .from("reservations")
      .update({
        admin_adjusted_price: null,
        admin_price_note: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Erreur lors de la réinitialisation du prix" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Request error:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
