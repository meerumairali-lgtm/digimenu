import { createClient } from '@/lib/supabase/server'
import AuditClient from './AuditClient'

export const dynamic = 'force-dynamic'

export default async function AuditPage() {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Audit Logs</h1>
      <p className="text-gray-400 text-sm mb-6">All admin actions are recorded here.</p>
      <AuditClient logs={logs ?? []} />
    </div>
  )
}