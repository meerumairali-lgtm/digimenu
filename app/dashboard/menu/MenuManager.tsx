'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Bold, List } from 'lucide-react'

type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  is_available: boolean
  image_url?: string
}

type Category = {
  id: string
  name: string
  menu_items: MenuItem[]
}

type Restaurant = {
  id: string
  name: string
  slug: string
  currency?: string
}

// ── Tiny markdown toolbar (Bold + Bullet only) ────────────────────────────────
function MiniMarkdownToolbar({
  textareaRef,
  value,
  onChange,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (value: string) => void
}) {
  function wrapSelection(before: string, after: string = before) {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.slice(start, end)

    const newValue = value.slice(0, start) + before + selected + after + value.slice(end)
    onChange(newValue)

    requestAnimationFrame(() => {
      textarea.focus()
      const cursorPos = selected
        ? start + before.length + selected.length + after.length
        : start + before.length
      textarea.setSelectionRange(cursorPos, cursorPos)
    })
  }

  function insertLinePrefix(prefix: string) {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const lineStart = value.lastIndexOf('\n', start - 1) + 1

    const newValue = value.slice(0, lineStart) + prefix + value.slice(lineStart)
    onChange(newValue)

    requestAnimationFrame(() => {
      textarea.focus()
      const cursorPos = start + prefix.length
      textarea.setSelectionRange(cursorPos, cursorPos)
    })
  }

  const btnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 6,
    border: '1px solid #ddd',
    background: '#fff',
    color: '#444',
    cursor: 'pointer',
  }

  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
      <button type="button" onClick={() => wrapSelection('**')} style={btnStyle} title="Bold">
        <Bold size={13} />
      </button>
      <button type="button" onClick={() => insertLinePrefix('- ')} style={btnStyle} title="Bullet point">
        <List size={13} />
      </button>
    </div>
  )
}

