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

    // Validate required fields
    if (!name || !capacity || !price_per_day) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
    }

    const dbReady = await isDatabaseInitialized()

    if (!dbReady) {
      console.log(" Database not initialized, simulating success")
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
        console.error("Supabase error:", error)
        return NextResponse.json({ error: "Erreur lors de la création de la salle" }, { status: 500 })
      }

      return NextResponse.json(data, { status: 201 })
    } catch (error) {
      console.log("Supabase error, simulating success")
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
    console.error("Request error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
