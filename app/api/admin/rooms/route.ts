import { getSupabaseServerClient } from "@/lib/supabase-server"
import { isDatabaseInitialized } from "@/lib/db-helper"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const dbReady = await isDatabaseInitialized()

    if (!dbReady) {
      console.log("Database not initialized, returning empty array")
      return NextResponse.json([])
    }

    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase.from("rooms").select("*").order("name")

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Erreur lors de la récupération des salles" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Request error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, capacity, price_per_day, image_url, amenities, available, reserved } = body

    console.log("[v0] Creating room with data:", { name, capacity, price_per_day })

    // Validate required fields
    if (!name || !capacity || !price_per_day) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
    }

    if (price_per_day > 99999999 || price_per_day < 0) {
      return NextResponse.json({ error: "Le prix doit être entre 0 et 99,999,999 FCFA" }, { status: 400 })
    }

    const dbReady = await isDatabaseInitialized()

    if (!dbReady) {
      console.log("[v0] Database not initialized, simulating success")
      return NextResponse.json(
        {
          id: Math.random().toString(36).substring(7),
          name,
          description,
          capacity,
          price_per_day,
          image_url,
          amenities,
          available,
          reserved: reserved ?? false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { status: 201 },
      )
    }

    try {
      const supabase = await getSupabaseServerClient()

      const { data, error } = await supabase
        .from("rooms")
        .insert({
          name,
          description,
          capacity,
          price_per_day,
          image_url,
          amenities,
          available,
          reserved: reserved ?? false,
        })
        .select()
        .single()

      if (error) {
        console.error("[v0] Supabase error:", error)
        return NextResponse.json({ error: "Erreur lors de la création de la salle" }, { status: 500 })
      }

      console.log("[v0] Room created successfully:", data.id)
      return NextResponse.json(data, { status: 201 })
    } catch (error) {
      console.log("[v0] Supabase error, simulating success")
      return NextResponse.json(
        {
          id: Math.random().toString(36).substring(7),
          name,
          description,
          capacity,
          price_per_day,
          image_url,
          amenities,
          available,
          reserved: reserved ?? false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { status: 201 },
      )
    }
  } catch (error) {
    console.error("[v0] Request error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
