import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { getSupabaseAdminClient } from "@/lib/supabase-admin"

// GET - Fetch ads (public: active ads only, admin: all ads)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const position = searchParams.get("position")
  const all = searchParams.get("all") === "true"

  try {
    const supabase = await getSupabaseServerClient()

    let query = supabase.from("advertisements").select("*")

    if (!all) {
      // Public request - only active ads within date range
      query = query
        .eq("is_active", true)
        .or("start_date.is.null,start_date.lte.now()")
        .or("end_date.is.null,end_date.gte.now()")
    }

    if (position) {
      query = query.eq("position", position)
    }

    query = query.order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error("Error fetching ads:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter by date on server side for more accuracy
    const now = new Date()
    const filteredData = all ? data : data?.filter((ad) => {
      const startOk = !ad.start_date || new Date(ad.start_date) <= now
      const endOk = !ad.end_date || new Date(ad.end_date) >= now
      return startOk && endOk
    })

    return NextResponse.json(filteredData || [])
  } catch (error: any) {
    console.error("Ads fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 })
  }
}

// POST - Create new ad (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, image_url, link_url, link_text, position, is_active, start_date, end_date } = body

    if (!title || !position) {
      return NextResponse.json({ error: "Title and position are required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    const { data, error } = await supabase
      .from("advertisements")
      .insert({
        title,
        description: description || null,
        image_url: image_url || null,
        link_url: link_url || null,
        link_text: link_text || "En savoir plus",
        position,
        is_active: is_active ?? true,
        start_date: start_date || null,
        end_date: end_date || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating ad:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Ad creation error:", error)
    return NextResponse.json({ error: "Failed to create ad" }, { status: 500 })
  }
}
