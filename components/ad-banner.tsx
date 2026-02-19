"use client"

import { type Advertisement } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"
import { X, Sparkles } from "lucide-react"
import { useState, useEffect, memo, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface AdBannerProps {
  ad: Advertisement | null
  variant?: "horizontal" | "vertical" | "compact" | "card" | "sidebar"
  className?: string
  showCloseButton?: boolean
  priority?: "high" | "normal" | "low"
  onClose?: () => void
}

export const AdBanner = memo(function AdBanner({
  ad,
  variant = "horizontal",
  className = "",
  showCloseButton = true,
  priority = "normal",
  onClose,
}: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isClosing, setIsClosing] = useState(false)
  const [hasTrackedView, setHasTrackedView] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const trackView = useCallback(async () => {
    if (!ad || hasTrackedView) return
    try {
      await fetch(`/api/ads/${ad.id}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "view" }),
      })
      setHasTrackedView(true)
    } catch { }
  }, [ad, hasTrackedView])

  useEffect(() => {
    trackView()
  }, [trackView])

  const handleClick = useCallback(async () => {
    if (!ad) return
    try {
      await fetch(`/api/ads/${ad.id}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "click" }),
      })
    } catch { }
  }, [ad])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300)
  }

  if (!ad || !isVisible) return null

  const baseClasses = cn(
    "relative overflow-hidden rounded-xl border transition-all duration-300",
    "border-border/50 shadow-sm hover:shadow-xl",
    isClosing && "opacity-0 scale-95 translate-y-2",
    priority === "high" && "ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
  )

  const CloseButton = () =>
    showCloseButton && (
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 z-20 rounded-full bg-background/80 p-1.5 backdrop-blur border border-border/50 opacity-0 group-hover:opacity-100 transition"
        aria-label="Fermer la publicité"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    )

  /* ===========================
     ✅ CARD VARIANT (IMAGE ONLY)
     =========================== */
  if (variant === "card") {
    return (
      <Link
        href={ad.link_url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={cn(baseClasses, "group block aspect-[4/3]", className)}
      >
        {/* Image full background */}
        <div className="absolute inset-0 bg-muted">
          {!imageLoaded && !imageError && (
            <Skeleton className="absolute inset-0" />
          )}

          {!imageError && (
            <Image
              src={ad.image_url || "/placeholder.svg"}
              alt={ad.title}
              fill
              priority={priority === "high"}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={cn(
                "object-cover transition-transform duration-500",
                "group-hover:scale-105",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              sizes="(max-width: 768px) 100vw, 400px"
            />
          )}
        </div>

        {/* Overlay institutionnel */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Label sponsorisé */}
        <div className="absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
          <Sparkles className="h-3 w-3" />
          Sponsorisé
        </div>

        <CloseButton />
      </Link>
    )
  }

  /* ===========================
     AUTRES VARIANTS (inchangés)
     =========================== */

  return null
})
