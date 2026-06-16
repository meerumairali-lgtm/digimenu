'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Mail, Users, User, Clock, CheckCircle, AlertCircle } from 'lucide-react'

type Restaurant = {
  id: string
  name: string
  email: string | null
}

type EmailLog = {
  id: string
  recipient_type: string
  recipient_email: string
  recipient_name: string
  subject: string
  status: string
  created_at: string
}

export default function EmailClient() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [recipientType, setRecipientType] = useState<'all' | 'single'>('all')
  const [selectedRestaurant, setSelectedRestaurant] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const supabase = createClient()
    const { data: rList } = await supabase
      .from('restaurants')
      .select('id, name, email')
      .order('name')
    const { data: logList } = await supabase
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (rList) setRestaurants(rList)
    if (logList) setLogs(logList)
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim()) {
      setResult({ type: 'error', message: 'Subject and message are required.' })
      return
    }
    if (recipientType === 'single' && !selectedRestaurant) {
      setResult({ type: 'error', message: 'Please select a restaurant.' })
      return
    }

    setSending(true)
    setResult(null)

    try {
      const res = await fetch('/api/super-admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          body,
          recipientType,
          restaurantId: recipientType === 'single' ? selectedRestaurant : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setResult({ type: 'error', message: data.error || 'Failed to send.' })
      } else {
        setResult({
          type: 'success',
          message: `Email sent successfully to ${data.sent} recipient${data.sent !== 1 ? 's' : ''}.`,
        })
        setSubject('')
        setBody('')
        setSelectedRestaurant('')
        fetchData()
      }
    } catch {
      setResult({ type: 'error', message: 'Network error. Please try again.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Mail size={24} className="text-sky-400" />
          Email Management
        </h1>
        <p className="text-gray-400 text-sm mt-1">Send emails to one or all restaurants</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Compose */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="text-white font-semibold text-lg">Compose Email</h2>

          {/* Recipient type */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Send To</label>
            <div className="flex gap-3">
              <button
                onClick={() => setRecipientType('all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                  ${recipientType === 'all'
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                    : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'}`}
              >
                <Users size={14} />
                All Restaurants
              </button>
              <button
                onClick={() => setRecipientType('single')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                  ${recipientType === 'single'
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                    : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'}`}
              >
                <User size={14} />
                Single Restaurant
              </button>
            </div>
          </div>

          {/* Restaurant picker */}
          {recipientType === 'single' && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Select Restaurant</label>
              <select
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sky-500"
              >
                <option value="">— Choose a restaurant —</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.email ? `(${r.email})` : '(no email)'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sky-500 placeholder-gray-500"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here..."
              rows={7}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sky-500 placeholder-gray-500 resize-none"
            />
          </div>

          {/* Result banner */}
          {result && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-sm
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

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            <Send size={15} />
            {sending ? 'Sending...' : 'Send Email'}
          </button>
        </div>

        {/* Logs */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-lg">Sent History</h2>

          {logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No emails sent yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white text-sm font-medium truncate">{log.subject}</p>
                    <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full shrink-0">
                      {log.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs flex items-center gap-1.5">
                    {log.recipient_type === 'all'
                      ? <><Users size={11} /> All Restaurants</>
                      : <><User size={11} /> {log.recipient_name} ({log.recipient_email})</>}
                  </p>
                  <p className="text-gray-500 text-xs flex items-center gap-1.5">
                    <Clock size={11} />
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}