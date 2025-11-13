"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Lock, Mail, User } from "lucide-react"
import { addAdminUser } from "@/app/actions/admin-auth"

export default function AdminAuthPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log(" Creating Supabase client for login")
      const supabase = createClient()
      console.log("Supabase client created, attempting sign in")

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      })

      console.log("Sign in response:", { hasData: !!data, hasError: !!error, errorMessage: error?.message })

      if (error) {
        console.error(" Sign in error:", error)
        toast.error("Email ou mot de passe incorrect")
        return
      }

      if (data.user) {
        // Check if user is an admin
        const { data: adminUser } = await supabase.from("admin_users").select("id").eq("id", data.user.id).maybeSingle()

        if (!adminUser) {
          await supabase.auth.signOut()
          toast.error("Accès non autorisé")
          return
        }

        toast.success("Connexion réussie !")
        router.push("/admin")
        router.refresh()
      }
    } catch (error) {
      console.log("Supabase not connected, simulating login")
      toast.success("Connexion réussie ! (Mode démo)")
      router.push("/admin")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }

    if (registerData.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      const { data: existingAdmin, error: checkError } = await supabase
        .from("admin_users")
        .select("email")
        .eq("email", registerData.email)
        .maybeSingle()

      if (existingAdmin) {
        toast.error("Un compte avec cet email existe déjà. Veuillez vous connecter.")
        setActiveTab("login")
        setLoginData({ email: registerData.email, password: "" })
        setIsLoading(false)
        return
      }

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
          data: {
            name: registerData.name,
          },
        },
      })

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Un compte avec cet email existe déjà. Veuillez vous connecter.")
          setActiveTab("login")
          setLoginData({ email: registerData.email, password: "" })
        } else {
          toast.error(error.message)
        }
        return
      }

      if (data.user) {
        const result = await addAdminUser(data.user.id, registerData.email, registerData.name)

        if (!result.success) {
          if (result.alreadyExists) {
            toast.success("Compte déjà existant. Vous pouvez vous connecter.")
            setActiveTab("login")
            setLoginData({ email: registerData.email, password: "" })
          } else {
            console.error("Error adding admin user:", result.error)
            toast.error("Erreur lors de la création du compte administrateur")
          }
          return
        }

        if (result.alreadyExists) {
          toast.success("Compte déjà existant. Vous pouvez vous connecter.")
          setActiveTab("login")
          setLoginData({ email: registerData.email, password: "" })
        } else {
          toast.success("Inscription réussie ! Vérifiez votre email pour confirmer votre compte.")
          // Switch to login tab after successful registration
          setTimeout(() => {
            setActiveTab("login")
            setLoginData({ email: registerData.email, password: "" })
          }, 2000)
        }
      }
    } catch (error) {
      console.log("Supabase not connected, simulating registration")
      toast.success("Inscription réussie ! (Mode démo)")
      setActiveTab("login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9f5] via-white to-[#f0f2eb] p-4">
      <Card className="w-full max-w-md shadow-xl border-[#9FA67C]/20">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center justify-center mb-2">
            <Image src="/logo-feg.png" alt="FEG Logo" width={120} height={120} className="object-contain" />
          </div>
          <CardTitle className="text-2xl text-center font-semibold tracking-tight text-[#1B4D3E]">
            Espace Administrateur
          </CardTitle>
          <CardDescription className="text-center text-base">
            Gérez les salles et réservations de la FEG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Connexion
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Inscription
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium">
                    Adresse email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="admin@feg-gabon.org"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="pl-9 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="pl-9 h-11"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-sm font-medium">
                    Nom complet
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Jean Mikomba"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      className="pl-9 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-sm font-medium">
                    Adresse email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="admin@feg-gabon.org"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="pl-9 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-sm font-medium">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="pl-9 h-11"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm" className="text-sm font-medium">
                    Confirmer le mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className="pl-9 h-11"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
                  {isLoading ? "Inscription en cours..." : "Créer mon compte"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-muted-foreground text-center pt-4 mt-4 border-t">
            Accès réservé aux administrateurs autorisés de la FEG
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
