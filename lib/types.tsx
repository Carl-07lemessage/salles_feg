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
  created_at: string
  updated_at: string
  room?: Room
}
// </CHANGE>

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
