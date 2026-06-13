import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

const SUPER_ADMIN_EMAIL = 'meerumairali@gmail.com'

export default async function SuperAdminSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== SUPER_ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  const { data: settings } = await supabase
    .from('platform_settings')
    .select('key, value')

  const settingsMap: Record<string, string> = {}
  settings?.forEach((s) => {
    settingsMap[s.key] = s.value
  })

  return <SettingsClient initialSettings={settingsMap} />
}