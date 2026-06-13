import { createClient } from '@/lib/supabase/server'
import { logAuditAction } from '@/lib/audit'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== 'meerumairali@gmail.com') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { updates } = await req.json()

  for (const { key, value } of updates) {
    await supabase
      .from('landing_content')
      .upsert({ key, value }, { onConflict: 'key' })
  }

  await logAuditAction({
    admin_email: user.email,
    action: 'update_content',
    target_type: 'landing_page',
    target_name: 'Landing Page Content',
  })

  return NextResponse.json({ success: true })
}