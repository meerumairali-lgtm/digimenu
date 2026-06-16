'use client'

import { useState, useEffect } from 'react'
import { LifeBuoy, Plus, X, ChevronRight, Clock, CheckCircle, Circle } from 'lucide-react'

type Ticket = {
  id: string
  subject: string
  message: string
  status: string
  created_at: string
}

type Reply = {
  id: string
  sender: string
  message: string
  created_at: string
}

export default function SupportClient() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [reply, setReply] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchTickets() }, [])

  async function fetchTickets() {
    const res = await fetch('/api/dashboard/support')
    const data = await res.json()
    setTickets(data.tickets || [])
    setLoading(false)
  }

  async function openTicket(ticket: Ticket) {
    setActiveTicket(ticket)
    const res = await fetch(`/api/dashboard/support/${ticket.id}`)
    const data = await res.json()
    setReplies(data.replies || [])
  }

  async function handleSubmit() {
    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required.')
      return
    }
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/dashboard/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, message }),
    })
    if (res.ok) {
      setSuccess('Ticket submitted! We\'ll get back to you soon.')
      setSubject('')
      setMessage('')
      setShowForm(false)
      fetchTickets()
    } else {
      setError('Failed to submit ticket.')
    }
    setSubmitting(false)
  }

  async function handleReply() {
    if (!reply.trim() || !activeTicket) return
    setSendingReply(true)
    await fetch(`/api/dashboard/support/${activeTicket.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: reply }),
    })
    setReply('')
    const res = await fetch(`/api/dashboard/support/${activeTicket.id}`)
    const data = await res.json()
    setReplies(data.replies || [])
    setSendingReply(false)
  }

  // Ticket detail view
  if (activeTicket) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <button
          onClick={() => { setActiveTicket(null); setReplies([]) }}
          className="text-sm text-sky-500 hover:text-sky-400 flex items-center gap-1"
        >
          ← Back to tickets
        </button>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">{activeTicket.subject}</h2>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border shrink-0
              ${activeTicket.status === 'open'
                ? 'bg-green-50 text-green-600 border-green-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'}`}
            >
              {activeTicket.status}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {new Date(activeTicket.created_at).toLocaleString()}
          </p>
        </div>

        {/* Conversation */}
        <div className="space-y-3">
          {/* Original message */}
          <div className="flex justify-end">
            <div className="bg-sky-500 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
              <p className="text-sm">{activeTicket.message}</p>
              <p className="text-xs text-sky-200 mt-1">You</p>
            </div>
          </div>

          {/* Replies */}
          {replies.map((r) => (
            <div key={r.id} className={`flex ${r.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-2xl px-4 py-3 max-w-[80%]
                ${r.sender === 'user'
                  ? 'bg-sky-500 text-white rounded-tr-sm'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'}`}
              >
                <p className="text-sm">{r.message}</p>
                <p className={`text-xs mt-1 ${r.sender === 'user' ? 'text-sky-200' : 'text-slate-400'}`}>
                  {r.sender === 'user' ? 'You' : 'Menuberg Support'} · {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Reply box */}
        {activeTicket.status === 'open' && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply..."
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-400 resize-none placeholder-slate-400"
            />
            <button
              onClick={handleReply}
              disabled={sendingReply || !reply.trim()}
              className="bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {sendingReply ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        )}

        {activeTicket.status === 'closed' && (
          <div className="text-center text-sm text-slate-400 py-4">
            This ticket is closed.
          </div>
        )}
      </div>
    )
  }

  // Ticket list view
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <LifeBuoy size={22} className="text-sky-500" />
            Support
          </h1>
          <p className="text-slate-500 text-sm mt-1">Get help from the Menuberg team</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Cancel' : 'New Ticket'}
        </button>
      </div>

      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {/* New ticket form */}
      {showForm && (
        <div className="bg-white border border-sky-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-slate-900">New Support Ticket</h2>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What do you need help with?"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-400 placeholder-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue in detail..."
              rows={5}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-sky-400 resize-none placeholder-slate-400"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </div>
      )}

      {/* Tickets list */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <LifeBuoy size={32} className="text-slate-300 mx-auto" />
          <p className="text-slate-400 text-sm">No tickets yet. Submit one if you need help!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => openTicket(ticket)}
              className="w-full bg-white border border-slate-200 rounded-xl p-4 hover:border-sky-200 hover:bg-sky-50 transition-colors text-left flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                {ticket.status === 'open'
                  ? <Circle size={16} className="text-green-500 shrink-0 mt-0.5" />
                  : <CheckCircle size={16} className="text-slate-400 shrink-0 mt-0.5" />}
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{ticket.subject}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock size={11} />
                    {new Date(ticket.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium
                  ${ticket.status === 'open'
                    ? 'bg-green-50 text-green-600 border-green-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                >
                  {ticket.status}
                </span>
                <ChevronRight size={15} className="text-slate-400" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}