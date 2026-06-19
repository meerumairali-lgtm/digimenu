import { createClient } from '@/lib/supabase/server'
import { logAuditAction } from '@/lib/audit'
import { NextResponse } from 'next/server'

const SUPER_ADMIN_EMAIL = 'meerumairali@gmail.com'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, bypass, name } = await req.json()

  const { error } = await supabase
    .from('restaurants')
    .update({ bypass_payment: bypass })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logAuditAction({
    admin_email: user.email,
    action: bypass ? 'enable_payment_bypass' : 'disable_payment_bypass',
    target_type: 'restaurant',
    target_id: id,
    target_name: name,
  })

  return NextResponse.json({ success: true })
}