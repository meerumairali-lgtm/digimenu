'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      style={{ marginTop: 16, padding: '10px 20px', borderRadius: 8, background: '#ff4444', color: '#fff', border: 'none', fontSize: 15, cursor: 'pointer' }}
    >
      Log out
    </button>
  )
}