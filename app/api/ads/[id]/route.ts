import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

// GET - Fetch single ad
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const supabase = getSupabaseAdminClient()

    const { data, error } = await supabase
      .from("advertisements")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch ad" }, { status: 500 })
  }
}

// PUT - Update ad
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { title, description, image_url, link_url, link_text, position, is_active, start_date, end_date } = body

    const supabase = getSupabaseAdminClient()

    const { data, error } = await supabase
      .from("advertisements")
      .update({
        title,
        description: description || null,
        image_url: image_url || null,
        link_url: link_url || null,
        link_text: link_text || "En savoir plus",
        position,
        is_active,
        start_date: start_date || null,
        end_date: end_date || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating ad:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update ad" }, { status: 500 })
  }
}

// DELETE - Delete ad
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const supabase = getSupabaseAdminClient()

    const { error } = await supabase
      .from("advertisements")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("[v0] Error deleting ad:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete ad" }, { status: 500 })
  }
}

// PATCH - Toggle ad status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { is_active } = body

    const supabase = getSupabaseAdminClient()

    const { data, error } = await supabase
      .from("advertisements")
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to toggle ad status" }, { status: 500 })
  }
}
