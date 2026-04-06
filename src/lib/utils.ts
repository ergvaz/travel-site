import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function generateBookingUrl(type: 'flights' | 'hotels', params: {
  destination?: string
  origin?: string
  checkIn?: string
  checkOut?: string
  guests?: number
}): string {
  if (type === 'flights') {
    const base = 'https://www.google.com/flights'
    const parts = []
    if (params.checkIn) parts.push(`date=${params.checkIn}`)
    return `${base}#search;f=${params.origin || 'JFK'};t=${params.destination};d=${params.checkIn || ''};r=${params.checkOut || ''};tt=o`
  } else {
    const dest = encodeURIComponent(params.destination || '')
    const checkin = params.checkIn || ''
    const checkout = params.checkOut || ''
    return `https://www.booking.com/searchresults.html?ss=${dest}&checkin=${checkin}&checkout=${checkout}&group_adults=${params.guests || 2}`
  }
}
