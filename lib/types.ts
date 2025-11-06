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
  customer_phone: string | null
  start_time: string
  end_time: string
  status: "pending" | "confirmed" | "cancelled"
  total_price: number
  notes: string | null
  created_at: string
  updated_at: string
  room?: Room
}
