import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client — bypasses RLS entirely.
 *
 * ONLY use this in server-side code that never runs in the browser:
 * API routes, webhooks, server actions. Never import this into a
 * client component or expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 *
 * This is required for:
 * - Writing to `payments` (no insert policy for anon/authenticated)
 * - Updating `pending_signups.subscription_status` (no update policy
 *   for authenticated — only service role can flip it to 'active')
 * - The Paddle webhook, which arrives with no user session at all
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars — admin client cannot be created.'
    )
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}