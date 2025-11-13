"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Building2, Calendar, LogOut, Menu, X, BookOpen } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase-client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut()
      toast.success("Déconnexion réussie")
      router.push("/admin/auth")
      router.refresh()
    } catch (error) {
      console.log("Supabase not connected, simulating logout")
      toast.success("Déconnexion réussie")
      router.push("/admin/auth")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const navItems = [
    {
      href: "/admin",
      label: "Salles",
      icon: Building2,
    },
    {
      href: "/admin/reservations",
      label: "Réservations",
      icon: Calendar,
    },
    {
      href: "/admin/guide",
      label: "Guide",
      icon: BookOpen,
    },
  ]

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/admin" className="flex items-center gap-2.5 font-semibold text-lg tracking-tight">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <span className="text-foreground">Gestion des Salles</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary relative py-1",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {isActive && <div className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-primary" />}
                </Link>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="ml-2 border-slate-300 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-slate-50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? "Déconnexion..." : "Déconnexion"}
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
