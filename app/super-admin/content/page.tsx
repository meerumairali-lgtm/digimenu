import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ContentClient from './ContentClient'

export const dynamic = 'force-dynamic'

export default async function ContentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'meerumairali@gmail.com') redirect('/dashboard')

  const { data: rows } = await supabase.from('landing_content').select('key, value')
  const content: Record<string, string> = {}
  ;(rows || []).forEach(r => { content[r.key] = r.value || '' })

  return <ContentClient initialContent={content} />
}
