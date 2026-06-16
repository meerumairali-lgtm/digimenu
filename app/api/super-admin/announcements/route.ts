import { createClient } from '@/lib/supabase/server'
import { logAuditAction } from '@/lib/audit'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'


export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== 'meerumairali@gmail.com') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  return NextResponse.json({ announcements: data || [] })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== 'meerumairali@gmail.com') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { title, message, sendEmail } = await req.json()

  if (!title || !message) {
    return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
  }

  const { data: announcement, error } = await supabase
    .from('announcements')
    .insert({ title, message, is_active: true })
    .select()
    .single()

  if (error || !announcement) {
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
  }

  await logAuditAction({
    admin_email: user.email,
    action: 'create_announcement',
    target_type: 'announcement',
    target_id: announcement.id,
    target_name: title,
  })

  // Optionally send email to all restaurants
  if (sendEmail) {
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id, name, email')
      .not('email', 'is', null)
      .neq('email', '')

    if (restaurants && restaurants.length > 0) {
      for (const restaurant of restaurants) {
        if (!restaurant.email) continue
        await resend.emails.send({
          from: process.env.RESEND_FROM!,
          to: restaurant.email,
          subject: `📢 ${title}`,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;">
            <div style="background:#0D1B2A;padding:24px;border-radius:12px 12px 0 0;">
              <h2 style="color:#38BDF8;margin:0;">📢 Menuberg Announcement</h2>
            </div>
            <div style="background:#f9f9f9;padding:24px;border-radius:0 0 12px 12px;">
              <h3 style="color:#0D1B2A;margin-top:0;">${title}</h3>
              <p style="color:#333;white-space:pre-wrap;line-height:1.6;">${message}</p>
              <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
              <p style="color:#999;font-size:12px;">This announcement was sent by the Menuberg team. Log in to your dashboard at menuberg.com</p>
            </div>
          </div>`,
        })
      }

      await logAuditAction({
        admin_email: user.email,
        action: 'send_announcement_email',
        target_type: 'announcement',
        target_id: announcement.id,
        target_name: title,
      })
    }
  }

  return NextResponse.json({ success: true, announcement })
}

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== 'meerumairali@gmail.com') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, is_active } = await req.json()

  await supabase
    .from('announcements')
    .update({ is_active })
    .eq('id', id)

  await logAuditAction({
    admin_email: user.email,
    action: is_active ? 'activate_announcement' : 'deactivate_announcement',
    target_type: 'announcement',
    target_id: id,
    target_name: id,
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== 'meerumairali@gmail.com') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, title } = await req.json()

  await supabase.from('announcements').delete().eq('id', id)

  await logAuditAction({
    admin_email: user.email,
    action: 'delete_announcement',
    target_type: 'announcement',
    target_id: id,
    target_name: title,
  })

  return NextResponse.json({ success: true })
}