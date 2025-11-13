"use server"

import { getSupabaseAdminClient } from "@/lib/supabase-admin"

export async function addAdminUser(userId: string, email: string, name?: string) {
  try {
    const supabase = getSupabaseAdminClient()

    const { data: existingUser } = await supabase.from("admin_users").select("id").eq("id", userId).maybeSingle()

    // If user already exists, return success (idempotent operation)
    if (existingUser) {
      console.log("Admin user already exists, skipping insert")
      return { success: true, alreadyExists: true }
    }

    const { data: existingEmail } = await supabase.from("admin_users").select("id").eq("email", email).maybeSingle()

    if (existingEmail) {
      console.log("Admin email already exists with different user ID")
      return { success: true, alreadyExists: true }
    }

    // Use service role client to bypass RLS
    const { error } = await supabase.from("admin_users").insert({
      id: userId,
      email: email,
      name: name || null,
    })

    if (error) {
      if (error.code === "23505") {
        console.log("Admin user already exists (duplicate key), treating as success")
        return { success: true, alreadyExists: true }
      }

      console.error("Error adding admin user:", error)
      return { success: false, error: error.message, alreadyExists: false }
    }

    return { success: true, alreadyExists: false }
  } catch (error) {
    console.error("Exception adding admin user:", error)
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: message || "Failed to add admin user", alreadyExists: false }
  }
}
