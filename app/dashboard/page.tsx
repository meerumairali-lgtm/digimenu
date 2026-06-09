import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  console.log('user:', user?.email)

  if (!user) redirect('/login')

  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('user_id', user.id)
    .single()

  console.log('restaurant:', restaurant)
  console.log('restaurant error:', error)

  if (!restaurant) redirect('/dashboard/setup')

  return (
    <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 20px' }}>
      <h1>{restaurant.name}</h1>
      <p style={{ color: '#666' }}>{restaurant.tagline}</p>
      <p style={{ marginTop: 8, fontSize: 14 }}>
        Menu URL: <strong>digimenu.app/menu/{restaurant.slug}</strong>
      </p>

      <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <a href="/dashboard/menu" style={{ padding: '10px 20px', borderRadius: 8, background: '#000', color: '#fff', textDecoration: 'none', fontSize: 15 }}>
          Manage Menu
        </a>
        <a href="/dashboard/settings" style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #ddd', color: '#000', textDecoration: 'none', fontSize: 15 }}>
          Settings
        </a>
        <a href={`/menu/${restaurant.slug}`} target="_blank" style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #ddd', color: '#000', textDecoration: 'none', fontSize: 15 }}>
          View Menu ↗
        </a>
      </div>
      <LogoutButton />
    </div>
  )
}