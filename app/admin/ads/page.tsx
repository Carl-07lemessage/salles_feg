"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, BarChart3, ImageIcon, Calendar, MapPin, MousePointerClick, TrendingUp, RefreshCw, Search, Filter, Megaphone, CheckCircle2, Upload, X } from "lucide-react"
import type { Advertisement } from "@/lib/types"
import { AD_POSITIONS } from "@/lib/types"
import { AdBanner } from "@/components/ad-banner"
import Image from "next/image"

export default function AdsManagementPage() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPosition, setFilterPosition] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    link_text: "En savoir plus",
    position: "homepage_top" as Advertisement["position"],
    is_active: true,
    start_date: "",
    end_date: "",
  })

  // Filter and search ads
  const filteredAds = useMemo(() => {
    return ads.filter(ad => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ad.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      
      // Position filter
      const matchesPosition = filterPosition === "all" || ad.position === filterPosition
      
      // Status filter
      const now = new Date()
      const startDate = ad.start_date ? new Date(ad.start_date) : null
      const endDate = ad.end_date ? new Date(ad.end_date) : null
      
      let status = "inactive"
      if (ad.is_active) {
        if (startDate && now < startDate) status = "scheduled"
        else if (endDate && now > endDate) status = "expired"
        else status = "active"
      }
      
      const matchesStatus = filterStatus === "all" || filterStatus === status
      
      return matchesSearch && matchesPosition && matchesStatus
    })
  }, [ads, searchQuery, filterPosition, filterStatus])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = ads.length
    const active = ads.filter(ad => ad.is_active).length
    const totalViews = ads.reduce((sum, ad) => sum + ad.view_count, 0)
    const totalClicks = ads.reduce((sum, ad) => sum + ad.click_count, 0)
    const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : "0.00"
    return { total, active, totalViews, totalClicks, ctr }
  }, [ads])

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const response = await fetch("/api/ads?all=true")
      if (response.ok) {
        const data = await response.json()
        setAds(data)
        if (isRefresh) toast.success("Liste mise à jour")
      }
    } catch {
      toast.error("Erreur lors du chargement des publicités")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = selectedAd ? `/api/ads/${selectedAd.id}` : "/api/ads"
      const method = selectedAd ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
        }),
      })

      if (response.ok) {
        toast.success(selectedAd ? "Publicité mise à jour" : "Publicité créée")
        setIsDialogOpen(false)
        resetForm()
        fetchAds()
      } else {
        throw new Error("Erreur")
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement")
    }
  }

  const handleDelete = async () => {
    if (!selectedAd) return
    
    try {
      const response = await fetch(`/api/ads/${selectedAd.id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Publicité supprimée")
        setIsDeleteDialogOpen(false)
        setSelectedAd(null)
        fetchAds()
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const handleToggleActive = async (ad: Advertisement) => {
    try {
      const response = await fetch(`/api/ads/${ad.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...ad, is_active: !ad.is_active }),
      })
      if (response.ok) {
        toast.success(ad.is_active ? "Publicité désactivée" : "Publicité activée")
        fetchAds()
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour")
    }
  }

  const openEditDialog = (ad: Advertisement) => {
    setSelectedAd(ad)
    setFormData({
      title: ad.title,
      description: ad.description || "",
      image_url: ad.image_url || "",
      link_url: ad.link_url || "",
      link_text: ad.link_text,
      position: ad.position,
      is_active: ad.is_active,
      start_date: ad.start_date ? ad.start_date.split("T")[0] : "",
      end_date: ad.end_date ? ad.end_date.split("T")[0] : "",
    })
    setImagePreview(ad.image_url || "")
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setSelectedAd(null)
    setFormData({
      title: "",
      description: "",
      image_url: "",
      link_url: "",
      link_text: "En savoir plus",
      position: "homepage_top",
      is_active: true,
      start_date: "",
      end_date: "",
    })
    setImagePreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getStatusBadge = (ad: Advertisement) => {
    const now = new Date()
    const startDate = ad.start_date ? new Date(ad.start_date) : null
    const endDate = ad.end_date ? new Date(ad.end_date) : null

    if (!ad.is_active) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    if (startDate && now < startDate) {
      return <Badge variant="outline" className="text-amber-600 border-amber-600">Programmée</Badge>
    }
    if (endDate && now > endDate) {
      return <Badge variant="destructive">Expirée</Badge>
    }
    return <Badge className="bg-green-600">Active</Badge>
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  // Handle file upload - same logic as room images
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      toast.error("Type de fichier non valide. Utilisez JPG, PNG, WebP ou GIF")
      return
    }

    // Validate file size (8MB max)
    const maxSize = 8 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("Le fichier est trop volumineux. Taille maximale: 8MB")
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setIsUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const response = await fetch("/api/upload-room-image", {
        method: "POST",
        body: uploadFormData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Echec du téléchargement")
      }

      const data = await response.json()
      setFormData(prev => ({ ...prev, image_url: data.url }))
      toast.success("Image téléchargée avec succès")
    } catch (error) {
      toast.error("Erreur lors du téléchargement de l'image")
      setImagePreview(formData.image_url)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image_url: "" }))
    setImagePreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Megaphone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestion des Publicités</h1>
              <p className="text-muted-foreground">
                Gérez vos espaces publicitaires et suivez leurs performances
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchAds(true)}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true) }} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle publicité
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-gradient-to-br from-background to-muted/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">publicités créées</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200/50 dark:border-green-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">Actives</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.active}</div>
            <p className="text-xs text-green-600/80 dark:text-green-500/80">en diffusion</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Impressions</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-blue-600/80 dark:text-blue-500/80">vues totales</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200/50 dark:border-purple-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">Clics</CardTitle>
            <MousePointerClick className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{stats.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-purple-600/80 dark:text-purple-500/80">clics totaux</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200/50 dark:border-amber-800/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">Taux de clic</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.ctr}%</div>
            <p className="text-xs text-amber-600/80 dark:text-amber-500/80">CTR moyen</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une publicité..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterPosition} onValueChange={setFilterPosition}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les positions</SelectItem>
              {Object.entries(AD_POSITIONS).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actives</SelectItem>
              <SelectItem value="inactive">Inactives</SelectItem>
              <SelectItem value="scheduled">Programmées</SelectItem>
              <SelectItem value="expired">Expirées</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ads Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des publicités</CardTitle>
              <CardDescription>
                {filteredAds.length} publicité{filteredAds.length > 1 ? "s" : ""} trouvée{filteredAds.length > 1 ? "s" : ""}
                {(searchQuery || filterPosition !== "all" || filterStatus !== "all") && " (filtrées)"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="w-20 h-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Megaphone className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {ads.length === 0 ? "Aucune publicité" : "Aucun résultat"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {ads.length === 0 
                  ? "Créez votre première publicité pour commencer à monétiser vos espaces."
                  : "Aucune publicité ne correspond à vos critères de recherche."}
              </p>
              {ads.length === 0 && (
                <Button onClick={() => { resetForm(); setIsDialogOpen(true) }} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Créer une publicité
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-24">Aperçu</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAds.map((ad) => (
                    <TableRow key={ad.id} className="group hover:bg-muted/30">
                      <TableCell>
                        {ad.image_url ? (
                          <div className="relative w-20 h-12 rounded-md overflow-hidden bg-muted ring-1 ring-border/50">
                            <Image
                              src={ad.image_url || "/placeholder.svg"}
                              alt={ad.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-12 rounded-md bg-muted flex items-center justify-center ring-1 ring-border/50">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium line-clamp-1">{ad.title}</div>
                          {ad.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {ad.description}
                            </div>
                          )}
                          {ad.link_url && (
                            <a 
                              href={ad.link_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Voir le lien
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1.5">
                          <MapPin className="h-3 w-3" />
                          {AD_POSITIONS[ad.position]?.label || ad.position}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(ad)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(ad.start_date)} - {formatDate(ad.end_date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Eye className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-medium">{ad.view_count.toLocaleString()}</span>
                            <span className="text-muted-foreground">vues</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MousePointerClick className="h-3.5 w-3.5 text-purple-500" />
                            <span className="font-medium">{ad.click_count.toLocaleString()}</span>
                            <span className="text-muted-foreground">clics</span>
                            {ad.view_count > 0 && (
                              <span className="text-xs text-muted-foreground">
                                ({((ad.click_count / ad.view_count) * 100).toFixed(1)}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setSelectedAd(ad); setIsPreviewOpen(true) }}
                            title="Aperçu"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(ad)}
                            title={ad.is_active ? "Désactiver" : "Activer"}
                          >
                            {ad.is_active ? (
                              <EyeOff className="h-4 w-4 text-amber-500" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(ad)}
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => { setSelectedAd(ad); setIsDeleteDialogOpen(true) }}
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aperçu de la publicité</DialogTitle>
            <DialogDescription>
              Visualisez comment la publicité apparaîtra sur le site
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="horizontal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="horizontal">Horizontal</TabsTrigger>
              <TabsTrigger value="vertical">Vertical</TabsTrigger>
              <TabsTrigger value="card">Carte</TabsTrigger>
              <TabsTrigger value="compact">Compact</TabsTrigger>
            </TabsList>
            <TabsContent value="horizontal" className="mt-4">
              {selectedAd && <AdBanner ad={selectedAd} variant="horizontal" showCloseButton={false} />}
            </TabsContent>
            <TabsContent value="vertical" className="mt-4">
              <div className="max-w-xs mx-auto">
                {selectedAd && <AdBanner ad={selectedAd} variant="vertical" showCloseButton={false} />}
              </div>
            </TabsContent>
            <TabsContent value="card" className="mt-4">
              <div className="max-w-sm mx-auto">
                {selectedAd && <AdBanner ad={selectedAd} variant="card" showCloseButton={false} />}
              </div>
            </TabsContent>
            <TabsContent value="compact" className="mt-4">
              <div className="max-w-md mx-auto">
                {selectedAd && <AdBanner ad={selectedAd} variant="compact" showCloseButton={false} />}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAd ? "Modifier la publicité" : "Nouvelle publicité"}
            </DialogTitle>
            <DialogDescription>
              {selectedAd ? "Modifiez les informations de la publicité" : "Créez une nouvelle publicité pour votre application"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titre de la publicité"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value as Advertisement["position"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une position" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AD_POSITIONS).map(([key, { label, description }]) => (
                      <SelectItem key={key} value={key}>
                        <div>
                          <div className="font-medium">{label}</div>
                          <div className="text-xs text-muted-foreground">{description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la publicité"
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <Label>Image de la publicité</Label>

              {/* Image preview */}
              {(imagePreview || formData.image_url) && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src={imagePreview || formData.image_url || "/placeholder.svg"}
                    alt="Aperçu"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                    title="Supprimer l'image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Upload button */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Téléchargement..." : "Télécharger une image"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* URL input as alternative */}
              <div className="space-y-2">
                <Label htmlFor="image_url" className="text-sm text-muted-foreground">
                  Ou entrez une URL d'image
                </Label>
                <Input
                  id="image_url"
                  type="url"
                  placeholder="https://exemple.com/image.jpg"
                  value={formData.image_url}
                  onChange={(e) => {
                    setFormData({ ...formData, image_url: e.target.value })
                    setImagePreview(e.target.value)
                  }}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Formats acceptés: JPG, PNG, WebP, GIF. Taille max: 8MB
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="link_url">URL du lien</Label>
                <Input
                  id="link_url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="https://exemple.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link_text">Texte du bouton</Label>
                <Input
                  id="link_text"
                  value={formData.link_text}
                  onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                  placeholder="En savoir plus"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Date de début</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Date de fin</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Publicité active</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {selectedAd ? "Mettre à jour" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la publicité ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La publicité "{selectedAd?.title}" sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
