'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Country, State, City } from 'country-state-city'
import SearchableSelect from '../SearchableSelect'
import { isReservedSlug } from '@/lib/reservedSlugs'
import MarkdownEditor from '@/app/components/MarkdownEditor'
import { compressImage } from '@/lib/imageCompression'
import { Pencil } from 'lucide-react'


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

// One searchable entry per country, mapping to that country's currency.
const CURRENCY_OPTIONS = ALL_COUNTRIES
  .filter(c => !!c.currency)
  .map(c => ({
    value: c.currency,
    label: `${c.flag} ${c.name} — ${c.currency}`,
    key: c.isoCode, // unique per entry, even though value repeats
  }))

function currencyDisplayLabel(code: string): string {
  return code ? `Currency: ${code}` : ''
}

function currencyForCountryCode(isoCode: string): string {
  const match = ALL_COUNTRIES.find(c => c.isoCode === isoCode)
  return match?.currency || 'USD'
}

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

// Two starter placeholder cover images so a brand-new restaurant isn't
// blocked from saving until they upload their own photos. Swap these
// two URLs out anytime for your own permanently-hosted defaults —
// nothing else in the code needs to change.
const DEFAULT_COVER_SLIDES: HeroSlide[] = [
  {
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80',
    title: 'Welcome',
    caption: 'Add your own photos anytime in Cover Slides',
  },
  {
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80',
    title: 'Fresh & delicious',
    caption: 'Customize this with your best dishes',
  },
]

const defaultHours = (): OpeningHours =>
  Object.fromEntries(DAYS.map(d => [d, { open: '09:00', close: '22:00', closed: false }]))

type Tab = 'basic' | 'cover' | 'about' | 'hours' | 'contact' | 'theme'

