import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('trips')
    .select('*, profiles(username, full_name, avatar_url)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: 'Trip not found' }, { status: 404 })

  // Increment view count
  await supabaseAdmin.from('trips').update({ view_count: (data.view_count || 0) + 1 }).eq('id', id)

  return NextResponse.json({ success: true, trip: data })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const updates = await req.json()
  const { data, error } = await supabaseAdmin
    .from('trips')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 })
  return NextResponse.json({ success: true, trip: data })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error } = await supabaseAdmin.from('trips').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 })
  return NextResponse.json({ success: true })
}
