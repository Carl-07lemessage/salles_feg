import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { 
  Building2, 
  CalendarDays, 
  Sparkles, 
  Shield, 
  Clock,
  ChevronRight,
  Award,
  Gem,
  Star,
  MapPin,
  Phone,
  Mail,
  Users,
  Crown,
  Infinity,
  TrendingUp,
  Coffee,
  Wifi,
  Zap
} from "lucide-react"
import { Toaster } from "sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "FEG - Location de Salles Prestige | Fédération des Entreprises du Gabon",
  description: "Découvrez nos salles d'exception, alliant luxe et fonctionnalité pour vos événements professionnels les plus exigeants au Gabon.",
  openGraph: {
    title: "FEG - Salles d'Exception",
    description: "Des espaces prestigieux pour vos événements professionnels",
    images: ["/logo-feg.png"],
  },
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>
        {children}
        <Toaster position="top-center" richColors />
             <footer className="border-t border-gray-200 bg-white">
  <div className="container flex justify-evenly px-6 py-8">
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
      <p>© {new Date().getFullYear()} Fédération des Entreprises du Gabon</p>
   </div>
   <div className="flex items-center gap-2 text-gray-500 group/contact">
         <Mail className="h-4 w-4 text-primary/60 group-hover/contact:scale-110 group-hover/contact:text-primary transition-all duration-300" />
         <a href="mailto:info@lafeg.ga" className="hover:text-primary transition-colors">info@lafeg.ga</a>
   </div> 
   <div className="flex items-center gap-2 text-gray-500 group/contact">
        <MapPin className="h-4 w-4 text-primary/60 group-hover/contact:scale-110 group-hover/contact:text-primary transition-all duration-300" />
         <span>Immeuble ODYSSÉE, Boulevard de l’Indépendance, BP: 410, Libreville GABON </span>
    </div>         
                
              
              
  </div>
</footer>
      </body>
    </html>
  )
}