// ── Three-dot menu component ──────────────────────────────────────────────────
function DotsMenu({ options }: { options: { label: string; onClick: () => void; danger?: boolean }[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6, fontSize: 18, color: '#888', lineHeight: 1 }}
      >
        ⋮
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
          <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 20, background: '#fff', border: '1px solid #e0f2fe', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', minWidth: 140, overflow: 'hidden' }}>
            {options.map(opt => (
              <button
                key={opt.label}
                onClick={() => { opt.onClick(); setOpen(false) }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: opt.danger ? '#cc0000' : '#0D1B2A', fontWeight: opt.danger ? 600 : 400 }}
                onMouseEnter={e => (e.currentTarget.style.background = opt.danger ? '#fff5f5' : '#f0f9ff')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Confirm delete dialog ─────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 360, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <p style={{ margin: '0 0 24px', fontSize: 15, color: '#0D1B2A', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 14 }}>
            No, keep it
          </button>
          <button onClick={onConfirm} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Edit item modal ───────────────────────────────────────────────────────────
function EditItemModal({ item, restaurantId, onSave, onClose }: {
  item: MenuItem
  restaurantId: string
  onSave: (updated: MenuItem) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({ name: item.name, description: item.description, price: String(item.price), image_url: item.image_url || '' })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  async function handleImageUpload(file: File) {
    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `${restaurantId}/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('menu-images').upload(fileName, file, { upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('menu-images').getPublicUrl(fileName)
      setForm(f => ({ ...f, image_url: urlData.publicUrl }))
    }
    setUploading(false)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    const updated = { ...item, name: form.name.trim(), description: form.description.trim(), price: parseFloat(form.price) || 0, image_url: form.image_url || undefined }
    const { error } = await supabase.from('menu_items').update({
      name: updated.name, description: updated.description, price: updated.price, image_url: updated.image_url || null
    }).eq('id', item.id)
    if (!error) onSave(updated)
    setSaving(false)
  }

  const inputStyle = { padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, width: '100%', boxSizing: 'border-box' as const }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: '#0D1B2A' }}>Edit Item</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#888' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>Item name *</label>
            <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>Description</label>
            <MiniMarkdownToolbar
              textareaRef={descriptionRef}
              value={form.description}
              onChange={(value) => setForm(f => ({ ...f, description: value }))}
            />
            <textarea
              ref={descriptionRef}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: 1.5 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>Price</label>
            <input style={inputStyle} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
          </div>

          {/* Image */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>Photo</label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: '1px dashed #bae6fd', borderRadius: 8, padding: 12, textAlign: 'center', cursor: 'pointer', background: '#f0f9ff' }}
            >
              {uploading ? (
                <p style={{ margin: 0, fontSize: 13, color: '#888' }}>Uploading...</p>
              ) : form.image_url ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={form.image_url} alt="" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }} />
                  <p style={{ margin: 0, fontSize: 13, color: '#38BDF8' }}>Tap to change photo</p>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 13, color: '#888' }}>📷 Tap to add photo <span style={{ color: '#aaa' }}>(optional)</span></p>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 14 }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 24px', borderRadius: 8, border: 'none', background: '#38BDF8', color: '#0D1B2A', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MenuManager({ restaurant, initialCategories }: {
  restaurant: Restaurant
  initialCategories: Category[]
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [newItems, setNewItems] = useState<Record<string, { name: string; description: string; price: string; image_url: string }>>({})
  const [addingItem, setAddingItem] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState<string | null>(null)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [editingItem, setEditingItem] = useState<{ item: MenuItem; categoryId: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ message: string; onConfirm: () => void } | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const newItemDescriptionRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})
  const supabase = createClient()
  const router = useRouter()

  // ── Category actions ──
  async function addCategory() {
    if (!newCategoryName.trim()) return
    setAddingCategory(true)
    const { data, error } = await supabase.from('categories').insert({
      restaurant_id: restaurant.id,
      name: newCategoryName.trim(),
      sort_order: categories.length,
    }).select().single()
    if (!error && data) {
      setCategories([...categories, { ...data, menu_items: [] }])
      setNewCategoryName('')
    }
    setAddingCategory(false)
  }

  async function saveCategoryName(categoryId: string) {
    if (!editingCategoryName.trim()) return
    await supabase.from('categories').update({ name: editingCategoryName.trim() }).eq('id', categoryId)
    setCategories(categories.map(c => c.id === categoryId ? { ...c, name: editingCategoryName.trim() } : c))
    setEditingCategoryId(null)
  }

  function requestDeleteCategory(category: Category) {
    if (category.menu_items.length > 0) {
      setConfirmDelete({
        message: `"${category.name}" still has ${category.menu_items.length} item${category.menu_items.length === 1 ? '' : 's'}. Please delete all items first before deleting this category.`,
        onConfirm: () => setConfirmDelete(null),
      })
      return
    }
    setConfirmDelete({
      message: `Are you sure you want to delete the category "${category.name}"?`,
      onConfirm: async () => {
        await supabase.from('categories').delete().eq('id', category.id)
        setCategories(categories.filter(c => c.id !== category.id))
        setConfirmDelete(null)
      },
    })
  }

  // ── Item actions ──
  async function addItem(categoryId: string) {
    const item = newItems[categoryId]
    if (!item?.name.trim()) return
    const { data, error } = await supabase.from('menu_items').insert({
      category_id: categoryId,
      restaurant_id: restaurant.id,
      name: item.name.trim(),
      description: item.description?.trim() || '',
      price: parseFloat(item.price) || 0,
      image_url: item.image_url || null,
    }).select().single()
    if (!error && data) {
      setCategories(categories.map(c => c.id === categoryId ? { ...c, menu_items: [...c.menu_items, data] } : c))
      setNewItems({ ...newItems, [categoryId]: { name: '', description: '', price: '', image_url: '' } })
      setAddingItem(null)
    }
  }

  function requestDeleteItem(categoryId: string, item: MenuItem) {
    setConfirmDelete({
      message: `Are you sure you want to delete "${item.name}"?`,
      onConfirm: async () => {
        await supabase.from('menu_items').delete().eq('id', item.id)
        setCategories(categories.map(c => c.id === categoryId ? { ...c, menu_items: c.menu_items.filter(i => i.id !== item.id) } : c))
        setConfirmDelete(null)
      },
    })
  }

  async function toggleAvailable(categoryId: string, itemId: string, current: boolean) {
    await supabase.from('menu_items').update({ is_available: !current }).eq('id', itemId)
    setCategories(categories.map(c =>
      c.id === categoryId
        ? { ...c, menu_items: c.menu_items.map(i => i.id === itemId ? { ...i, is_available: !current } : i) }
        : c
    ))
  }

  async function handleImageUpload(categoryId: string, file: File) {
    setUploadingImage(categoryId)
    const ext = file.name.split('.').pop()
    const fileName = `${restaurant.id}/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('menu-images').upload(fileName, file, { upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('menu-images').getPublicUrl(fileName)
      setNewItems({ ...newItems, [categoryId]: { ...newItems[categoryId], image_url: urlData.publicUrl } })
    }
    setUploadingImage(null)
  }

  const inputStyle = { padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, width: '100%' }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 20px' }}>

      {/* Modals */}
      {confirmDelete && (
        <ConfirmModal
          message={confirmDelete.message}
          onConfirm={confirmDelete.onConfirm}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {editingItem && (
        <EditItemModal
          item={editingItem.item}
          restaurantId={restaurant.id}
          onSave={updated => {
            setCategories(categories.map(c =>
              c.id === editingItem.categoryId
                ? { ...c, menu_items: c.menu_items.map(i => i.id === updated.id ? updated : i) }
                : c
            ))
            setEditingItem(null)
          }}
          onClose={() => setEditingItem(null)}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, color: '#0D1B2A' }}>Menu</h1>
          <p style={{ color: '#666', margin: '4px 0 0', fontSize: 14 }}>{restaurant.name}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 14 }}
        >
          ← Dashboard
        </button>
      </div>

      {/* Add Category */}
      <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 20, marginBottom: 24, border: '1px solid #e0f2fe' }}>
        <h3 style={{ margin: '0 0 12px', color: '#0D1B2A' }}>Add Category</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="e.g. Burgers, Wraps, Drinks"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={addCategory}
            disabled={addingCategory}
            style={{ padding: '8px 20px', borderRadius: 8, background: '#38BDF8', color: '#0D1B2A', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}
          >
            {addingCategory ? 'Adding...' : '+ Add'}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {categories.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed #bae6fd', borderRadius: 12, background: '#f0f9ff' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
          <h3 style={{ margin: '0 0 8px', color: '#0D1B2A' }}>Your menu is empty</h3>
          <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
            Start by adding a category above — like "Burgers" or "Drinks" — then add items inside it.
          </p>
        </div>
      )}

      {/* Categories */}
      {categories.map(category => (
        <div key={category.id} style={{ border: '1px solid #e0f2fe', borderRadius: 12, padding: 20, marginBottom: 16, background: '#fff' }}>

          {/* Category Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ flex: 1, marginRight: 12 }}>
              {editingCategoryId === category.id ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    autoFocus
                    value={editingCategoryName}
                    onChange={e => setEditingCategoryName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveCategoryName(category.id); if (e.key === 'Escape') setEditingCategoryId(null) }}
                    style={{ ...inputStyle, fontSize: 16, fontWeight: 600 }}
                  />
                  <button onClick={() => saveCategoryName(category.id)} style={{ padding: '6px 14px', borderRadius: 8, background: '#38BDF8', color: '#0D1B2A', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    Save
                  </button>
                  <button onClick={() => setEditingCategoryId(null)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 13 }}>
                    ✕
                  </button>
                </div>
              ) : (
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, color: '#0D1B2A' }}>{category.name}</h2>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#aaa' }}>
                    {category.menu_items.length === 0 ? 'No items yet' : `${category.menu_items.length} item${category.menu_items.length === 1 ? '' : 's'}`}
                  </p>
                </div>
              )}
            </div>

            {editingCategoryId !== category.id && (
              <DotsMenu options={[
                {
                  label: '✏️  Rename category',
                  onClick: () => { setEditingCategoryId(category.id); setEditingCategoryName(category.name) }
                },
                {
                  label: '🗑️  Delete category',
                  onClick: () => requestDeleteCategory(category),
                  danger: true
                },
              ]} />
            )}
          </div>

          {/* Empty category state */}
          {category.menu_items.length === 0 && addingItem !== category.id && (
            <div style={{ padding: '20px', background: '#f0f9ff', borderRadius: 8, textAlign: 'center', marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#aaa' }}>No items yet. Add your first item below.</p>
            </div>
          )}

          {/* Items */}
          {category.menu_items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0', gap: 12 }}>
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: 8, background: '#e0f2fe', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  🍽️
                </div>
              )}

              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 500, color: item.is_available ? '#0D1B2A' : '#aaa' }}>{item.name}</p>
                {item.description && <p style={{ margin: '2px 0 0', fontSize: 13, color: '#888', whiteSpace: 'pre-line' as const }}>{item.description}</p>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, color: item.is_available ? '#0D1B2A' : '#aaa', fontSize: 14 }}>{restaurant.currency || 'USD'} {item.price}</span>
                <div
                  onClick={() => toggleAvailable(category.id, item.id, item.is_available)}
                  style={{ width: 40, height: 22, borderRadius: 11, cursor: 'pointer', background: item.is_available ? '#22c55e' : '#d1d5db', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                >
                  <div style={{ position: 'absolute', top: 3, left: item.is_available ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </div>
                <DotsMenu options={[
                  {
                    label: '✏️  Edit item',
                    onClick: () => setEditingItem({ item, categoryId: category.id })
                  },
                  {
                    label: '🗑️  Delete item',
                    onClick: () => requestDeleteItem(category.id, item),
                    danger: true
                  },
                ]} />
              </div>
            </div>
          ))}

          {/* Add Item Form */}
          {addingItem === category.id ? (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input type="text" placeholder="Item name *" value={newItems[category.id]?.name || ''} onChange={e => setNewItems({ ...newItems, [category.id]: { ...newItems[category.id], name: e.target.value } })} style={inputStyle} />

              <MiniMarkdownToolbar
                textareaRef={{ current: newItemDescriptionRefs.current[category.id] }}
                value={newItems[category.id]?.description || ''}
                onChange={(value) => setNewItems({ ...newItems, [category.id]: { ...newItems[category.id], description: value } })}
              />
              <textarea
                ref={el => { newItemDescriptionRefs.current[category.id] = el }}
                placeholder="Description"
                value={newItems[category.id]?.description || ''}
                onChange={e => setNewItems({ ...newItems, [category.id]: { ...newItems[category.id], description: e.target.value } })}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: 1.5 }}
              />

              <input type="number" placeholder="Price" value={newItems[category.id]?.price || ''} onChange={e => setNewItems({ ...newItems, [category.id]: { ...newItems[category.id], price: e.target.value } })} style={inputStyle} />

              <div
                onClick={() => fileInputRefs.current[category.id]?.click()}
                style={{ border: '1px dashed #bae6fd', borderRadius: 8, padding: '12px', textAlign: 'center', cursor: 'pointer', background: '#f0f9ff' }}
              >
                {uploadingImage === category.id ? (
                  <p style={{ margin: 0, fontSize: 13, color: '#888' }}>Uploading...</p>
                ) : newItems[category.id]?.image_url ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={newItems[category.id].image_url} alt="" style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }} />
                    <p style={{ margin: 0, fontSize: 13, color: '#22c55e' }}>Image uploaded ✓</p>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: 13, color: '#888' }}>📷 Tap to add item photo <span style={{ color: '#aaa' }}>(optional)</span></p>
                )}
                <input ref={el => { fileInputRefs.current[category.id] = el }} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const file = e.target.files?.[0]; if (file) handleImageUpload(category.id, file) }} />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => addItem(category.id)} style={{ padding: '8px 20px', borderRadius: 8, background: '#38BDF8', color: '#0D1B2A', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  Save item
                </button>
                <button onClick={() => setAddingItem(null)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 14 }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingItem(category.id)}
              style={{ marginTop: 12, padding: '7px 16px', borderRadius: 8, border: '1px dashed #bae6fd', background: '#f0f9ff', cursor: 'pointer', fontSize: 14, color: '#38BDF8', fontWeight: 500 }}
            >
              + Add item
            </button>
          )}
        </div>
      ))}
    </div>
  )
}