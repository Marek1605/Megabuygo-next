'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface CategoryFlat {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string | null
  icon?: string
  product_count: number
  depth: number
  path: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryFlat[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: '',
    emoji: '',
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const [deleting, setDeleting] = useState(false)

  async function deleteAllCategories() {
    if (!confirm("POZOR! Naozaj vymazat VSETKY kategorie?")) return
    if (!confirm("Ste si NAOZAJ isty? Toto vymaze aj produkty z kategorii!")) return
    setDeleting(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/categories/all`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        alert("Vsetky kategorie vymazane: " + data.count)
        loadCategories()
      } else {
        alert(data.error || "Chyba")
      }
    } catch (e) { alert("Chyba pri mazani") }
    setDeleting(false)
  }

  async function loadCategories() {
    setLoading(true)
    const cats = await api.getCategoriesFlat()
    if (cats) {
      setCategories(cats)
    }
    setLoading(false)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, slug: f.slug || generateSlug(name) }))
  }

  const resetForm = () => {
    setForm({ name: '', slug: '', description: '', parent_id: '', emoji: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const editCategory = (cat: CategoryFlat) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      parent_id: cat.parent_id || '',
      emoji: cat.icon || '',
    })
    setEditingId(cat.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const data = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      parent_id: form.parent_id || null,
      icon: form.emoji,
    }
    
    if (editingId) {
      await api.updateCategory(editingId, data)
    } else {
      await api.createCategory(data)
    }
    
    resetForm()
    loadCategories()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Naozaj chcete vymazať túto kategóriu?')) return
    await api.deleteCategory(id)
    loadCategories()
  }

  const getParentOptions = () => {
    if (!editingId) return categories
    
    const descendants = new Set<string>()
    const findDescendants = (parentId: string) => {
      categories.forEach(c => {
        if (c.parent_id === parentId) {
          descendants.add(c.id)
          findDescendants(c.id)
        }
      })
    }
    findDescendants(editingId)
    
    return categories.filter(c => c.id !== editingId && !descendants.has(c.id))
  }

  return (
    <div>
      <style jsx>{`
        .cat-tree {
          background: #fff;
          border-radius: 8px;
        }
        .cat-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
        }
        .cat-item:hover {
          background: #f9fafb;
        }
        .cat-item:last-child {
          border-bottom: none;
        }
        .cat-indent {
          display: inline-block;
          width: 20px;
          height: 16px;
          border-left: 1px solid #d1d5db;
          border-bottom: 1px solid #d1d5db;
          margin-right: 8px;
        }
        .cat-name {
          flex: 1;
          font-weight: 500;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cat-emoji {
          font-size: 18px;
        }
        .cat-slug {
          color: #9ca3af;
          font-size: 13px;
          margin-left: 8px;
        }
        .cat-count {
          color: #6b7280;
          font-size: 13px;
          padding: 4px 10px;
          background: #f3f4f6;
          border-radius: 20px;
          margin-left: 12px;
        }
        .cat-actions {
          display: flex;
          gap: 8px;
          margin-left: 12px;
        }
        .cat-btn {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #fff;
          color: #374151;
          font-size: 13px;
          cursor: pointer;
        }
        .cat-btn:hover {
          border-color: #ff6b35;
          color: #ff6b35;
        }
        .cat-btn.delete {
          color: #dc2626;
        }
        .cat-btn.delete:hover {
          border-color: #dc2626;
        }
        .form-container {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          padding: 24px;
          margin-bottom: 24px;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-full {
          grid-column: 1 / -1;
        }
        .emoji-picker {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
        }
        .emoji-btn {
          width: 36px;
          height: 36px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: #fff;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .emoji-btn:hover, .emoji-btn.selected {
          border-color: #ff6b35;
          background: #fff5f0;
        }
      `}</style>

      <div className="admin-header">
        <h1 className="admin-title">Kategórie</h1>
        <button className="admin-btn" style={{background:"#dc2626",marginRight:12}} onClick={deleteAllCategories} disabled={deleting}>{deleting ? "Mazem..." : "Vymazat vsetky"}</button>
        <button className="admin-btn" onClick={() => setShowForm(true)}>
          + Pridať kategóriu
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h3 style={{margin: '0 0 20px', fontWeight: 600}}>
            {editingId ? 'Upraviť kategóriu' : 'Nová kategória'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="admin-form-group">
                <label className="admin-label">Názov kategórie *</label>
                <input
                  type="text"
                  className="admin-input"
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Elektronika"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">URL slug</label>
                <input
                  type="text"
                  className="admin-input"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="elektronika"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Nadradená kategória</label>
                <select 
                  className="admin-select" 
                  value={form.parent_id} 
                  onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}
                >
                  <option value="">— Žiadna (hlavná kategória)</option>
                  {getParentOptions().map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {'—'.repeat(cat.depth)} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Ikona (emoji)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={form.emoji}
                  onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                  placeholder="📱"
                  maxLength={2}
                />
                <div className="emoji-picker">
                  {['📱', '💻', '📺', '🎧', '🎮', '📷', '🏡', '⚽', '👕', '🍎', '🚗', '📚'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      className={`emoji-btn ${form.emoji === emoji ? 'selected' : ''}`}
                      onClick={() => setForm(f => ({ ...f, emoji }))}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="admin-form-group form-full">
                <label className="admin-label">Popis</label>
                <textarea
                  className="admin-textarea"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Popis kategórie..."
                  rows={3}
                />
              </div>
            </div>

            <div style={{display: 'flex', gap: 12, marginTop: 20}}>
              <button type="submit" className="admin-btn">
                {editingId ? 'Uložiť zmeny' : 'Pridať kategóriu'}
              </button>
              <button type="button" className="admin-btn admin-btn-outline" onClick={resetForm}>
                Zrušiť
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        <div className="cat-tree">
          {loading ? (
            <div style={{padding: 40, textAlign: 'center', color: '#6b7280'}}>
              Načítavam...
            </div>
          ) : categories.length === 0 ? (
            <div style={{padding: 40, textAlign: 'center'}}>
              <div style={{fontSize: 48, marginBottom: 12}}>📁</div>
              <p style={{color: '#6b7280'}}>Žiadne kategórie</p>
            </div>
          ) : (
            categories.map(cat => (
              <div key={cat.id} className="cat-item">
                <div className="cat-name">
                  {Array.from({length: cat.depth}).map((_, i) => (
                    <span key={i} className="cat-indent" />
                  ))}
                  {cat.icon && <span className="cat-emoji">{cat.icon}</span>}
                  {cat.name}
                  <span className="cat-slug">/{cat.slug}</span>
                </div>
                <span className="cat-count">{cat.product_count} produktov</span>
                <div className="cat-actions">
                  <button className="cat-btn" onClick={() => editCategory(cat)}>
                    Upraviť
                  </button>
                  <button className="cat-btn delete" onClick={() => handleDelete(cat.id)}>
                    Vymazať
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
