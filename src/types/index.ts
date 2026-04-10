export interface TripFormData {
  destination: string
  origin: string
  budget: number
  startDate?: string
  days: number
  people: number
  travelMode: 'fly' | 'drive'
  startingAddress?: string
  preferences: string[]
  specialRequests?: string
}

export interface FlightOption {
  airline: string
  flightNumber: string
  departure: string
  arrival: string
  departureTime: string
  arrivalTime: string
  duration: string
  stops: number
  price: number
  bookingUrl: string
}

export interface HotelOption {
  name: string
  location: string
  neighborhood: string
  stars: number
  pricePerNight: number
  totalPrice: number
  amenities: string[]
  description: string
  rating: number
  reviewCount: number
  bookingUrl: string
  highlights: string[]
}

export interface Restaurant {
  name: string
  cuisine: string
  neighborhood: string
  priceRange: string
  rating: number
  reviewCount: number
  description: string
  mustTry: string
  bestFor: string
  foursquareId?: string
}

export interface DayPlan {
  day: number
  date?: string
  theme: string
  morning: Activity
  afternoon: Activity
  evening: Activity
  accommodation: string
  estimatedCost: number
}

export interface Activity {
  time: string
  title: string
  description: string
  location: string
  address?: string
  tips: string
  cost?: string
  duration?: string
}

export interface TripTip {
  category: string
  title: string
  content: string
}

export interface AlternativeDestination {
  destination: string
  country: string
  reason: string
  estimatedCost: number
  vibe: string
  highlights: string[]
}

export interface GeneratedTrip {
  title: string
  destination: string
  country: string
  summary: string
  bestTimeToVisit: string
  currentSeasonNote: string
  weatherExpectation: string
  totalEstimatedCost: number
  budgetBreakdown: {
    flights: number
    accommodation: number
    food: number
    activities: number
    transport: number
    misc: number
  }
  flights: FlightOption[]
  hotels: HotelOption[]
  restaurants: Restaurant[]
  itinerary: DayPlan[]
  tips: TripTip[]
  alternativeDestinations?: AlternativeDestination[]
  isOverBudget: boolean
  budgetDifference: number
}

export interface Profile {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
  bio?: string
  trips_count: number
  created_at: string
}

export interface Achievement {
  id: string
  user_id: string
  type: string
  label: string
  description: string
  icon: string
  earned_at: string
}

export interface Trip {
  id: string
  user_id: string
  title: string
  destination: string
  country?: string
  budget?: number
  start_date?: string
  end_date?: string
  days: number
  travel_mode: string
  preferences: string[]
  itinerary?: GeneratedTrip
  total_estimated_cost?: number
  is_public: boolean
  view_count: number
  likes_count: number
  created_at: string
  profiles?: Profile
}
