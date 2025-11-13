import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  console.log("Creating Supabase client with URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("Anon key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
