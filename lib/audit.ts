import { createClient } from '@/lib/supabase/server'

export async function logAuditAction({
  admin_email,
  action,
  target_type,
  target_id,
  target_name,
  metadata,
}: {
  admin_email: string
  action: string
  target_type: string
  target_id?: string
  target_name?: string
  metadata?: Record<string, unknown>
}) {
  const supabase = await createClient()
  await supabase.from('audit_logs').insert({
    admin_email,
    action,
    target_type,
    target_id,
    target_name,
    metadata,
  })
}