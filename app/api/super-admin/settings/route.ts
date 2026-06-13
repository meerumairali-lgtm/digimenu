import { createClient } from '@/lib/supabase/server'
import { logAuditAction } from '@/lib/audit'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== 'meerumairali@gmail.com') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { settings } = await req.json()

  for (const s of settings) {
    await supabase
      .from('platform_settings')
      .upsert({ key: s.key, value: s.value }, { onConflict: 'key' })
  }

  await logAuditAction({
    admin_email: user.email,
    action: 'update_settings',
    target_type: 'platform',
    target_name: 'Platform Settings',
    metadata: { settings },
  })

  return NextResponse.json({ success: true })
}