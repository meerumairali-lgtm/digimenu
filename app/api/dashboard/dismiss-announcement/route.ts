import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { announcement_id } = await req.json()

  if (!announcement_id) {
    return NextResponse.json({ error: 'Missing announcement_id' }, { status: 400 })
  }

  const { error } = await supabase.from('dismissed_announcements').upsert({
    user_id: user.id,
    announcement_id,
  }, {
    onConflict: 'user_id,announcement_id'
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}