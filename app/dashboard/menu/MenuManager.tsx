'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
}

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
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const supabase = createClient()
  const router = useRouter()

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

  async function deleteCategory(categoryId: string) {
    await supabase.from('categories').delete().eq('id', categoryId)
    setCategories(categories.filter(c => c.id !== categoryId))
  }

  async function handleImageUpload(categoryId: string, file: File) {
    setUploadingImage(categoryId)
    const ext = file.name.split('.').pop()
    const fileName = `${restaurant.id}/${Date.now()}.${ext}`
    const { data, error } = await supabase.storage
      .from('menu-images')
      .upload(fileName, file, { upsert: true })
    if (!error && data) {
      const { data: urlData } = supabase.storage
        .from('menu-images')
        .getPublicUrl(fileName)
      setNewItems({
        ...newItems,
        [categoryId]: { ...newItems[categoryId], image_url: urlData.publicUrl }
      })
    }
    setUploadingImage(null)
  }

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
      setCategories(categories.map(c =>
        c.id === categoryId
          ? { ...c, menu_items: [...c.menu_items, data] }
          : c
      ))
      setNewItems({ ...newItems, [categoryId]: { name: '', description: '', price: '', image_url: '' } })
      setAddingItem(null)
    }
  }

  async function deleteItem(categoryId: string, itemId: string) {
    await supabase.from('menu_items').delete().eq('id', itemId)
    setCategories(categories.map(c =>
      c.id === categoryId
        ? { ...c, menu_items: c.menu_items.filter(i => i.id !== itemId) }
        : c
    ))
  }

  async function toggleAvailable(categoryId: string, itemId: string, current: boolean) {
    await supabase.from('menu_items').update({ is_available: !current }).eq('id', itemId)
    setCategories(categories.map(c =>
      c.id === categoryId
        ? { ...c, menu_items: c.menu_items.map(i => i.id === itemId ? { ...i, is_available: !current } : i) }
        : c
    ))
  }

  const inputStyle = {
    padding: '8px 12px', borderRadius: 8,
    border: '1px solid #ddd', fontSize: 14, width: '100%'
  }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0 }}>Menu</h1>
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
      <div style={{ background: '#f9f9f9', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px' }}>Add Category</h3>
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
            style={{ padding: '8px 20px', borderRadius: 8, background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap' }}
          >
            {addingCategory ? 'Adding...' : '+ Add'}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {categories.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed #ddd', borderRadius: 12 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
          <h3 style={{ margin: '0 0 8px', color: '#333' }}>Your menu is empty</h3>
          <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
            Start by adding a category above — like "Burgers" or "Drinks" — then add items inside it.
          </p>
        </div>
      )}

      {/* Categories */}
      {categories.map(category => (
        <div key={category.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          {/* Category Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18 }}>{category.name}</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#aaa' }}>
                {category.menu_items.length === 0
                  ? 'No items yet'
                  : `${category.menu_items.length} item${category.menu_items.length === 1 ? '' : 's'}`}
              </p>
            </div>
            <button
              onClick={() => deleteCategory(category.id)}
              style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #ffcccc', background: '#fff5f5', color: '#cc0000', cursor: 'pointer', fontSize: 13 }}
            >
              Delete
            </button>
          </div>

          {/* Empty state */}
          {category.menu_items.length === 0 && addingItem !== category.id && (
            <div style={{ padding: '20px', background: '#fafafa', borderRadius: 8, textAlign: 'center', marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#aaa' }}>No items yet. Add your first item below.</p>
            </div>
          )}

          {/* Items */}
          {category.menu_items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0', gap: 12 }}>
              {/* Thumbnail */}
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: 8, background: '#f0f0f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  🍽️
                </div>
              )}

              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 500, color: item.is_available ? '#000' : '#aaa' }}>{item.name}</p>
                {item.description && <p style={{ margin: '2px 0 0', fontSize: 13, color: '#888' }}>{item.description}</p>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, color: item.is_available ? '#000' : '#aaa', fontSize: 14 }}>Rs {item.price}</span>
                <div
                  onClick={() => toggleAvailable(category.id, item.id, item.is_available)}
                  style={{
                    width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
                    background: item.is_available ? '#22c55e' : '#d1d5db',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 3,
                    left: item.is_available ? 21 : 3,
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#fff', transition: 'left 0.2s'
                  }} />
                </div>
                <button
                  onClick={() => deleteItem(category.id, item.id)}
                  style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid #ffcccc', background: '#fff5f5', color: '#cc0000', cursor: 'pointer', fontSize: 12 }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {/* Add Item Form */}
          {addingItem === category.id ? (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                type="text"
                placeholder="Item name *"
                value={newItems[category.id]?.name || ''}
                onChange={e => setNewItems({ ...newItems, [category.id]: { ...newItems[category.id], name: e.target.value } })}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Description"
                value={newItems[category.id]?.description || ''}
                onChange={e => setNewItems({ ...newItems, [category.id]: { ...newItems[category.id], description: e.target.value } })}
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Price"
                value={newItems[category.id]?.price || ''}
                onChange={e => setNewItems({ ...newItems, [category.id]: { ...newItems[category.id], price: e.target.value } })}
                style={inputStyle}
              />

              {/* Image upload */}
              <div
                onClick={() => fileInputRefs.current[category.id]?.click()}
                style={{
                  border: '1px dashed #ddd', borderRadius: 8, padding: '12px',
                  textAlign: 'center', cursor: 'pointer', background: '#fafafa'
                }}
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
                <input
                  ref={el => { fileInputRefs.current[category.id] = el }}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(category.id, file)
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => addItem(category.id)}
                  style={{ padding: '8px 20px', borderRadius: 8, background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14 }}
                >
                  Save item
                </button>
                <button
                  onClick={() => setAddingItem(null)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 14 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingItem(category.id)}
              style={{ marginTop: 12, padding: '7px 16px', borderRadius: 8, border: '1px dashed #ccc', background: '#fff', cursor: 'pointer', fontSize: 14, color: '#555' }}
            >
              + Add item
            </button>
          )}
        </div>
      ))}
    </div>
  )
}