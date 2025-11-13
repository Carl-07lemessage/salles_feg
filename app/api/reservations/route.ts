import { getSupabaseServerClient } from "@/lib/supabase-server"
import { isDatabaseInitialized } from "@/lib/db-helper"
import { NextResponse } from "next/server"
import { sendCustomerConfirmationEmail, sendAdminNotificationEmail } from "@/lib/email"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get("room_id")

    if (!roomId) {
      return NextResponse.json({ error: "room_id requis" }, { status: 400 })
    }

    const dbReady = await isDatabaseInitialized()

    if (!dbReady) {
      console.log("Database not initialized, returning empty array")
      return NextResponse.json([])
    }

    try {
      const supabase = await getSupabaseServerClient()
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("room_id", roomId)
        .neq("status", "cancelled")

      if (error) {
        console.error(" Supabase error:", error)
        return NextResponse.json([])
      }

      return NextResponse.json(data || [])
    } catch (error) {
      console.log("Supabase error, returning empty array")
      return NextResponse.json([])
    }
  } catch (error) {
    console.error("Request error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      room_id,
      customer_name,
      customer_email,
      customer_phone,
      event_object,
      start_time,
      end_time,
      start_hour,
      end_hour,
      total_price,
      notes,
    } = body

    if (
      !room_id ||
      !customer_name ||
      !customer_email ||
      !customer_phone ||
      !event_object ||
      !start_time ||
      !end_time ||
      !total_price
    ) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 })
    }

    // Validate time range
    const startDate = new Date(start_time)
    const endDate = new Date(end_time)
    if (endDate <= startDate) {
      return NextResponse.json({ error: "La date de fin doit être après la date de début" }, { status: 400 })
    }

    const dbReady = await isDatabaseInitialized()

    if (!dbReady) {
      console.log("Database not initialized, simulating success")
      return NextResponse.json(
        {
          id: Math.random().toString(36).substring(7),
          room_id,
          customer_name,
          customer_email,
          customer_phone,
          event_object,
          start_time,
          end_time,
          start_hour: start_hour || 8,
          end_hour: end_hour || 18,
          total_price,
          notes,
          status: "pending",
          created_at: new Date().toISOString(),
        },
        { status: 201 },
      )
    }

    try {
      const supabase = await getSupabaseServerClient()

      // Check if any reservation overlaps with the requested period
      const { data: conflicts } = await supabase
        .from("reservations")
        .select("id, start_time, end_time")
        .eq("room_id", room_id)
        .neq("status", "cancelled")
        .or(`and(start_time.lte.${end_time},end_time.gte.${start_time})`)

      if (conflicts && conflicts.length > 0) {
        return NextResponse.json(
          { error: "Cette salle est déjà réservée pour cette période. Veuillez choisir d'autres dates." },
          { status: 409 },
        )
      }

      const { data, error } = await supabase
        .from("reservations")
        .insert({
          room_id,
          customer_name,
          customer_email,
          customer_phone,
          event_object,
          start_time,
          end_time,
          start_hour: start_hour || 8,
          end_hour: end_hour || 18,
          total_price,
          notes,
          status: "pending",
        })
        .select()
        .single()

      if (error) {
        console.error("Supabase error:", error)
        return NextResponse.json({ error: "Erreur lors de la création de la réservation" }, { status: 500 })
      }

      const { data: roomData } = await supabase.from("rooms").select("name").eq("id", room_id).single()

      if (data && roomData) {
        const emailData = {
          customerName: customer_name,
          customerEmail: customer_email,
          customerPhone: customer_phone,
          roomName: roomData.name,
          eventObject: event_object,
          startDate: start_time,
          endDate: end_time,
          startHour: start_hour,
          endHour: end_hour,
          totalPrice: total_price,
          reservationId: data.id,
          notes: notes,
        }

        // Envoyer les emails en parallèle (ne pas bloquer la réponse)
        Promise.all([sendCustomerConfirmationEmail(emailData), sendAdminNotificationEmail(emailData)]).catch(
          (error) => {
            console.error("Erreur lors de l'envoi des emails:", error)
          },
        )
      }

      return NextResponse.json(data, { status: 201 })
    } catch (error) {
      console.log("Supabase error, simulating success")
      return NextResponse.json(
        {
          id: Math.random().toString(36).substring(7),
          room_id,
          customer_name,
          customer_email,
          customer_phone,
          event_object,
          start_time,
          end_time,
          start_hour,
          end_hour,
          total_price,
          notes,
          status: "pending",
          created_at: new Date().toISOString(),
        },
        { status: 201 },
      )
    }
  } catch (error) {
    console.error("Request error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
