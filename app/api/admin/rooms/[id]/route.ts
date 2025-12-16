import { getSupabaseServerClient } from "@/lib/supabase-server"
import { isDatabaseInitialized } from "@/lib/db-helper"
import { NextResponse } from "next/server"

// GET a single room by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const dbReady = await isDatabaseInitialized()

    if (!dbReady) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 503 })
    }

    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase.from("rooms").select("*").eq("id", id).single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Salle non trouvée" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Request error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PUT (update) a room by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, capacity, price_per_day, image_url, amenities, available, reserved } = body

    // Validate required fields
    if (!name || !capacity || !price_per_day) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
    }

    const dbReady = await isDatabaseInitialized()

    if (!dbReady) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 503 })
    }

    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase
      .from("rooms")
      .update({
        name,
        description,
        capacity,
        price_per_day,
        image_url,
        amenities,
        available,
        reserved: reserved ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Erreur lors de la mise à jour de la salle" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Request error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE a room by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const dbReady = await isDatabaseInitialized()

    if (!dbReady) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 503 })
    }

    const supabase = await getSupabaseServerClient()

    // First, delete all reservations for this room
    await supabase.from("reservations").delete().eq("room_id", id)

    // Then delete the room
    const { error } = await supabase.from("rooms").delete().eq("id", id)

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Erreur lors de la suppression de la salle" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Request error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
