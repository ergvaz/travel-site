import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { GeneratedTrip } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { message, trip, history } = await req.json() as {
      message: string
      trip: GeneratedTrip
      history: Array<{ role: 'user' | 'assistant'; content: string }>
    }

    const systemPrompt = `You are an expert travel planner assistant. The user has already generated a trip plan and wants to refine it.

Current trip plan:
- Destination: ${trip.destination}, ${trip.country}
- Duration: ${trip.itinerary?.length || 0} days
- Total estimated cost: $${trip.totalEstimatedCost}
- Budget breakdown: Flights $${trip.budgetBreakdown?.flights}, Hotels $${trip.budgetBreakdown?.accommodation}, Food $${trip.budgetBreakdown?.food}

You help them modify and improve the trip. You can:
1. Swap out hotels or restaurants for better alternatives
2. Adjust the itinerary for specific days
3. Suggest cost-saving options
4. Add specific activities they request
5. Address concerns about the trip

Be conversational, specific, and genuinely helpful. When suggesting changes, be concrete with names and details. Keep responses concise but thorough.`

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...history.slice(-6),
      { role: 'user', content: message },
    ]

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response')

    return NextResponse.json({ success: true, message: content.text })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get response' },
      { status: 500 }
    )
  }
}
