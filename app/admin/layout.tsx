import type React from "react"
import { AdminNav } from "@/components/admin-nav"

export const dynamic = "force-dynamic"


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main>{children}</main>
    </div>
  )
}
