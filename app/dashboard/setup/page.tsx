'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Country, State, City } from 'country-state-city'
import SearchableSelect from '../SearchableSelect'
import { isReservedSlug } from '@/lib/reservedSlugs'

const ALL_COUNTRIES = Country.getAllCountries()

function getDialCode(country: { phonecode: string }) {
  return `+${country.phonecode.replace(/^\+/, '')}`
}

export default function SetupPage() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [tagline, setTagline] = useState('')
  const [address, setAddress] = useState('')
  const [about, setAbout] = useState('')
  const [email, setEmail] = useState('') // read-only, from auth user

  const [phoneCountryIso, setPhoneCountryIso] = useState('')
  const [phone, setPhone] = useState('')

  const [countryCode, setCountryCode] = useState('')
  const [countryName, setCountryName] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [stateName, setStateName] = useState('')
  const [cityName, setCityName] = useState('')

  const [detecting, setDetecting] = useState(true)
  const [checkingExisting, setCheckingExisting] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()
  const [billing, setBilling] = useState({
    pricing_tier: 'tier_a',
    subscription_status: 'pending',
    paddle_customer_id: null as string | null,
    paddle_subscription_id: null as string | null,
    coupon_code_used: null as string | null,
    trial_started_at: new Date().toISOString() as string | null,
  })

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email || '')

      const { data: existing } = await supabase
        .from('restaurants')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (existing) {
        router.push('/dashboard/settings')
        return
      }

      setCheckingExisting(false)

      const { data: pending } = await supabase
        .from('pending_signups')
        .select('pricing_tier, subscription_status, paddle_customer_id, paddle_subscription_id, coupon_code_used, trial_started_at')
        .eq('user_id', user.id)
        .maybeSingle()

      if (pending) setBilling(pending)

      try {
        const res = await fetch('/api/dashboard/detect-country')
        const data = await res.json()
        if (data.country_code) {
          const match = ALL_COUNTRIES.find(c => c.isoCode === data.country_code)
          if (match) {
            setCountryCode(match.isoCode)
            setCountryName(match.name)
            setPhoneCountryIso(match.isoCode)
          }
        }
      } catch (e) {
        console.error('detect-country failed:', e)
      } finally {
        setDetecting(false)
      }
    }
    init()
  }, [])

  const states = useMemo(
    () => (countryCode ? State.getStatesOfCountry(countryCode) : []),
    [countryCode]
  )

  const cities = useMemo(
    () => (countryCode && stateCode ? City.getCitiesOfState(countryCode, stateCode) : []),
    [countryCode, stateCode]
  )

  function generateSlug(value: string) {
    return value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value)
    setSlug(generateSlug(e.target.value))
  }

  function handleCountryChange(isoCode: string) {
    const match = ALL_COUNTRIES.find(c => c.isoCode === isoCode)
    setCountryCode(isoCode)
    setCountryName(match?.name || '')
    setStateCode('')
    setStateName('')
    setCityName('')
  }

  function handleStateChange(isoCode: string) {
    const match = states.find(s => s.isoCode === isoCode)
    setStateCode(isoCode)
    setStateName(match?.name || '')
    setCityName('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) { setError('Restaurant name is required'); return }
    if (isReservedSlug(slug)) { setError(`"${slug}" is a reserved word and can't be used as your menu URL. Please choose another.`); return }
    if (!countryCode) { setError('Please select your country'); return }
    if (!phoneCountryIso) { setError('Please select your phone country code'); return }
    if (!phone.trim()) { setError('Please enter your phone number'); return }
    if (!about.trim()) { setError('Please tell us about your restaurant'); return }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const phoneCountry = ALL_COUNTRIES.find(c => c.isoCode === phoneCountryIso)
    const phoneDialCode = phoneCountry ? getDialCode(phoneCountry) : ''

    // Read referral from server-side HTTP-only cookie — tamper-proof
    let referredBy: string | null = null
    let resolvedReferralCode: string | null = null
    try {
      const refRes = await fetch('/api/affiliates/apply-referral')
      if (refRes.ok) {
        const refData = await refRes.json()
        if (refData.referral) {
          referredBy = refData.referral.affiliate_id
          resolvedReferralCode = refData.referral.code
        }
      }
    } catch {
      // Non-fatal
    }
    const { data: newRestaurant, error } = await supabase.from('restaurants').insert({
      user_id: user.id,
      name,
      slug,
      tagline,
      address,
      about,
      email,
      phone,
      phone_country_code: phoneDialCode,
      country: countryName,
      country_code: countryCode,
      state: stateName,
      city: cityName,
      referral_code: resolvedReferralCode,
      referred_by: referredBy,
      ...billing,
    }).select('id').single()

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // If the user paid BEFORE finishing setup, the Paddle webhook
      // inserted their payment row with restaurant_id = null, since no
      // restaurant existed yet at that moment. Now that the restaurant
      // exists, backfill any orphaned payment(s) tied to this user's
      // Paddle customer ID so billing history shows up correctly.
      // Routed through an API route (not the regular client) because
      // RLS on payments only allows SELECT, not UPDATE, for normal users.
      if (billing.paddle_customer_id && newRestaurant?.id) {
        try {
          const res = await fetch('/api/setup/backfill-payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              restaurant_id: newRestaurant.id,
              paddle_customer_id: billing.paddle_customer_id,
            }),
          })
          if (!res.ok) {
            console.error('Failed to backfill orphaned payment rows')
          }
        } catch (backfillErr) {
          console.error('Failed to backfill orphaned payment rows:', backfillErr)
          // Non-fatal — don't block the user
        }
      }

      await supabase.from('pending_signups').delete().eq('user_id', user.id)
      // Clear referral cookie now that it's been applied
      try { await fetch('/api/affiliates/apply-referral', { method: 'DELETE' }) } catch { }

      // ... rest of existing else block unchanged

      router.refresh()
      router.push('/dashboard')
    }
  }

  const inputStyle = {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #BAE6FD',
    fontSize: 15,
    width: '100%',
    outline: 'none',
    background: '#f0f9ff',
    color: '#0D1B2A',
    boxSizing: 'border-box' as const,
  }

  const disabledInputStyle = {
    ...inputStyle,
    background: '#0a1622',
    color: '#7DD3FC',
    cursor: 'not-allowed' as const,
  }

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600 as const,
    display: 'block' as const,
    marginBottom: 6,
    color: '#1A3A5C',
  }

  const required = <span style={{ color: '#ef4444' }}> *</span>

  if (checkingExisting) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1B2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#7DD3FC', fontSize: 14 }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B2A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 480, background: '#112240', borderRadius: 16, padding: '40px 32px', border: '1px solid rgba(56,189,248,0.15)' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, background: 'rgba(56,189,248,0.1)', borderRadius: 12, marginBottom: 16, border: '1px solid rgba(56,189,248,0.2)' }}>
            <span style={{ fontSize: 24 }}>🍽️</span>
          </div>
          <h1 style={{ margin: 0, color: '#ffffff', fontSize: 22, fontWeight: 700 }}>
            Set up your restaurant
          </h1>
          <p style={{ color: '#7DD3FC', fontSize: 14, marginTop: 8 }}>
            Takes a minute. You can change everything later.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Restaurant name{required}</label>
            <input type="text" value={name} onChange={handleNameChange} required style={inputStyle} placeholder="Spicy Box" />
          </div>

          <div>
            <label style={labelStyle}>Your menu URL</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#7DD3FC', fontSize: 13, whiteSpace: 'nowrap' as const }}>menuberg.com/</span>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value)} required style={{ ...inputStyle, flex: 1, width: 'auto' }} placeholder="spicy-box" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} disabled readOnly style={disabledInputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Tagline</label>
            <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} style={inputStyle} placeholder="Taste the Spice!" />
          </div>

          <div>
            <label style={labelStyle}>
              Country{required}
              {detecting && <span style={{ color: '#7DD3FC', fontWeight: 400, marginLeft: 6 }}>(detecting your location...)</span>}
            </label>
            <SearchableSelect
              variant="dark"
              value={countryCode}
              onChange={handleCountryChange}
              options={ALL_COUNTRIES.map(c => ({ value: c.isoCode, label: `${c.flag} ${c.name}` }))}
              placeholder="Select country"
              searchPlaceholder="Search countries..."
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>State / Province</label>
              <SearchableSelect
                variant="dark"
                value={stateCode}
                onChange={handleStateChange}
                options={states.map(s => ({ value: s.isoCode, label: s.name }))}
                placeholder={states.length === 0 ? 'N/A' : 'Select state'}
                searchPlaceholder="Search states..."
                disabled={!countryCode || states.length === 0}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>City</label>
              <SearchableSelect
                variant="dark"
                value={cityName}
                onChange={setCityName}
                options={cities.map(c => ({ value: c.name, label: c.name }))}
                placeholder={cities.length === 0 ? 'N/A' : 'Select city'}
                searchPlaceholder="Search cities..."
                disabled={!stateCode || cities.length === 0}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Phone{required}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <SearchableSelect
                variant="dark"
                width={140}
                value={phoneCountryIso}
                onChange={setPhoneCountryIso}
                options={ALL_COUNTRIES.map(c => ({ value: c.isoCode, label: `${c.flag} ${getDialCode(c)} ${c.name}` }))}
                placeholder="Code"
                searchPlaceholder="Search..."
              />
              <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} style={{ ...inputStyle, flex: 1 }} placeholder="3001234567" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Address</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} placeholder="123 Food Street" />
          </div>

          <div>
            <label style={labelStyle}>About{required}</label>
            <textarea
              required
              value={about}
              onChange={e => setAbout(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: 1.5 }}
              placeholder="Tell customers about your restaurant, your story, what makes you special..."
            />
          </div>

          {error && (
            <p style={{ color: '#f87171', fontSize: 14, margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px',
              borderRadius: 8,
              background: '#38BDF8',
              color: '#0D1B2A',
              border: 'none',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: 8,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating...' : 'Create my restaurant →'}
          </button>
        </form>
      </div>
    </div>
  )
}