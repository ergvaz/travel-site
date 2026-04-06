import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { tripData, formData, userId } = await req.json()

    const { data, error } = await supabaseAdmin
      .from('trips')
      .insert({
        user_id: userId,
        title: tripData.title,
        destination: tripData.destination,
        country: tripData.country,
        budget: formData.budget,
        days: formData.days,
        travel_mode: formData.travelMode,
        starting_address: formData.startingAddress,
        preferences: formData.preferences,
        special_requests: formData.specialRequests,
        start_date: formData.startDate || null,
        itinerary: tripData,
        total_estimated_cost: tripData.totalEstimatedCost,
        is_public: false,
      })
      .select()
      .single()

    if (error) throw error

    // Award achievements
    await checkAndAwardAchievements(userId)

    return NextResponse.json({ success: true, trip: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save trip' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const publicOnly = searchParams.get('public') === 'true'
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    let query = supabaseAdmin
      .from('trips')
      .select('*, profiles(username, full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (publicOnly) {
      query = query.eq('is_public', true)
    } else if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ success: true, trips: data })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch trips' }, { status: 500 })
  }
}

async function checkAndAwardAchievements(userId: string) {
  const { count } = await supabaseAdmin
    .from('trips')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const achievements = []

  if (count === 1) {
    achievements.push({
      user_id: userId,
      type: 'first_journey',
      label: 'First Journey',
      description: 'Planned your very first trip',
      icon: '✈️',
    })
  }
  if (count === 5) {
    achievements.push({
      user_id: userId,
      type: 'explorer',
      label: 'Explorer',
      description: 'Planned 5 adventures',
      icon: '🧭',
    })
  }
  if (count === 10) {
    achievements.push({
      user_id: userId,
      type: 'globetrotter',
      label: 'Globetrotter',
      description: 'Planned 10 trips around the world',
      icon: '🌍',
    })
  }

  if (achievements.length > 0) {
    await supabaseAdmin.from('achievements').upsert(achievements, { onConflict: 'user_id,type' })
  }
}
