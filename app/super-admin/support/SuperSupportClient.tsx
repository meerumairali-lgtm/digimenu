'use client'

import { useState, useEffect } from 'react'
import { LifeBuoy, ChevronRight, Clock, Circle, CheckCircle } from 'lucide-react'

type Ticket = {
  id: string
  restaurant_name: string
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

export default function SuperSupportClient() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [reply, setReply] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all')

  useEffect(() => { fetchTickets() }, [])

  async function fetchTickets() {
    const res = await fetch('/api/super-admin/support')
    const data = await res.json()
    setTickets(data.tickets || [])
    setLoading(false)
  }

  async function openTicket(ticket: Ticket) {
    setActiveTicket(ticket)
    const res = await fetch(`/api/super-admin/support/${ticket.id}`)
    const data = await res.json()
    setReplies(data.replies || [])
  }

  async function handleReply() {
    if (!reply.trim() || !activeTicket) return
    setSendingReply(true)
    await fetch(`/api/super-admin/support/${activeTicket.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: reply }),
    })
    setReply('')
    const res = await fetch(`/api/super-admin/support/${activeTicket.id}`)
    const data = await res.json()
    setReplies(data.replies || [])
    setSendingReply(false)
  }

  async function toggleStatus() {
    if (!activeTicket) return
    const newStatus = activeTicket.status === 'open' ? 'closed' : 'open'
    await fetch(`/api/super-admin/support/${activeTicket.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setActiveTicket({ ...activeTicket, status: newStatus })
    fetchTickets()
  }

  const filtered = tickets.filter((t) =>
    filter === 'all' ? true : t.status === filter
  )

  const openCount = tickets.filter((t) => t.status === 'open').length

  // Ticket detail
  if (activeTicket) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => { setActiveTicket(null); setReplies([]) }}
          className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1"
        >
          ← Back to tickets
        </button>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-2">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold text-white">{activeTicket.subject}</h2>
              <p className="text-sky-400 text-sm mt-0.5">{activeTicket.restaurant_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border
                ${activeTicket.status === 'open'
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-gray-700 text-gray-400 border-gray-600'}`}
              >
                {activeTicket.status}
              </span>
              <button
                onClick={toggleStatus}
                className="text-xs px-3 py-1 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
              >
                Mark as {activeTicket.status === 'open' ? 'closed' : 'open'}
              </button>
            </div>
          </div>
          <p className="text-gray-500 text-xs">
            {new Date(activeTicket.created_at).toLocaleString()}
          </p>
        </div>

        {/* Conversation */}
        <div className="space-y-3">
          {/* Original message */}
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 text-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
              <p className="text-sm">{activeTicket.message}</p>
              <p className="text-xs text-gray-500 mt-1">{activeTicket.restaurant_name}</p>
            </div>
          </div>

          {replies.map((r) => (
            <div key={r.id} className={`flex ${r.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-2xl px-4 py-3 max-w-[80%]
                ${r.sender === 'admin'
                  ? 'bg-sky-500 text-white rounded-tr-sm'
                  : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-sm'}`}
              >
                <p className="text-sm">{r.message}</p>
                <p className={`text-xs mt-1 ${r.sender === 'admin' ? 'text-sky-200' : 'text-gray-500'}`}>
                  {r.sender === 'admin' ? 'You (Admin)' : activeTicket.restaurant_name} · {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Reply box */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your reply to the restaurant..."
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-sky-500 resize-none placeholder-gray-500"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleReply}
              disabled={sendingReply || !reply.trim()}
              className="bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {sendingReply ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Ticket list
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <LifeBuoy size={24} className="text-sky-400" />
            Support Tickets
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {openCount} open ticket{openCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {(['all', 'open', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors capitalize
                ${filter === f
                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                  : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <LifeBuoy size={32} className="text-gray-700 mx-auto" />
          <p className="text-gray-500 text-sm">No tickets found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => openTicket(ticket)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-sky-500/30 transition-colors text-left flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                {ticket.status === 'open'
                  ? <Circle size={16} className="text-green-400 shrink-0 mt-0.5" />
                  : <CheckCircle size={16} className="text-gray-600 shrink-0 mt-0.5" />}
                <div className="min-w-0">
                  <p className="font-medium text-white text-sm truncate">{ticket.subject}</p>
                  <p className="text-sky-400 text-xs mt-0.5">{ticket.restaurant_name}</p>
                  <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                    <Clock size={11} />
                    {new Date(ticket.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium
                  ${ticket.status === 'open'
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-gray-700 text-gray-400 border-gray-600'}`}
                >
                  {ticket.status}
                </span>
                <ChevronRight size={15} className="text-gray-600" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}