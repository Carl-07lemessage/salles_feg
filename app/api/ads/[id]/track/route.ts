import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

// POST - Track ad view or click
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { type } = body // "view" or "click"

    if (!type || !["view", "click"].includes(type)) {
      return NextResponse.json({ error: "Invalid tracking type" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // First get current counts
    const { data: currentAd, error: fetchError } = await supabase
      .from("advertisements")
      .select("view_count, click_count")
      .eq("id", id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 })
    }

    // Update the appropriate counter
    const updateData = type === "view"
      ? { view_count: (currentAd.view_count || 0) + 1 }
      : { click_count: (currentAd.click_count || 0) + 1 }

    const { error } = await supabase
      .from("advertisements")
      .update(updateData)
      .eq("id", id)

    if (error) {
      console.error("[v0] Error tracking ad:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to track ad" }, { status: 500 })
  }
}
