export interface Room {
  id: string
  name: string
  description: string | null
  capacity: number
  price_per_day: number
  image_url: string | null
  amenities: string[] | null
  available: boolean
  reserved: boolean // Added reserved field for admin to mark rooms as unavailable
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: string
  room_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  event_object: string
  start_hour?: number
  end_hour?: number
  start_time: string
  end_time: string
  status: "pending" | "confirmed" | "cancelled"
  total_price: number
  notes: string | null
  // Catering options
  lunch_selected?: boolean
  breakfast_option?: number | null // 1, 2, or 3
  coffee_break_selected?: boolean
  number_of_guests?: number
  // Price adjustment fields
  is_half_day?: boolean // True if reservation is 5 hours or less (50% discount)
  room_price_original?: number // Original room price without discount
  room_price_applied?: number // Room price applied (with half-day discount if applicable)
  admin_adjusted_price?: number | null // Final price adjusted by admin (null if not modified)
  admin_price_note?: string | null // Admin note explaining price adjustment
  created_at: string
  updated_at: string
  room?: Room
}
// </CHANGE>

export interface Advertisement {
  id: string
  title: string
  description: string | null
  image_url: string | null
  link_url: string | null
  link_text: string
  position: "homepage_top" | "homepage_bottom" | "homepage_middle" | "room_sidebar" | "room_bottom" | "global_popup"
  is_active: boolean
  start_date: string | null
  end_date: string | null
  click_count: number
  view_count: number
  created_at: string
  updated_at: string
}

export const AD_POSITIONS = {
  homepage_top: { label: "Accueil - Haut", description: "Bannière horizontale en haut de page" },
  homepage_bottom: { label: "Accueil - Bas", description: "Encart avant le footer" },
  homepage_middle: { label: "Accueil - Milieu", description: "Encart entre les sections" },
  room_sidebar: { label: "Salle - Latéral", description: "Colonne latérale droite" },
  room_bottom: { label: "Salle - Bas", description: "Sous le formulaire de réservation" },
  global_popup: { label: "Popup global", description: "Popup promotionnel sur toutes les pages" },
}

export const CATERING_OPTIONS = {
  lunch: {
    price: 25000,
    name: "Déjeuner Complet",
    description: "Entrée, plat de résistance et dessert",
  },
  breakfast: [
    {
      id: 1,
      price: 6000,
      name: "Petit-déjeuner Option 1",
      items: ["Boisson chaude", "Boisson froide (jus d'orange, jus de pommes)", "Viennoiserie"],
    },
    {
      id: 2,
      price: 9000,
      name: "Petit-déjeuner Option 2",
      items: [
        "Boisson chaude",
        "Boisson froide (jus d'orange, jus de pommes, cocktail, jus d'ananas)",
        "Viennoiserie",
        "Eau",
        "Corbeille de pains, beurre, confiture, fromage",
        "Fruits (pommes et oranges)",
      ],
    },
    {
      id: 3,
      price: 12000,
      name: "Petit-déjeuner Option 3",
      items: [
        "Boisson chaude",
        "Boisson froide (jus d'orange, jus de pommes, cocktail, jus d'ananas, jus de mangue, jus de raisin)",
        "Viennoiserie",
        "Corbeille de pains, beurre, confiture, fromage",
        "Charcuterie",
        "Fruits (pommes, oranges, bananes, pastèque et poires)",
      ],
    },
  ],
  coffeeBreak: {
    price: 3500,
    name: "Pause-café",
    description: "Rafraîchissements et collations",
  },
}
// </CHANGE>
