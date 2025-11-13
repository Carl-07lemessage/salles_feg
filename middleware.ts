import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
          },
        },
      },
    )

    // Refresh session if expired
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.startsWith("/admin/auth")) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = "/admin/auth"
        return NextResponse.redirect(url)
      }

      const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            },
          },
        },
      )

      const { data: adminUser, error } = await supabaseAdmin.from("admin_users").select("id").eq("id", user.id).single()

      if (error || !adminUser) {
        console.log(" User is not an admin, redirecting to auth page")
        const url = request.nextUrl.clone()
        url.pathname = "/admin/auth"
        return NextResponse.redirect(url)
      }
    }

    // Redirect authenticated users away from login page
    if (request.nextUrl.pathname === "/admin/auth" && user) {
      const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            },
          },
        },
      )

      const { data: adminUser } = await supabaseAdmin.from("admin_users").select("id").eq("id", user.id).single()

      if (adminUser) {
        const url = request.nextUrl.clone()
        url.pathname = "/admin"
        return NextResponse.redirect(url)
      }
    }
  } catch (error) {
    console.log("Middleware error:", error)
    // Allow access when there's an error for development
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/upload-room-image (allow uploads without middleware auth check)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/upload-room-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
