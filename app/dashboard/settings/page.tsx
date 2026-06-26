'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Country, State, City } from 'country-state-city'
import SearchableSelect from '../SearchableSelect'
import { isReservedSlug } from '@/lib/reservedSlugs'

const ALL_COUNTRIES = Country.getAllCountries()

function getDialCode(country: { phonecode: string }) {
  return `+${country.phonecode.replace(/^\+/, '')}`
}

const THEMES = [
  { id: 'light', label: 'Light', bg: '#ffffff', accent: '#38BDF8' },
  { id: 'dark', label: 'Dark', bg: '#111111', accent: '#38BDF8' },
  { id: 'gold', label: 'Gold', bg: '#1a1200', accent: '#d4a017' },
  { id: 'vibrant', label: 'Vibrant', bg: '#0f172a', accent: '#38BDF8' },
]

const CURRENCIES = [
  { code: 'PKR', label: 'PKR — Pakistani Rupee' },
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'AED', label: 'AED — UAE Dirham' },
  { code: 'SAR', label: 'SAR — Saudi Riyal' },
  { code: 'INR', label: 'INR — Indian Rupee' },
]

const LAYOUTS = [
  { id: 'classic', label: 'Classic', desc: 'Clean list, no images', icon: '☰' },
  { id: 'list', label: 'List', desc: 'Rows with small thumbnail', icon: '▤' },
  { id: 'cards', label: 'Cards', desc: 'Grid with big images', icon: '⊞' },
  { id: 'swipe', label: 'Swipe', desc: 'Horizontal carousel', icon: '⟺' },
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

type DayHours = { open: string; close: string; closed: boolean }
type OpeningHours = Record<string, DayHours>

type HeroSlide = { image_url: string; title: string; caption: string }

const MIN_HERO_SLIDES = 2
const MAX_HERO_SLIDES = 5
const HERO_TITLE_MAX = 30
const HERO_CAPTION_MAX = 100

const defaultHours = (): OpeningHours =>
  Object.fromEntries(DAYS.map(d => [d, { open: '09:00', close: '22:00', closed: false }]))

type Tab = 'info' | 'design'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('info')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    name: '', slug: '', tagline: '',
    address: '', whatsapp: '', instagram: '', facebook: '',
    theme: 'light', currency: 'PKR', layout: 'classic',
    about: '', google_maps_url: '',
  })

  const [email, setEmail] = useState('')

  const [phoneCountryIso, setPhoneCountryIso] = useState('')
  const [phone, setPhone] = useState('')

  const [countryCode, setCountryCode] = useState('')
  const [countryName, setCountryName] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [stateName, setStateName] = useState('')
  const [cityName, setCityName] = useState('')
  const [detectingLocation, setDetectingLocation] = useState(false)

  const [openingHours, setOpeningHours] = useState<OpeningHours>(defaultHours())

  const [restaurantId, setRestaurantId] = useState('')

  const [logoUrl, setLogoUrl] = useState('')
  const [logoUploading, setLogoUploading] = useState(false)
  const logoFileRef = useRef<HTMLInputElement>(null)

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [heroUploadingIndex, setHeroUploadingIndex] = useState<number | null>(null)
  const heroFileRefs = useRef<Record<number, HTMLInputElement | null>>({})

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }
        setEmail(user.email || '')

        const { data, error: fetchError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (fetchError) {
          console.error('Failed to load restaurant:', fetchError)
          return
        }
        if (!data) return

        setRestaurantId(data.id)

        setForm({
          name: data.name || '',
          slug: data.slug || '',
          tagline: data.tagline || '',
          address: data.address || '',
          whatsapp: data.whatsapp || '',
          instagram: data.instagram || '',
          facebook: data.facebook || '',
          theme: data.theme || 'light',
          currency: data.currency || 'PKR',
          layout: data.layout || 'classic',
          about: data.about || '',
          google_maps_url: data.google_maps_url || '',
        })
        setPhone(data.phone || '')
        if (data.opening_hours) setOpeningHours(data.opening_hours)

        if (data.logo_url) setLogoUrl(data.logo_url)
        if (Array.isArray(data.hero_slides) && data.hero_slides.length > 0) {
          // Older saved slides (from before titles existed) won't have
          // a title field yet — default it to an empty string so the
          // input doesn't break on an undefined value.
          setHeroSlides(data.hero_slides.map((s: any) => ({
            image_url: s.image_url || '',
            title: s.title || '',
            caption: s.caption || '',
          })))
        } else {
          setHeroSlides([
            { image_url: '', title: '', caption: '' },
            { image_url: '', title: '', caption: '' },
          ])
        }

        if (data.country_code) {
          try {
            setCountryCode(data.country_code)
            setCountryName(data.country || '')
            const statesForCountry = State.getStatesOfCountry(data.country_code)
            const matchedState = statesForCountry.find(s => s.name === data.state)
            setStateCode(matchedState?.isoCode || '')
            setStateName(data.state || '')
            setCityName(data.city || '')
          } catch (e) {
            console.error('Error reading saved location, falling back to detection:', e)
            setCountryCode('')
            setCountryName('')
          }
        } else {
          setDetectingLocation(true)
          try {
            const res = await fetch('/api/dashboard/detect-country')
            const geo = await res.json()
            if (geo.country_code) {
              const match = ALL_COUNTRIES.find(c => c.isoCode === geo.country_code)
              if (match) {
                setCountryCode(match.isoCode)
                setCountryName(match.name)
              }
            }
          } catch (e) {
            console.error('detect-country fetch failed:', e)
          } finally {
            setDetectingLocation(false)
          }
        }

        if (data.phone_country_code) {
          const matchedPhoneCountry = ALL_COUNTRIES.find(c => getDialCode(c) === data.phone_country_code)
          setPhoneCountryIso(matchedPhoneCountry?.isoCode || '')
        }
      } catch (e) {
        console.error('Settings load error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
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

  function updateDay(day: string, field: keyof DayHours, value: string | boolean) {
    setOpeningHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }))
  }

  async function handleLogoUpload(file: File) {
    if (!restaurantId) return
    setLogoUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `${restaurantId}/logo-${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('restaurant-branding').upload(fileName, file, { upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('restaurant-branding').getPublicUrl(fileName)
      setLogoUrl(urlData.publicUrl)
    }
    setLogoUploading(false)
  }

  async function handleHeroImageUpload(index: number, file: File) {
    if (!restaurantId) return
    setHeroUploadingIndex(index)
    const ext = file.name.split('.').pop()
    const fileName = `${restaurantId}/hero-${Date.now()}-${index}.${ext}`
    const { data, error } = await supabase.storage.from('restaurant-branding').upload(fileName, file, { upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('restaurant-branding').getPublicUrl(fileName)
      setHeroSlides(slides => slides.map((s, i) => i === index ? { ...s, image_url: urlData.publicUrl } : s))
    }
    setHeroUploadingIndex(null)
  }

  function updateHeroTitle(index: number, title: string) {
    setHeroSlides(slides => slides.map((s, i) => i === index ? { ...s, title: title.slice(0, HERO_TITLE_MAX) } : s))
  }

  function updateHeroCaption(index: number, caption: string) {
    setHeroSlides(slides => slides.map((s, i) => i === index ? { ...s, caption: caption.slice(0, HERO_CAPTION_MAX) } : s))
  }

  function addHeroSlide() {
    if (heroSlides.length >= MAX_HERO_SLIDES) return
    setHeroSlides(slides => [...slides, { image_url: '', title: '', caption: '' }])
  }

  function removeHeroSlide(index: number) {
    if (heroSlides.length <= MIN_HERO_SLIDES) return
    setHeroSlides(slides => slides.filter((_, i) => i !== index))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (isReservedSlug(form.slug)) { setError(`"${form.slug}" is a reserved word and can't be used as your menu URL. Please choose another.`); setActiveTab('info'); return }
    if (!countryCode) { setError('Please select your country'); setActiveTab('info'); return }
    if (!phoneCountryIso) { setError('Please select your phone country code'); setActiveTab('info'); return }

    const completeSlides = heroSlides.filter(s => s.image_url)
    if (completeSlides.length < MIN_HERO_SLIDES) {
      setError(`Please add at least ${MIN_HERO_SLIDES} hero images before saving.`)
      setActiveTab('design')
      return
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const phoneCountry = ALL_COUNTRIES.find(c => c.isoCode === phoneCountryIso)
    const phoneDialCode = phoneCountry ? getDialCode(phoneCountry) : ''

    const { error } = await supabase.from('restaurants').update({
      ...form,
      email,
      phone,
      phone_country_code: phoneDialCode,
      country: countryName,
      country_code: countryCode,
      state: stateName,
      city: cityName,
      opening_hours: openingHours,
      logo_url: logoUrl || null,
      hero_slides: completeSlides,
    }).eq('user_id', user.id)
    if (error) setError(error.message)
    else setSuccess('Saved successfully!')
    setSaving(false)
  }

  const inputStyle = {
    padding: '10px 14px', borderRadius: 8,
    border: '1px solid #ddd', fontSize: 14, width: '100%',
    boxSizing: 'border-box' as const, outline: 'none',
  }

  const disabledInputStyle = {
    ...inputStyle,
    background: '#f3f4f6',
    color: '#888',
    cursor: 'not-allowed' as const,
  }

  const labelStyle = {
    fontSize: 13, fontWeight: 600 as const,
    display: 'block' as const, marginBottom: 6, color: '#444'
  }

  const sectionStyle = {
    background: '#f0f9ff', borderRadius: 12, padding: 20,
    border: '1px solid #e0f2fe'
  }

  const required = <span style={{ color: '#ef4444' }}> *</span>

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center' as const, color: '#0D1B2A' }}>Loading...</div>
  )

  return (
    <div style={{ maxWidth: 560, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: '#0D1B2A' }}>Restaurant Settings</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#f0f9ff', borderRadius: 10, padding: 4, border: '1px solid #e0f2fe' }}>
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          style={{
            flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: activeTab === 'info' ? '#38BDF8' : 'transparent',
            color: activeTab === 'info' ? '#0D1B2A' : '#666',
            fontSize: 14, fontWeight: 600,
          }}
        >
          Restaurant info
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('design')}
          style={{
            flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: activeTab === 'design' ? '#38BDF8' : 'transparent',
            color: activeTab === 'design' ? '#0D1B2A' : '#666',
            fontSize: 14, fontWeight: 600,
          }}
        >
          Design
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ───────────── TAB: RESTAURANT INFO ───────────── */}
        <div style={{ display: activeTab === 'info' ? 'flex' : 'none', flexDirection: 'column', gap: 20 }}>

          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#0D1B2A' }}>Basic info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Restaurant name{required}</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label style={labelStyle}>Tagline</label>
                <input style={inputStyle} value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} placeholder="Taste the Spice!" />
              </div>
              <div>
                <label style={labelStyle}>Menu URL slug</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: '#888', whiteSpace: 'nowrap' }}>menuberg.com/</span>
                  <input style={{ ...inputStyle, flex: 1 }} value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required />
                </div>
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: 15, color: '#0D1B2A' }}>About your restaurant{required}</h3>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#888' }}>Shown in the About section of your menu page</p>
            <textarea
              required
              value={form.about}
              onChange={e => setForm({ ...form, about: e.target.value })}
              placeholder="Tell your customers about your restaurant, your story, what makes you special..."
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: 15, color: '#0D1B2A' }}>Location</h3>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#888' }}>Where your restaurant is based</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>
                  Country{required}
                  {detectingLocation && <span style={{ color: '#38BDF8', fontWeight: 400, marginLeft: 6 }}>(detecting...)</span>}
                </label>
                <SearchableSelect
                  variant="light"
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
                    variant="light"
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
                    variant="light"
                    value={cityName}
                    onChange={setCityName}
                    options={cities.map(c => ({ value: c.name, label: c.name }))}
                    placeholder={cities.length === 0 ? 'N/A' : 'Select city'}
                    searchPlaceholder="Search cities..."
                    disabled={!stateCode || cities.length === 0}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: 15, color: '#0D1B2A' }}>Opening hours</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#888' }}>Set your hours for each day of the week</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DAYS.map(day => {
                const h = openingHours[day] || { open: '09:00', close: '22:00', closed: false }
                return (
                  <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fff', borderRadius: 8, border: '1px solid #e0f2fe' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0D1B2A', width: 90, flexShrink: 0 }}>{day.slice(0, 3)}</span>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }}>
                      <input
                        type="checkbox"
                        checked={h.closed}
                        onChange={e => updateDay(day, 'closed', e.target.checked)}
                        style={{ accentColor: '#38BDF8', width: 14, height: 14 }}
                      />
                      <span style={{ fontSize: 12, color: h.closed ? '#ef4444' : '#888' }}>Closed</span>
                    </label>

                    {!h.closed && (
                      <>
                        <input
                          type="time"
                          value={h.open}
                          onChange={e => updateDay(day, 'open', e.target.value)}
                          style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, flex: 1 }}
                        />
                        <span style={{ fontSize: 12, color: '#888', flexShrink: 0 }}>to</span>
                        <input
                          type="time"
                          value={h.close}
                          onChange={e => updateDay(day, 'close', e.target.value)}
                          style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, flex: 1 }}
                        />
                      </>
                    )}

                    {h.closed && (
                      <span style={{ fontSize: 13, color: '#ccc', fontStyle: 'italic' }}>— Closed all day —</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#0D1B2A' }}>Contact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Phone{required}</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <SearchableSelect
                    variant="light"
                    width={140}
                    value={phoneCountryIso}
                    onChange={setPhoneCountryIso}
                    options={ALL_COUNTRIES.map(c => ({ value: c.isoCode, label: `${c.flag} ${getDialCode(c)} ${c.name}` }))}
                    placeholder="Code"
                    searchPlaceholder="Search..."
                  />
                  <input required style={{ ...inputStyle, flex: 1 }} value={phone} onChange={e => setPhone(e.target.value)} placeholder="3001234567" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={disabledInputStyle} type="email" value={email} disabled readOnly />
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#888' }}>This is your account login email and can't be changed here.</p>
              </div>
              <div>
                <label style={labelStyle}>Address</label>
                <input style={inputStyle} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="123 Food Street" />
              </div>
              <div>
                <label style={labelStyle}>Google Maps URL</label>
                <input
                  style={inputStyle}
                  value={form.google_maps_url}
                  onChange={e => setForm({ ...form, google_maps_url: e.target.value })}
                  placeholder="https://maps.google.com/..."
                />
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#888' }}>Paste the link from Google Maps → Share → Copy link</p>
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#0D1B2A' }}>Social media</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>WhatsApp number</label>
                <input style={inputStyle} value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="923001234567" />
              </div>
              <div>
                <label style={labelStyle}>Instagram handle</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: '#888' }}>instagram.com/</span>
                  <input style={{ ...inputStyle, flex: 1 }} value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="spicybox" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Facebook handle</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: '#888' }}>facebook.com/</span>
                  <input style={{ ...inputStyle, flex: 1 }} value={form.facebook} onChange={e => setForm({ ...form, facebook: e.target.value })} placeholder="spicybox" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ───────────── TAB: DESIGN ───────────── */}
        <div style={{ display: activeTab === 'design' ? 'flex' : 'none', flexDirection: 'column', gap: 20 }}>

          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: 15, color: '#0D1B2A' }}>Logo</h3>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#888' }}>Shown next to your restaurant name on the menu page</p>
            <div
              onClick={() => logoFileRef.current?.click()}
              style={{ border: '1px dashed #bae6fd', borderRadius: 8, padding: 14, textAlign: 'center', cursor: 'pointer', background: '#f0f9ff' }}
            >
              {logoUploading ? (
                <p style={{ margin: 0, fontSize: 13, color: '#888' }}>Uploading...</p>
              ) : logoUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <img src={logoUrl} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover' }} />
                  <p style={{ margin: 0, fontSize: 13, color: '#38BDF8' }}>Tap to change logo</p>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: '#888' }}>Tap to upload a logo <span style={{ color: '#aaa' }}>(optional)</span></p>
              )}
              <input ref={logoFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f) }} />
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: 15, color: '#0D1B2A' }}>Hero carousel{required}</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#888' }}>
              The rotating images customers see first. Add {MIN_HERO_SLIDES}–{MAX_HERO_SLIDES} images. For best results use landscape photos around 1600×900px.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {heroSlides.map((slide, index) => (
                <div key={index} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e0f2fe', padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#888' }}>Slide {index + 1}</span>
                    {heroSlides.length > MIN_HERO_SLIDES && (
                      <button
                        type="button"
                        onClick={() => removeHeroSlide(index)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div
                    onClick={() => heroFileRefs.current[index]?.click()}
                    style={{ border: '1px dashed #bae6fd', borderRadius: 8, padding: 12, textAlign: 'center', cursor: 'pointer', background: '#f0f9ff', marginBottom: 10 }}
                  >
                    {heroUploadingIndex === index ? (
                      <p style={{ margin: 0, fontSize: 13, color: '#888' }}>Uploading...</p>
                    ) : slide.image_url ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={slide.image_url} alt="" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }} />
                        <p style={{ margin: 0, fontSize: 13, color: '#38BDF8' }}>Tap to change image</p>
                      </div>
                    ) : (
                      <p style={{ margin: 0, fontSize: 13, color: '#888' }}>Tap to upload image</p>
                    )}
                    <input
                      ref={el => { heroFileRefs.current[index] = el }}
                      type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleHeroImageUpload(index, f) }}
                    />
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <label style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>Title</label>
                      <span style={{ fontSize: 11, color: '#aaa' }}>{slide.title.length}/{HERO_TITLE_MAX}</span>
                    </div>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={e => updateHeroTitle(index, e.target.value)}
                      placeholder="e.g. Weekend special"
                      maxLength={HERO_TITLE_MAX}
                      style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, width: '100%', boxSizing: 'border-box' as const }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <label style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>Description</label>
                      <span style={{ fontSize: 11, color: '#aaa' }}>{slide.caption.length}/{HERO_CAPTION_MAX}</span>
                    </div>
                    <input
                      type="text"
                      value={slide.caption}
                      onChange={e => updateHeroCaption(index, e.target.value)}
                      placeholder="e.g. 20% off all pizzas, this weekend only"
                      maxLength={HERO_CAPTION_MAX}
                      style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, width: '100%', boxSizing: 'border-box' as const }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {heroSlides.length < MAX_HERO_SLIDES && (
              <button
                type="button"
                onClick={addHeroSlide}
                style={{ marginTop: 12, padding: '9px 16px', borderRadius: 8, border: '1px dashed #bae6fd', background: '#f0f9ff', cursor: 'pointer', fontSize: 13, color: '#38BDF8', fontWeight: 600 }}
              >
                + Add another slide
              </button>
            )}
          </div>

          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: 15, color: '#0D1B2A' }}>Menu theme</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#888' }}>How your public menu page looks to customers</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {THEMES.map(t => (
                <div
                  key={t.id}
                  onClick={() => setForm({ ...form, theme: t.id })}
                  style={{
                    cursor: 'pointer', borderRadius: 10, overflow: 'hidden',
                    border: form.theme === t.id ? '2px solid #38BDF8' : '2px solid transparent',
                    outline: form.theme === t.id ? '1px solid #38BDF8' : '1px solid #e5e5e5',
                  }}
                >
                  <div style={{ background: t.bg, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 24, height: 4, borderRadius: 2, background: t.accent, opacity: 0.8 }} />
                  </div>
                  <div style={{ padding: '6px 8px', background: '#fff', textAlign: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: form.theme === t.id ? 600 : 400, color: form.theme === t.id ? '#38BDF8' : '#555' }}>
                      {t.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: 15, color: '#0D1B2A' }}>Menu layout</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#888' }}>How items are displayed to customers</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {LAYOUTS.map(l => (
                <div
                  key={l.id}
                  onClick={() => setForm({ ...form, layout: l.id })}
                  style={{
                    cursor: 'pointer', borderRadius: 10, padding: '14px 16px',
                    border: form.layout === l.id ? '2px solid #38BDF8' : '2px solid #e5e5e5',
                    background: form.layout === l.id ? '#e0f2fe' : '#fff',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{l.icon}</div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: form.layout === l.id ? '#0D1B2A' : '#333' }}>{l.label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>{l.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: 15, color: '#0D1B2A' }}>Currency</h3>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#888' }}>Shown next to prices on your menu</p>
            <select
              value={form.currency}
              onChange={e => setForm({ ...form, currency: e.target.value })}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Shared save area — visible regardless of which tab is active */}
        {error && <p style={{ color: '#ef4444', fontSize: 14 }}>{error}</p>}
        {success && <p style={{ color: '#16a34a', fontSize: 14 }}>{success}</p>}

        <button
          type="submit"
          disabled={saving}
          style={{ padding: '12px', borderRadius: 8, background: '#38BDF8', color: '#0D1B2A', border: 'none', fontSize: 15, cursor: 'pointer', fontWeight: 700, marginBottom: 40 }}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}