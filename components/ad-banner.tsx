"use client"

import { type Advertisement } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"
import { X, ExternalLink, Sparkles } from "lucide-react"
import { useState, useEffect, memo, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

interface AdBannerProps {
  ad: Advertisement | null
  variant?: "horizontal" | "vertical" | "compact" | "card" | "sidebar"
  className?: string
  showCloseButton?: boolean
  priority?: "high" | "normal" | "low"
  onClose?: () => void
}

// Skeleton loader component
export function AdBannerSkeleton({ variant = "horizontal" }: { variant?: AdBannerProps["variant"] }) {
  if (variant === "vertical" || variant === "sidebar") {
    return (
      <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-4 animate-pulse">
        <Skeleton className="h-3 w-16 mx-auto" />
        <Skeleton className="w-full h-36 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3 mx-auto" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div className="rounded-lg border border-border/50 bg-muted/20 p-3 flex items-center gap-3 animate-pulse">
        <Skeleton className="w-12 h-12 rounded-md shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-2 w-12" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="h-6 w-10 rounded" />
      </div>
    )
  }

  if (variant === "card") {
    return (
      <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden animate-pulse">
        <Skeleton className="w-full h-40" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    )
  }

  // Horizontal skeleton
  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 p-4 sm:p-6 animate-pulse">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Skeleton className="w-full sm:w-48 h-24 sm:h-20 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2 w-full">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md shrink-0" />
      </div>
    </div>
  )
}

// Main AdBanner component with memo for performance
export const AdBanner = memo(function AdBanner({ 
  ad, 
  variant = "horizontal", 
  className = "",
  showCloseButton = true,
  priority = "normal",
  onClose
}: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isClosing, setIsClosing] = useState(false)
  const [hasTrackedView, setHasTrackedView] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Track view on mount with useCallback
  const trackView = useCallback(async () => {
    if (!ad || hasTrackedView) return
    try {
      await fetch(`/api/ads/${ad.id}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "view" }),
      })
      setHasTrackedView(true)
    } catch {
      // Silently ignore tracking errors
    }
  }, [ad, hasTrackedView])

  useEffect(() => {
    trackView()
  }, [trackView])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300)
  }, [onClose])

  const handleClick = useCallback(async () => {
    if (!ad) return
    try {
      await fetch(`/api/ads/${ad.id}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "click" }),
      })
    } catch {
      // Silently ignore tracking errors
    }
  }, [ad])

  if (!ad || !isVisible) return null

  const baseClasses = cn(
    "relative overflow-hidden rounded-xl border transition-all duration-300",
    "bg-gradient-to-br from-background via-muted/30 to-muted/50",
    "border-border/50 shadow-sm hover:shadow-lg hover:border-primary/20",
    isClosing && "opacity-0 scale-95 translate-y-2",
    priority === "high" && "ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
  )

  const AdLabel = () => (
    <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
      <Sparkles className="h-3 w-3" />
      <span>Sponsorisé</span>
    </div>
  )

  const CloseButton = () => showCloseButton && (
    <button
      onClick={handleClose}
      className={cn(
        "absolute top-2 right-2 z-10 p-1.5 rounded-full",
        "bg-background/80 backdrop-blur-sm border border-border/50",
        "hover:bg-muted transition-all duration-200",
        "opacity-0 group-hover:opacity-100 focus:opacity-100"
      )}
      aria-label="Fermer la publicité"
    >
      <X className="h-3.5 w-3.5 text-muted-foreground" />
    </button>
  )

  const AdImage = ({ 
    width, 
    height, 
    sizes,
    className: imgClassName 
  }: { 
    width?: string
    height?: string
    sizes: string
    className?: string 
  }) => {
    if (!ad.image_url) return null
    
    return (
      <div className={cn("relative overflow-hidden rounded-lg bg-muted", width, height, imgClassName)}>
        {!imageLoaded && !imageError && (
          <Skeleton className="absolute inset-0" />
        )}
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Sparkles className="h-8 w-8 text-muted-foreground/50" />
          </div>
        ) : (
          <Image
            src={ad.image_url || "/placeholder.svg"}
            alt={ad.title}
            fill
            className={cn(
              "object-cover transition-all duration-500",
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
            )}
            sizes={sizes}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            priority={priority === "high"}
          />
        )}
      </div>
    )
  }

  const ActionButton = ({ fullWidth = false }: { fullWidth?: boolean }) => {
    if (!ad.link_url) return null
    
    return (
      <Button
        asChild
        size="sm"
        className={cn(
          "gap-2 transition-all duration-200 hover:gap-3",
          fullWidth && "w-full"
        )}
      >
        <Link
          href={ad.link_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
        >
          {ad.link_text || "En savoir plus"}
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </Button>
    )
  }

  // HORIZONTAL VARIANT
  if (variant === "horizontal") {
return (
  <a
    href={ad.link}
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      baseClasses,
      "group relative block overflow-hidden rounded-xl",
      className
    )}
  >
    {/* Image en background */}
    <AdImage
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      sizes="(max-width: 640px) 100vw, 200px"
    />

    {/* Overlay (lisibilité du texte) */}
    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />

    {/* Contenu texte */}
    <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-5">
      <AdLabel />
      <h3 className="mt-1 text-lg font-semibold text-white leading-tight">
        {ad.title}
      </h3>
    </div>

    <CloseButton />
  </a>
)

  }

  // VERTICAL / SIDEBAR VARIANT
  if (variant === "vertical" || variant === "sidebar") {
    return (
      <div className={cn(baseClasses, "group", className)}>
        <div className="p-4 space-y-4">
          <div className="text-center">
            <AdLabel />
          </div>
          <AdImage 
            width="w-full" 
            height="h-36" 
            sizes="300px" 
          />
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-foreground">{ad.title}</h3>
            {ad.description && (
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{ad.description}</p>
            )}
          </div>
          <ActionButton fullWidth />
        </div>
        <CloseButton />
      </div>
    )
  }

  // CARD VARIANT
  if (variant === "card") {
    return (
      <div className={cn(baseClasses, "group", className)}>
        <AdImage 
          width="w-full" 
          height="h-44" 
          sizes="(max-width: 768px) 100vw, 400px"
          className="rounded-t-xl rounded-b-none"
        />
        <div className="p-4 space-y-3">
          <AdLabel />
          <h3 className="font-semibold text-foreground text-lg">{ad.title}</h3>
          {ad.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{ad.description}</p>
          )}
          <ActionButton fullWidth />
        </div>
        <CloseButton />
      </div>
    )
  }

  // COMPACT VARIANT
  return (
    <div className={cn(baseClasses, "group", className)}>
      <div className="flex items-center gap-3 p-3">
        <AdImage 
          width="w-14" 
          height="h-14" 
          sizes="56px"
          className="shrink-0"
        />
        <div className="flex-1 min-w-0 space-y-0.5">
          <AdLabel />
          <h3 className="font-medium text-sm text-foreground truncate">{ad.title}</h3>
        </div>
        {ad.link_url && (
          <Link
            href={ad.link_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="shrink-0 text-xs font-medium text-primary hover:underline flex items-center gap-1"
          >
            Voir
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
      <CloseButton />
    </div>
  )
})