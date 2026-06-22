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

export default function AccountPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [originalSlug, setOriginalSlug] = useState('')

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [tagline, setTagline] = useState('')
  const [address, setAddress] = useState('')
  const [about, setAbout] = useState('')
  const [email, setEmail] = useState('')

  const [phoneCountryIso, setPhoneCountryIso] = useState('')
  const [phone, setPhone] = useState('')

  const [countryCode, setCountryCode] = useState('')
  const [countryName, setCountryName] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [stateName, setStateName] = useState('')
  const [cityName, setCityName] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!restaurant) {
        router.push('/dashboard/setup')
        return
      }

      setRestaurantId(restaurant.id)
      setOriginalSlug(restaurant.slug || '')
      setName(restaurant.name || '')
      setSlug(restaurant.slug || '')
      setTagline(restaurant.tagline || '')
      setAddress(restaurant.address || '')
      setAbout(restaurant.about || '')
      setEmail(restaurant.email || user.email || '')
      setPhone(restaurant.phone || '')
      setCountryCode(restaurant.country_code || '')
      setCountryName(restaurant.country || '')
      setStateName(restaurant.state || '')
      setCityName(restaurant.city || '')

      if (restaurant.phone_country_code) {
        const match = ALL_COUNTRIES.find(c => getDialCode(c) === restaurant.phone_country_code)
        if (match) setPhoneCountryIso(match.isoCode)
        else if (restaurant.country_code) setPhoneCountryIso(restaurant.country_code)
      } else if (restaurant.country_code) {
        setPhoneCountryIso(restaurant.country_code)
      }

      if (restaurant.country_code && restaurant.state) {
        const states = State.getStatesOfCountry(restaurant.country_code)
        const matchState = states.find(s => s.name === restaurant.state)
        if (matchState) setStateCode(matchState.isoCode)
      }

      setLoading(false)
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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!name.trim()) { setError('Restaurant name is required'); return }
    if (isReservedSlug(slug)) { setError(`"${slug}" is a reserved word and can't be used as your menu URL. Please choose another.`); return }
    if (!countryCode) { setError('Please select your country'); return }
    if (!phoneCountryIso) { setError('Please select your phone country code'); return }
    if (!phone.trim()) { setError('Please enter your phone number'); return }
    if (!about.trim()) { setError('Please tell us about your restaurant'); return }

    setSaving(true)

    const phoneCountry = ALL_COUNTRIES.find(c => c.isoCode === phoneCountryIso)
    const phoneDialCode = phoneCountry ? getDialCode(phoneCountry) : ''

    const { error: updateError } = await supabase
      .from('restaurants')
      .update({
        name,
        slug,
        tagline,
        address,
        about,
        phone,
        phone_country_code: phoneDialCode,
        country: countryName,
        country_code: countryCode,
        state: stateName,
        city: cityName,
      })
      .eq('id', restaurantId)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
    } else {
      setOriginalSlug(slug)
      setSuccess(true)
      setSaving(false)
      router.refresh()
    }
  }

  const inputStyle = {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #BAE6FD',
    fontSize: 15,
    width: '100%',
    outline: 'none',
    background: '#fff',
    color: '#0D1B2A',
    boxSizing: 'border-box' as const,
  }

  const disabledInputStyle = {
    ...inputStyle,
    background: '#f1f5f9',
    color: '#64748b',
    cursor: 'not-allowed' as const,
  }

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600 as const,
    display: 'block' as const,
    marginBottom: 6,
    color: '#1A3A5C',
  }

  const sectionStyle = {
    background: '#f0f9ff', borderRadius: 12, padding: 20,
    border: '1px solid #e0f2fe'
  }

  const required = <span style={{ color: '#ef4444' }}> *</span>

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' as const, color: '#0D1B2A' }}>Loading...</div>
  }

  return (
    <div style={{ maxWidth: 560, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, color: '#0D1B2A' }}>My Profile</h1>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#0D1B2A' }}>Restaurant Details</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Restaurant name{required}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Your menu URL</label>
              {slug !== originalSlug && (
                <p style={{ fontSize: 12, color: '#b45309', background: '#fef3c7', padding: '8px 10px', borderRadius: 6, margin: '0 0 8px' }}>
                  ⚠️ Changing this changes your live menu link. Any printed QR codes or shared links using the old URL will stop working.
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#0369a1', fontSize: 13, whiteSpace: 'nowrap' as const }}>menuberg.com/</span>
                <input type="text" value={slug} onChange={e => setSlug(e.target.value)} required style={{ ...inputStyle, flex: 1, width: 'auto' }} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} disabled readOnly style={disabledInputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Tagline</label>
              <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Country{required}</label>
              <SearchableSelect
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
                  width={140}
                  value={phoneCountryIso}
                  onChange={setPhoneCountryIso}
                  options={ALL_COUNTRIES.map(c => ({ value: c.isoCode, label: `${c.flag} ${getDialCode(c)} ${c.name}` }))}
                  placeholder="Code"
                  searchPlaceholder="Search..."
                />
                <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Address</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>About{required}</label>
              <textarea
                required
                value={about}
                onChange={e => setAbout(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: 1.5 }}
              />
            </div>
          </div>
        </div>

        {error && (
          <p style={{ color: '#dc2626', fontSize: 14, margin: 0 }}>{error}</p>
        )}
        {success && (
          <p style={{ color: '#16a34a', fontSize: 14, margin: 0 }}>Saved successfully.</p>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '12px',
            borderRadius: 8,
            background: '#38BDF8',
            color: '#0D1B2A',
            border: 'none',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}