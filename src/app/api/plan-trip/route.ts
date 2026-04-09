import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { TripFormData, GeneratedTrip } from '@/types'

export const maxDuration = 120

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function researchDestination(destination: string, travelDate: string): Promise<string> {
  const tavilyKey = process.env.TAVILY_API_KEY
  if (!tavilyKey) return ''

  try {
    const queries = [
      `best hotels ${destination} ${new Date().getFullYear()} reviews`,
      `${destination} travel tips dos and don'ts tourists`,
      `${destination} ${travelDate} weather busy season tourist crowds`,
    ]

    const results = await Promise.all(
      queries.map(q =>
        fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: tavilyKey,
            query: q,
            max_results: 3,
            search_depth: 'basic',
          }),
        }).then(r => r.json()).catch(() => ({ results: [] }))
      )
    )

    const snippets = results.flatMap((r: { results?: Array<{ content: string }> }) =>
      (r.results || []).map((item: { content: string }) => item.content).slice(0, 2)
    ).join('\n\n')

    return snippets.slice(0, 3000)
  } catch {
    return ''
  }
}

async function getPlacesFromFoursquare(destination: string): Promise<string> {
  const key = process.env.FOURSQUARE_API_KEY
  if (!key) return ''

  try {
    const categories = [
      { id: '13065', label: 'restaurant' },
      { id: '16000', label: 'attraction' },
      { id: '19014', label: 'hotel' },
    ]

    const results = await Promise.all(
      categories.map(cat =>
        fetch(
          `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(destination)}&categories=${cat.id}&limit=5&fields=name,location,rating,price,description,categories`,
          { headers: { Authorization: key, Accept: 'application/json' } }
        ).then(r => r.json()).catch(() => ({ results: [] }))
      )
    )

    const places = results.flatMap((r: { results?: Array<{ name: string; location?: { formatted_address?: string }; rating?: number; categories?: Array<{ name: string }> }> }, i) =>
      (r.results || []).slice(0, 3).map((p: { name: string; location?: { formatted_address?: string }; rating?: number; categories?: Array<{ name: string }> }) =>
        `${categories[i].label}: ${p.name} (${p.location?.formatted_address || ''}, rating: ${p.rating || 'N/A'})`
      )
    ).join('\n')

    return places
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData: TripFormData = await req.json()
    const { destination, budget, days, people = 2, travelMode, startingAddress, preferences, specialRequests, startDate } = formData

    const travelMonth = startDate
      ? new Date(startDate).toLocaleString('en-US', { month: 'long' })
      : new Date().toLocaleString('en-US', { month: 'long' })

    const [research, places] = await Promise.all([
      researchDestination(destination, travelMonth),
      getPlacesFromFoursquare(destination),
    ])

    const systemPrompt = `You are an expert luxury travel planner with deep knowledge of global destinations, flight pricing, hotel rates, and local culture. You create detailed, accurate, and genuinely useful travel plans. You always consider seasonality, current travel conditions, and real-world logistics. You respond ONLY with valid JSON.`

    const rooms = people <= 2 ? 1 : Math.ceil(people / 2)
    const userPrompt = `Plan a ${days}-day trip to ${destination} with a budget of $${budget} USD total for ${people} ${people === 1 ? 'person' : 'people'} (not per person). They will need ${rooms} hotel room${rooms > 1 ? 's' : ''}.

Travel details:
- Travel mode: ${travelMode}
${travelMode === 'drive' ? `- Starting from: ${startingAddress}` : '- Flying (provide realistic flight options with Google Flights booking links)'}
- Travel month: ${travelMonth}
${startDate ? `- Start date: ${startDate}` : ''}
- Preferences: ${preferences.join(', ') || 'general sightseeing'}
${specialRequests ? `- Special requests: ${specialRequests}` : ''}

Real destination research:
${research ? `\n${research}\n` : 'Use your knowledge of this destination.'}

Real places found:
${places ? `\n${places}\n` : 'Use your knowledge.'}

Create a comprehensive trip plan. Consider the travel month for:
- Weather and what to pack
- Peak/off-peak season crowds and pricing
- Local events or festivals
- What's open or closed

Return ONLY this exact JSON structure (no markdown, no explanation):
{
  "title": "string (catchy trip title)",
  "destination": "string (city/region)",
  "country": "string",
  "summary": "string (2-3 sentences painting a picture of this trip)",
  "bestTimeToVisit": "string",
  "currentSeasonNote": "string (specific note about traveling in ${travelMonth})",
  "weatherExpectation": "string",
  "totalEstimatedCost": number,
  "budgetBreakdown": {
    "flights": number,
    "accommodation": number,
    "food": number,
    "activities": number,
    "transport": number,
    "misc": number
  },
  "flights": [
    {
      "airline": "string",
      "flightNumber": "string",
      "departure": "string (airport code)",
      "arrival": "string (airport code)",
      "departureTime": "string",
      "arrivalTime": "string",
      "duration": "string",
      "stops": number,
      "price": number,
      "bookingUrl": "string (real Google Flights URL prefilled with route and dates)"
    }
  ],
  "hotels": [
    {
      "name": "string",
      "location": "string",
      "neighborhood": "string",
      "stars": number,
      "pricePerNight": number,
      "totalPrice": number,
      "amenities": ["string"],
      "description": "string",
      "rating": number,
      "reviewCount": number,
      "bookingUrl": "string (real Booking.com URL)",
      "highlights": ["string"]
    }
  ],
  "restaurants": [
    {
      "name": "string",
      "cuisine": "string",
      "neighborhood": "string",
      "priceRange": "$ | $$ | $$$ | $$$$",
      "rating": number,
      "reviewCount": number,
      "description": "string",
      "mustTry": "string (specific dish)",
      "bestFor": "string (breakfast/lunch/dinner/drinks)"
    }
  ],
  "itinerary": [
    {
      "day": number,
      "theme": "string (day theme)",
      "morning": {
        "time": "string",
        "title": "string",
        "description": "string",
        "location": "string",
        "tips": "string",
        "cost": "string",
        "duration": "string"
      },
      "afternoon": {
        "time": "string",
        "title": "string",
        "description": "string",
        "location": "string",
        "tips": "string",
        "cost": "string",
        "duration": "string"
      },
      "evening": {
        "time": "string",
        "title": "string",
        "description": "string",
        "location": "string",
        "tips": "string",
        "cost": "string",
        "duration": "string"
      },
      "accommodation": "string",
      "estimatedCost": number
    }
  ],
  "tips": [
    {
      "category": "string (Money | Safety | Culture | Transport | Food | Health | Packing | Connectivity)",
      "title": "string",
      "content": "string (specific, actionable advice)"
    }
  ],
  "alternativeDestinations": [
    {
      "destination": "string",
      "country": "string",
      "reason": "string (why it's similar)",
      "estimatedCost": number,
      "vibe": "string",
      "highlights": ["string"]
    }
  ],
  "isOverBudget": boolean,
  "budgetDifference": number
}

${travelMode === 'fly' ? 'For flights: use realistic major airlines, real airport codes, and create Google Flights URLs like: https://www.google.com/travel/flights/search?tfs=CBwQAhopagcIARIDSkZLEgoyMDI0LTA2LTE1agwIAxIIL20vMGQ5anY' : ''}

Provide exactly ${days} days in the itinerary. Make the hotels, restaurants, and tips genuinely useful and specific to ${destination}. If the total cost exceeds the budget of $${budget}, set isOverBudget to true, calculate budgetDifference as (totalCost - budget), and provide 3 alternative destinations that fit the budget with a similar vibe.`

    // Stream the response so Vercel never times out waiting for the full completion
    const encoder = new TextEncoder()
    let fullText = ''

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = anthropic.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 6000,
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

          // Validate JSON after streaming completes
          const cleaned = fullText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
          JSON.parse(cleaned) // throws if malformed — caught below
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
