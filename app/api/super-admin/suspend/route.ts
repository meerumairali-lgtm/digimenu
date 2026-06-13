import { createClient } from '@/lib/supabase/server'
import { logAuditAction } from '@/lib/audit'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== 'meerumairali@gmail.com') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, suspend, name } = await req.json()

  await supabase.from('restaurants').update({ is_suspended: suspend }).eq('id', id)

  await logAuditAction({
    admin_email: user.email,
    action: suspend ? 'suspend' : 'unsuspend',
    target_type: 'restaurant',
    target_id: id,
    target_name: name,
  })

  return NextResponse.json({ success: true })
}