const TABS: { id: Tab; label: string }[] = [
  { id: 'basic', label: 'Basic info' },
  { id: 'cover', label: 'Cover slides' },
  { id: 'about', label: 'About & location' },
  { id: 'hours', label: 'Hours' },
  { id: 'contact', label: 'Contact' },
  { id: 'theme', label: 'Theme & layout' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('basic')
  const [tabErrors, setTabErrors] = useState<Set<Tab>>(new Set())

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    name: '', slug: '', tagline: '',
    address: '', whatsapp: '', instagram: '', facebook: '',
    theme: 'light', currency: '', layout: 'classic',
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

  const [editingSlug, setEditingSlug] = useState(false)
  const [showSlugWarning, setShowSlugWarning] = useState(false)

  const [ctaEnabled, setCtaEnabled] = useState(false)
  const [ctaType, setCtaType] = useState<'call' | 'whatsapp' | 'reservation' | 'custom'>('call')
  const [ctaLabel, setCtaLabel] = useState('')
  const [ctaValue, setCtaValue] = useState('')

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
          currency: data.currency || currencyForCountryCode(data.country_code || ''),
          layout: data.layout || 'classic',
          about: data.about || '',
          google_maps_url: data.google_maps_url || '',
        })
        setPhone(data.phone || '')
        if (data.opening_hours) setOpeningHours(data.opening_hours)

        if (data.logo_url) setLogoUrl(data.logo_url)
        if (data.cta_button) {
          setCtaEnabled(!!data.cta_button.enabled)
          setCtaType(data.cta_button.type || 'call')
          setCtaLabel(data.cta_button.label || '')
          setCtaValue(data.cta_button.value || '')
        }
        if (Array.isArray(data.hero_slides) && data.hero_slides.length > 0) {
          setHeroSlides(data.hero_slides.map((s: any) => ({
            image_url: s.image_url || '',
            title: s.title || '',
            caption: s.caption || '',
          })))
        } else {
          // Brand-new restaurant with no saved slides yet — start them
          // off with the default placeholders instead of blank slots,
          // so they're not blocked from saving before uploading photos.
          setHeroSlides(DEFAULT_COVER_SLIDES.map(s => ({ ...s })))
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
    const compressed = await compressImage(file, 800, 0.85)
    const fileName = `${restaurantId}/logo-${Date.now()}.webp`
    const { data, error } = await supabase.storage
      .from('restaurant-branding')
      .upload(fileName, compressed, { upsert: true, contentType: 'image/webp' })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('restaurant-branding').getPublicUrl(fileName)
      setLogoUrl(urlData.publicUrl)
    }
    setLogoUploading(false)
  }

  async function handleHeroImageUpload(index: number, file: File) {
    if (!restaurantId) return
    setHeroUploadingIndex(index)
    const compressed = await compressImage(file, 1920, 0.8)
    const fileName = `${restaurantId}/hero-${Date.now()}-${index}.webp`
    const { data, error } = await supabase.storage
      .from('restaurant-branding')
      .upload(fileName, compressed, { upsert: true, contentType: 'image/webp' })
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

  function validate(): { ok: boolean; firstBadTab: Tab | null } {
    const bad = new Set<Tab>()

    if (!form.name.trim() || isReservedSlug(form.slug)) bad.add('basic')

    const completeSlides = heroSlides.filter(s => s.image_url)
    if (completeSlides.length < MIN_HERO_SLIDES) bad.add('cover')

    if (!form.about.trim() || !countryCode) bad.add('about')

    if (!phoneCountryIso || !phone.trim()) bad.add('contact')

    setTabErrors(bad)

    if (bad.size === 0) return { ok: true, firstBadTab: null }
    const order: Tab[] = ['basic', 'cover', 'about', 'hours', 'contact', 'theme']
    const first = order.find(t => bad.has(t)) || null
    return { ok: false, firstBadTab: first }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const result = validate()
    if (!result.ok) {
      setError('Please fill in the required information highlighted on the tabs below.')
      if (result.firstBadTab) setActiveTab(result.firstBadTab)
      return
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const phoneCountry = ALL_COUNTRIES.find(c => c.isoCode === phoneCountryIso)
    const phoneDialCode = phoneCountry ? getDialCode(phoneCountry) : ''
    const completeSlides = heroSlides.filter(s => s.image_url)

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
      cta_button: ctaEnabled
        ? { enabled: true, type: ctaType, label: ctaLabel.trim(), value: ctaValue.trim() }
        : { enabled: false, type: ctaType, label: ctaLabel.trim(), value: ctaValue.trim() },
    }).eq('user_id', user.id)
    if (error) setError(error.message)
    else {
      setSuccess('Saved successfully!')
      setTabErrors(new Set())
    }
    setSaving(false)
  }

  const inputStyle = {
    padding: '10px 14px', borderRadius: 8,
    border: '1px solid #ddd', fontSize: 14, width: '100%',
    boxSizing: 'border-box' as const, outline: 'none',
    background: '#fff', color: '#0D1B2A',
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, color: '#0D1B2A' }}>Restaurant Settings</h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{ padding: '10px 22px', borderRadius: 8, background: '#38BDF8', color: '#0D1B2A', border: 'none', fontSize: 14, cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: 14, marginTop: 0 }}>{error}</p>}
      {success && <p style={{ color: '#16a34a', fontSize: 14, marginTop: 0 }}>{success}</p>}

      {/* Tabs — horizontally scrollable on small screens instead of
          wrapping or shrinking unreadably, same pattern used for
          category pills on the public menu page. */}
      <div
        style={{
          display: 'flex', gap: 6, marginBottom: 24, overflowX: 'auto',
          paddingBottom: 4, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
        }}
      >
        {TABS.map(t => {
          const hasError = tabErrors.has(t.id)
          const isActive = activeTab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              style={{
                flexShrink: 0, position: 'relative',
                padding: '9px 16px', borderRadius: 999, cursor: 'pointer',
                background: isActive ? '#38BDF8' : '#f0f9ff',
                color: isActive ? '#0D1B2A' : '#555',
                fontSize: 13.5, fontWeight: 600,
                whiteSpace: 'nowrap',
                border: isActive ? 'none' : '1px solid #e0f2fe',
              }}
            >
              {t.label}
              {hasError && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#ef4444', color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #fff',
                }}>!</span>
              )}
            </button>
          )
        })}
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ───────────── TAB: BASIC INFO ───────────── */}
        <div style={{ display: activeTab === 'basic' ? 'flex' : 'none', flexDirection: 'column', gap: 20 }}>
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
                <label style={labelStyle}>Website URL</label>
                {!editingSlug ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#f8fafc' }}>
                    <span style={{ fontSize: 13, color: '#888', whiteSpace: 'nowrap' }}>menuberg.com/</span>
                    <span style={{ fontSize: 14, color: '#0D1B2A', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{form.slug}</span>
                    <button
                      type="button"
                      onClick={() => setShowSlugWarning(true)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#38BDF8', flexShrink: 0, display: 'flex', alignItems: 'center' }}
                      title="Change menu URL"
                    >
                      <Pencil size={15} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#888', whiteSpace: 'nowrap' }}>menuberg.com/</span>
                    <input
                      autoFocus
                      style={{ ...inputStyle, flex: 1 }}
                      value={form.slug}
                      onChange={e => setForm({ ...form, slug: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setEditingSlug(false)}
                      style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 13, flexShrink: 0 }}
                    >
                      Done
                    </button>
                  </div>
                )}
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#888' }}>
                  This is your menu's public web address.
                </p>
              </div>

              {showSlugWarning && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                  <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 380, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                    <h3 style={{ margin: '0 0 12px', color: '#0D1B2A', fontSize: 17 }}>Change your menu URL?</h3>
                    <p style={{ margin: '0 0 24px', fontSize: 14, color: '#555', lineHeight: 1.6 }}>
                      Changing your URL will break any printed QR codes, shared links, or bookmarks customers already have for <strong>menuberg.com/{form.slug}</strong>. Only continue if you're sure.
                    </p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setShowSlugWarning(false)}
                        style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 14 }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowSlugWarning(false); setEditingSlug(true) }}
                        style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
                      >
                        Yes, I understand
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ───────────── TAB: COVER SLIDES & LOGO ───────────── */}
        <div style={{ display: activeTab === 'cover' ? 'flex' : 'none', flexDirection: 'column', gap: 20 }}>
          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: 15, color: '#0D1B2A' }}>Logo</h3>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#888' }}>Shown next to your restaurant name on the web page</p>
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
            <h3 style={{ margin: '0 0 4px', fontSize: 15, color: '#0D1B2A' }}>Website Cover Slides{required}</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#888' }}>
              Add {MIN_HERO_SLIDES}–{MAX_HERO_SLIDES} landscape images (recommended: 1600×900px). We've included 2 sample images to get you started—replace them anytime.
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
                      style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, width: '100%', boxSizing: 'border-box' as const, background: '#fff', color: '#0D1B2A' }}
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
                      style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, width: '100%', boxSizing: 'border-box' as const, background: '#fff', color: '#0D1B2A' }}
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
        </div>

        {/* ───────────── TAB: ABOUT, LOCATION & CURRENCY ───────────── */}
        <div style={{ display: activeTab === 'about' ? 'flex' : 'none', flexDirection: 'column', gap: 20 }}>
          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: 15, color: '#0D1B2A' }}>About your restaurant{required}</h3>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#888' }}>Shown in the About section of your menu page</p>
            <MarkdownEditor
              required
              value={form.about}
              onChange={(value) => setForm({ ...form, about: value })}
              placeholder="Tell your customers about your restaurant, your story, what makes you special..."
              rows={4}
              textareaStyle={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, width: '100%' }}
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
            <h3 style={{ margin: '0 0 4px', fontSize: 15, color: '#0D1B2A' }}>Currency</h3>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#888' }}>Shown next to prices on your menu. Search by country to find your currency.</p>
            <SearchableSelect
              variant="light"
              value={form.currency}
              onChange={(value) => setForm({ ...form, currency: value })}
              options={CURRENCY_OPTIONS}
              placeholder="Select currency"
              searchPlaceholder="Search by country..."
              selectedLabelOverride={currencyDisplayLabel(form.currency)}
            />
          </div>
        </div>

        {/* ───────────── TAB: OPENING HOURS ───────────── */}
        <div style={{ display: activeTab === 'hours' ? 'flex' : 'none', flexDirection: 'column', gap: 20 }}>
          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: 15, color: '#0D1B2A' }}>Opening hours</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#888' }}>Set your hours for each day of the week</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DAYS.map(day => {
                const h = openingHours[day] || { open: '09:00', close: '22:00', closed: false }
                return (
                  <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fff', borderRadius: 8, border: '1px solid #e0f2fe', flexWrap: 'wrap' as const }}>
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
                          style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, flex: 1, minWidth: 90, background: '#fff', color: '#0D1B2A' }}
                        />
                        <span style={{ fontSize: 12, color: '#888', flexShrink: 0 }}>to</span>
                        <input
                          type="time"
                          value={h.close}
                          onChange={e => updateDay(day, 'close', e.target.value)}
                          style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, flex: 1, minWidth: 90, background: '#fff', color: '#0D1B2A' }}
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
        </div>

        {/* ───────────── TAB: CONTACT & SOCIAL ───────────── */}
        <div style={{ display: activeTab === 'contact' ? 'flex' : 'none', flexDirection: 'column', gap: 20 }}>
          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, color: '#0D1B2A' }}>Contact</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Phone{required}</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                  <SearchableSelect
                    variant="light"
                    width={140}
                    value={phoneCountryIso}
                    onChange={setPhoneCountryIso}
                    options={ALL_COUNTRIES.map(c => ({ value: c.isoCode, label: `${c.flag} ${getDialCode(c)} ${c.name}` }))}
                    placeholder="Code"
                    searchPlaceholder="Search..."
                  />
                  <input required style={{ ...inputStyle, flex: 1, minWidth: 160 }} value={phone} onChange={e => setPhone(e.target.value)} placeholder="3001234567" />
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

          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 15, color: '#0D1B2A' }}>Floating action button</h3>
              <div
                onClick={() => setCtaEnabled(!ctaEnabled)}
                style={{ width: 40, height: 22, borderRadius: 11, cursor: 'pointer', background: ctaEnabled ? '#22c55e' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
              >
                <div style={{ position: 'absolute', top: 3, left: ctaEnabled ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
              </div>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#888' }}>
              A small floating button on your menu page for quick actions like calling or booking a table.
            </p>

            {ctaEnabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Button action</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {[
                      { id: 'call', label: 'Call' },
                      { id: 'whatsapp', label: 'WhatsApp' },
                      { id: 'reservation', label: 'Reservation link' },
                      { id: 'custom', label: 'Custom link' },
                    ].map(opt => (
                      <div
                        key={opt.id}
                        onClick={() => setCtaType(opt.id as typeof ctaType)}
                        style={{
                          cursor: 'pointer', padding: '9px 12px', borderRadius: 8, textAlign: 'center',
                          border: ctaType === opt.id ? '2px solid #38BDF8' : '1px solid #ddd',
                          background: ctaType === opt.id ? '#e0f2fe' : '#fff',
                          fontSize: 13, fontWeight: ctaType === opt.id ? 600 : 400,
                          color: ctaType === opt.id ? '#0D1B2A' : '#555',
                        }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Button label</label>
                  <input
                    style={inputStyle}
                    value={ctaLabel}
                    onChange={e => setCtaLabel(e.target.value)}
                    placeholder={ctaType === 'call' ? 'Call to order' : ctaType === 'whatsapp' ? 'Order on WhatsApp' : ctaType === 'reservation' ? 'Book a table' : 'Visit our website'}
                    maxLength={30}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    {ctaType === 'call' && 'Phone number'}
                    {ctaType === 'whatsapp' && 'WhatsApp number'}
                    {(ctaType === 'reservation' || ctaType === 'custom') && 'Link (URL)'}
                  </label>
                  <input
                    style={inputStyle}
                    value={ctaValue}
                    onChange={e => setCtaValue(e.target.value)}
                    placeholder={
                      ctaType === 'call' ? '+923001234567' :
                      ctaType === 'whatsapp' ? '923001234567' :
                      'https://...'
                    }
                  />
                  {ctaType === 'whatsapp' && (
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: '#888' }}>Numbers only, with country code, no + or spaces.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ───────────── TAB: THEME & LAYOUT ───────────── */}
        <div style={{ display: activeTab === 'theme' ? 'flex' : 'none', flexDirection: 'column', gap: 20 }}>
          <div style={sectionStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: 15, color: '#0D1B2A' }}>Menu theme</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#888' }}>How your public menu page looks to customers</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
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
        </div>

        <div style={{ height: 20 }} />
      </form>
    </div>
  )
}