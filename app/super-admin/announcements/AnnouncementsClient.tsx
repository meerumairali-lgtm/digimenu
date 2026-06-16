'use client'

import { useState, useEffect } from 'react'
import {
  Megaphone, Plus, Trash2, Eye, EyeOff,
  CheckCircle, AlertCircle, Mail, X
} from 'lucide-react'

type Announcement = {
  id: string
  title: string
  message: string
  is_active: boolean
  created_at: string
}

export default function AnnouncementsClient() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => { fetchAnnouncements() }, [])

  async function fetchAnnouncements() {
    const res = await fetch('/api/super-admin/announcements')
    const data = await res.json()
    setAnnouncements(data.announcements || [])
    setLoading(false)
  }

  async function handleCreate() {
    if (!title.trim() || !message.trim()) {
      setResult({ type: 'error', message: 'Title and message are required.' })
      return
    }
    setSubmitting(true)
    setResult(null)
    const res = await fetch('/api/super-admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message, sendEmail }),
    })
    const data = await res.json()
    if (!res.ok) {
      setResult({ type: 'error', message: data.error || 'Failed to create.' })
    } else {
      setResult({
        type: 'success',
        message: sendEmail
          ? 'Announcement created and emailed to all restaurants!'
          : 'Announcement created and showing on dashboards!',
      })
      setTitle('')
      setMessage('')
      setSendEmail(false)
      setShowForm(false)
      fetchAnnouncements()
    }
    setSubmitting(false)
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch('/api/super-admin/announcements', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !current }),
    })
    fetchAnnouncements()
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete announcement "${title}"?`)) return
    await fetch('/api/super-admin/announcements', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, title }),
    })
    fetchAnnouncements()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Megaphone size={24} className="text-sky-400" />
            Announcements
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Post announcements to all restaurant dashboards
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setResult(null) }}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Cancel' : 'New Announcement'}
        </button>
      </div>

      {/* Result banner */}
      {result && (
        <div className={`flex items-start gap-2 p-4 rounded-lg text-sm
          ${result.type === 'success'
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}
        >
          {result.type === 'success'
            ? <CheckCircle size={16} className="mt-0.5 shrink-0" />
            : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
          {result.message}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-gray-900 border border-sky-500/20 rounded-xl p-6 space-y-5">
          <h2 className="text-white font-semibold">New Announcement</h2>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. New feature available!"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sky-500 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your announcement..."
              rows={5}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sky-500 placeholder-gray-500 resize-none"
            />
          </div>

          {/* Send email toggle */}
          <div
            onClick={() => setSendEmail(!sendEmail)}
            className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors
              ${sendEmail
                ? 'bg-sky-500/10 border-sky-500/30'
                : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}
          >
            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors
              ${sendEmail ? 'bg-sky-500' : 'bg-gray-700'}`}
            >
              {sendEmail && <CheckCircle size={13} className="text-white" />}
            </div>
            <div>
              <p className={`text-sm font-medium ${sendEmail ? 'text-sky-400' : 'text-gray-300'}`}>
                Also send as email
              </p>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <Mail size={11} />
                Blast this announcement to all restaurant emails
              </p>
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            <Megaphone size={15} />
            {submitting ? 'Publishing...' : 'Publish Announcement'}
          </button>
        </div>
      )}

      {/* Announcements list */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading...</div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-sm">
          No announcements yet. Create one above.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className={`bg-gray-900 border rounded-xl p-5 space-y-3 transition-colors
                ${a.is_active ? 'border-gray-800' : 'border-gray-800 opacity-60'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-semibold">{a.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium
                      ${a.is_active
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-gray-700 text-gray-400 border-gray-600'}`}
                    >
                      {a.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1 whitespace-pre-wrap">{a.message}</p>
                  <p className="text-gray-600 text-xs mt-2">
                    {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(a.id, a.is_active)}
                    title={a.is_active ? 'Deactivate' : 'Activate'}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    {a.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(a.id, a.title)}
                    title="Delete"
                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}