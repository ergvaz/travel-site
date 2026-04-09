import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { TripFormData, GeneratedTrip } from '@/types'

export const maxDuration = 120

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Attempt to repair truncated JSON by closing any open structures
function repairJSON(text: string): GeneratedTrip {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    // Walk the string tracking open structures and strings
    let inString = false
    let escape = false
    const stack: string[] = []

    for (const ch of cleaned) {
      if (escape)         { escape = false; continue }
      if (ch === '\\' && inString) { escape = true; continue }
      if (ch === '"')     { inString = !inString; continue }
      if (inString)       continue
      if (ch === '{')     stack.push('}')
      else if (ch === '[') stack.push(']')
      else if (ch === '}' || ch === ']') stack.pop()
    }

    let fixed = cleaned
    if (inString) fixed += '"'          // close open string
    // Remove trailing comma before closing
    fixed = fixed.replace(/,\s*$/, '')
    fixed += stack.reverse().join('')   // close open brackets/braces

    return JSON.parse(fixed)
  }
}

// Fetch with hard timeout
function fetchWithTimeout(url: string, options: RequestInit, ms: number) {
  const ctrl = new AbortController()
  const id = setTimeout(() => ctrl.abort(), ms)
  return fetch(url, { ...options, signal: ctrl.signal })
    .finally(() => clearTimeout(id))
}

async function researchDestination(destination: string, travelDate: string): Promise<string> {
  const tavilyKey = process.env.TAVILY_API_KEY
  if (!tavilyKey) return ''
  try {
    const res = await fetchWithTimeout(
      'https://api.tavily.com/search',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${destination} travel tips ${travelDate} weather crowds`,
          max_results: 3,
          search_depth: 'basic',
        }),
      },
      4000
    )
    const data = await res.json()
    return (data.results || [])
      .slice(0, 3)
      .map((r: { content: string }) => r.content)
      .join('\n\n')
      .slice(0, 1500)
  } catch {
    return ''
  }
}

async function getPlacesFromFoursquare(destination: string): Promise<string> {
  const key = process.env.FOURSQUARE_API_KEY
  if (!key) return ''
  try {
    const res = await fetchWithTimeout(
      `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(destination)}&categories=13065,16000&limit=6&fields=name,location,rating`,
      { headers: { Authorization: key, Accept: 'application/json' } },
      4000
    )
    const data = await res.json()
    return (data.results || [])
      .map((p: { name: string; location?: { formatted_address?: string }; rating?: number }) =>
        `${p.name} (${p.location?.formatted_address || ''}, rating: ${p.rating || 'N/A'})`
      )
      .join('\n')
      .slice(0, 800)
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData: TripFormData = await req.json()
    const {
      destination, budget, days, people = 2,
      travelMode, startingAddress, preferences, specialRequests, startDate,
    } = formData

    const travelMonth = startDate
      ? new Date(startDate).toLocaleString('en-US', { month: 'long' })
      : new Date().toLocaleString('en-US', { month: 'long' })

    // Run external lookups in parallel with a shared 5s window
    const [research, places] = await Promise.all([
      researchDestination(destination, travelMonth),
      getPlacesFromFoursquare(destination),
    ])

    const rooms = people <= 2 ? 1 : Math.ceil(people / 2)

    const systemPrompt = `You are an expert travel planner. Respond ONLY with valid, complete JSON — no markdown, no explanation, no trailing text.`

    const userPrompt = `Plan a ${days}-day trip to ${destination}.
Budget: $${budget} total for ${people} person(s) / ${rooms} room(s).
Travel: ${travelMode === 'drive' ? `driving from ${startingAddress}` : 'flying'}
Month: ${travelMonth}${startDate ? ` (start ${startDate})` : ''}
Preferences: ${preferences.join(', ') || 'general sightseeing'}
${specialRequests ? `Special requests: ${specialRequests}` : ''}
${research ? `Research:\n${research}` : ''}
${places ? `Places:\n${places}` : ''}

Return ONLY this JSON (be concise — keep descriptions under 20 words each):
{
  "title": "string",
  "destination": "string",
  "country": "string",
  "summary": "string (2 sentences)",
  "bestTimeToVisit": "string",
  "currentSeasonNote": "string",
  "weatherExpectation": "string",
  "totalEstimatedCost": number,
  "budgetBreakdown": {"flights":number,"accommodation":number,"food":number,"activities":number,"transport":number,"misc":number},
  "flights": [{"airline":"string","flightNumber":"string","departure":"string","arrival":"string","departureTime":"string","arrivalTime":"string","duration":"string","stops":number,"price":number,"bookingUrl":"string"}],
  "hotels": [{"name":"string","neighborhood":"string","stars":number,"pricePerNight":number,"totalPrice":number,"description":"string","rating":number,"bookingUrl":"string","highlights":["string"]}],
  "restaurants": [{"name":"string","cuisine":"string","priceRange":"$|$$|$$$|$$$$","rating":number,"description":"string","mustTry":"string","bestFor":"string"}],
  "itinerary": [{"day":number,"theme":"string","morning":{"title":"string","description":"string","cost":"string"},"afternoon":{"title":"string","description":"string","cost":"string"},"evening":{"title":"string","description":"string","cost":"string"},"estimatedCost":number}],
  "tips": [{"category":"string","title":"string","content":"string"}],
  "alternativeDestinations": [{"destination":"string","country":"string","reason":"string","estimatedCost":number,"vibe":"string","highlights":["string"]}],
  "isOverBudget": boolean,
  "budgetDifference": number
}

Rules:
- Exactly ${days} days in itinerary
- 2 flights, 2 hotels, 5 restaurants, 6 tips, 3 alternatives
- flights bookingUrl: real Google Flights deep link
- hotels bookingUrl: real Booking.com search URL
- If totalEstimatedCost > ${budget}: isOverBudget=true, budgetDifference=totalEstimatedCost-${budget}
- Keep ALL string values short. Do not exceed the JSON structure above.`

    const encoder = new TextEncoder()
    let fullText = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = anthropic.messages.stream({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 7000,
            messages: [{ role: 'user', content: userPrompt }],
            system: systemPrompt,
          })

          for await (const event of anthropicStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              fullText += event.delta.text
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          controller.close()
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Failed to plan trip'
          controller.enqueue(encoder.encode(`\n__ERROR__:${msg}`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('Plan trip error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to plan trip' },
      { status: 500 }
    )
  }
}
