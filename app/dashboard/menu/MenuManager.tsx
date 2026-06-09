'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  is_available: boolean
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
  const [newItems, setNewItems] = useState<Record<string, { name: string; description: string; price: string }>>({})
  const [addingItem, setAddingItem] = useState<string | null>(null)
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

  async function addItem(categoryId: string) {
    const item = newItems[categoryId]
    if (!item?.name.trim()) return

    const { data, error } = await supabase.from('menu_items').insert({
      category_id: categoryId,
      restaurant_id: restaurant.id,
      name: item.name.trim(),
      description: item.description.trim(),
      price: parseFloat(item.price) || 0,
    }).select().single()

    if (!error && data) {
      setCategories(categories.map(c =>
        c.id === categoryId
          ? { ...c, menu_items: [...c.menu_items, data] }
          : c
      ))
      setNewItems({ ...newItems, [categoryId]: { name: '', description: '', price: '' } })
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
            style={{ padding: '8px 20px', borderRadius: 8, background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap' }}
          >
            + Add
          </button>
        </div>
      </div>

      {/* Categories */}
      {categories.length === 0 && (
        <p style={{ color: '#888', textAlign: 'center', marginTop: 40 }}>No categories yet. Add one above to get started.</p>
      )}

      {categories.map(category => (
        <div key={category.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          {/* Category Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>{category.name}</h2>
            <button
              onClick={() => deleteCategory(category.id)}
              style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #ffcccc', background: '#fff5f5', color: '#cc0000', cursor: 'pointer', fontSize: 13 }}
            >
              Delete
            </button>
          </div>

          {/* Items */}
          {category.menu_items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 500 }}>{item.name}</p>
                {item.description && <p style={{ margin: '2px 0 0', fontSize: 13, color: '#888' }}>{item.description}</p>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 600 }}>Rs {item.price}</span>
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
                placeholder="Price (Rs)"
                value={newItems[category.id]?.price || ''}
                onChange={e => setNewItems({ ...newItems, [category.id]: { ...newItems[category.id], price: e.target.value } })}
                style={inputStyle}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => addItem(category.id)}
                  style={{ padding: '8px 20px', borderRadius: 8, background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14 }}
                >
                  Save Item
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