'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Power, UserPlus, Save } from 'lucide-react'

export default function SettingsClient({
  initialSettings,
}: {
  initialSettings: Record<string, string>
}) {
  const [settings, setSettings] = useState(initialSettings)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  const supabase = createClient()

  async function updateSetting(key: string, value: string) {
    setSaving(key)
    await supabase
      .from('platform_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)

    setSettings((prev) => ({ ...prev, [key]: value }))

    // Log audit action
    await fetch('/api/super-admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        settings: [{ key, value }],
      }),
    })

    setSaving(null)
    setSaved(key)
    setTimeout(() => setSaved(null), 2000)
  }

  const toggles = [
    {
      key: 'maintenance_mode',
      label: 'Maintenance Mode',
      description:
        'When ON, the entire platform shows a maintenance page to all visitors except Super Admin.',
      icon: Power,
      dangerColor: true,
    },
    {
      key: 'allow_signups',
      label: 'Allow New Signups',
      description:
        'When OFF, the signup page is disabled and no new accounts can be created.',
      icon: UserPlus,
      dangerColor: false,
    },
  ]

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
        <p className="text-gray-400 text-sm mt-1">
          Global controls for the DigiMenu platform
        </p>
      </div>

      <div className="space-y-4">
        {toggles.map((toggle) => {
          const Icon = toggle.icon
          const isOn = settings[toggle.key] === 'true'
          const isSaving = saving === toggle.key
          const isSaved = saved === toggle.key

          return (
            <div
              key={toggle.key}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 ${
                      toggle.dangerColor && isOn
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {toggle.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {toggle.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    updateSetting(toggle.key, isOn ? 'false' : 'true')
                  }
                  disabled={isSaving}
                  className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 disabled:opacity-50
                    ${
                      isOn
                        ? toggle.dangerColor
                          ? 'bg-red-500'
                          : 'bg-orange-500'
                        : 'bg-gray-700'
                    }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
                      ${isOn ? 'translate-x-6' : 'translate-x-0'}`}
                  />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full
                  ${
                    isOn
                      ? toggle.dangerColor
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-orange-500/10 text-orange-400'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {isOn ? 'ON' : 'OFF'}
                </span>
                {isSaved && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <Save size={12} /> Saved
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}