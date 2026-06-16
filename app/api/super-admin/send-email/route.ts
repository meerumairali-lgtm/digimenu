import { createClient } from '@/lib/supabase/server'
import { logAuditAction } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== 'meerumairali@gmail.com') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { subject, body, recipientType, restaurantId } = await req.json()

  if (!subject || !body || !recipientType) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  try {
    if (recipientType === 'all') {
      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('id, name, email')
        .not('email', 'is', null)

      if (!restaurants || restaurants.length === 0) {
        return NextResponse.json({ error: 'No restaurants found' }, { status: 404 })
      }

      for (const restaurant of restaurants) {
        if (!restaurant.email) continue

        await resend.emails.send({
          from: process.env.RESEND_FROM!,
          to: restaurant.email,
          subject,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;">
            <h2 style="color:#0D1B2A;">${subject}</h2>
            <p style="color:#333;white-space:pre-wrap;">${body}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="color:#999;font-size:12px;">This message was sent by the Menuberg team.</p>
          </div>`,
        })

        await supabase.from('email_logs').insert({
          sent_by: user.email,
          recipient_type: 'all',
          recipient_email: restaurant.email,
          recipient_name: restaurant.name,
          subject,
          body,
          status: 'sent',
        })
      }

      await logAuditAction({
        admin_email: user.email,
        action: 'send_email_all',
        target_type: 'restaurants',
        target_id: 'all',
        target_name: `All Restaurants (${restaurants.length})`,
      })

      return NextResponse.json({ success: true, sent: restaurants.length })

    } else {
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id, name, email')
        .eq('id', restaurantId)
        .single()

      if (!restaurant || !restaurant.email) {
        return NextResponse.json({ error: 'Restaurant or email not found' }, { status: 404 })
      }

      await resend.emails.send({
        from: process.env.RESEND_FROM!,
        to: restaurant.email,
        subject,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;">
          <h2 style="color:#0D1B2A;">${subject}</h2>
          <p style="color:#333;white-space:pre-wrap;">${body}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="color:#999;font-size:12px;">This message was sent by the Menuberg team.</p>
        </div>`,
      })

      await supabase.from('email_logs').insert({
        sent_by: user.email,
        recipient_type: 'single',
        recipient_email: restaurant.email,
        recipient_name: restaurant.name,
        subject,
        body,
        status: 'sent',
      })

      await logAuditAction({
        admin_email: user.email,
        action: 'send_email_single',
        target_type: 'restaurant',
        target_id: restaurant.id,
        target_name: restaurant.name,
      })

      return NextResponse.json({ success: true, sent: 1 })
    }
  } catch (err) {
    console.error('Email send error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}