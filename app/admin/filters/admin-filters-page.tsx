'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

interface AttributeStats {
  name: string
  slug: string
  product_count: number
  value_count: number
  is_filterable?: boolean
}

interface FilterSettings {
  filterable_attributes: string[]
  show_price_filter: boolean
  show_stock_filter: boolean
  show_brand_filter: boolean
  max_values_per_filter: number
}

export default function AdminFiltersPage() {
  const [attributes, setAttributes] = useState<AttributeStats[]>([])
  const [settings, setSettings] = useState<FilterSettings>({
    filterable_attributes: [],
    show_price_filter: true,
    show_stock_filter: true,
    show_brand_filter: true,
    max_values_per_filter: 20
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'product_count' | 'value_count'>('product_count')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    
    // Load attribute stats
    const attrRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attributes/stats`)
    if (attrRes.ok) {
      const data = await attrRes.json()
      if (data.success) {
        setAttributes(data.data || [])
      }
    }
    
    // Load filter settings
    const settingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/filter-settings`)
    if (settingsRes.ok) {
      const data = await settingsRes.json()
      if (data.success && data.data) {
        const parsed = typeof data.data === 'string' ? JSON.parse(data.data) : data.data
        setSettings(parsed)
      }
    }
    
    setLoading(false)
  }

  async function saveSettings() {
    setSaving(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/filter-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (res.ok) {
        alert('Nastavenia uložené!')
      } else {
        alert('Chyba pri ukladaní')
      }
    } catch (e) {
      alert('Chyba pri ukladaní')
    }
    setSaving(false)
  }

  function toggleAttribute(slug: string) {
    setSettings(prev => ({
      ...prev,
      filterable_attributes: prev.filterable_attributes.includes(slug)
        ? prev.filterable_attributes.filter(s => s !== slug)
        : [...prev.filterable_attributes, slug]
    }))
  }

  function selectTopN(n: number) {
    const sorted = [...attributes].sort((a, b) => b.product_count - a.product_count)
    const topSlugs = sorted.slice(0, n).map(a => a.slug)
    setSettings(prev => ({ ...prev, filterable_attributes: topSlugs }))
  }

  function selectAll() {
    setSettings(prev => ({ ...prev, filterable_attributes: attributes.map(a => a.slug) }))
  }

  function selectNone() {
    setSettings(prev => ({ ...prev, filterable_attributes: [] }))
  }

  // Filter and sort attributes
  const filteredAttributes = attributes
    .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'product_count') return b.product_count - a.product_count
      return b.value_count - a.value_count
    })

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Načítavam...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Link href="/admin" style={{ color: '#6b7280', textDecoration: 'none', fontSize: 14 }}>← Späť do administrácie</Link>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: '8px 0 0' }}>Nastavenie filtrov</h1>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            style={{
              padding: '12px 24px',
              background: saving ? '#ccc' : '#ff6b35',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? 'Ukladám...' : '💾 Uložiť nastavenia'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
          {/* Attribute list */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
                Atribúty produktov ({attributes.length})
              </h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => selectTopN(5)} style={{ padding: '6px 12px', fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>Top 5</button>
                <button onClick={() => selectTopN(10)} style={{ padding: '6px 12px', fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>Top 10</button>
                <button onClick={() => selectTopN(20)} style={{ padding: '6px 12px', fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>Top 20</button>
                <button onClick={selectAll} style={{ padding: '6px 12px', fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>Všetky</button>
                <button onClick={selectNone} style={{ padding: '6px 12px', fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>Žiadne</button>
              </div>
            </div>

            {/* Search and sort */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <input
                type="text"
                placeholder="Hľadať atribút..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
              />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
              >
                <option value="product_count">Podľa počtu produktov</option>
                <option value="value_count">Podľa počtu hodnôt</option>
                <option value="name">Podľa názvu</option>
              </select>
            </div>

            {/* Attribute table */}
            <div style={{ maxHeight: 600, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>FILTER</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>ATRIBÚT</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>PRODUKTY</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>HODNOTY</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttributes.map(attr => (
                    <tr 
                      key={attr.slug}
                      onClick={() => toggleAttribute(attr.slug)}
                      style={{ 
                        borderBottom: '1px solid #f3f4f6', 
                        cursor: 'pointer',
                        background: settings.filterable_attributes.includes(attr.slug) ? '#fff7ed' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '12px 8px' }}>
                        <input
                          type="checkbox"
                          checked={settings.filterable_attributes.includes(attr.slug)}
                          onChange={() => {}}
                          style={{ width: 18, height: 18, accentColor: '#ff6b35' }}
                        />
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ fontWeight: 500, color: '#1f2937' }}>{attr.name}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>{attr.slug}</div>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <span style={{ 
                          display: 'inline-block',
                          padding: '4px 8px',
                          background: attr.product_count > 100 ? '#dcfce7' : attr.product_count > 10 ? '#fef3c7' : '#f3f4f6',
                          color: attr.product_count > 100 ? '#166534' : attr.product_count > 10 ? '#92400e' : '#6b7280',
                          borderRadius: 4,
                          fontSize: 13,
                          fontWeight: 500
                        }}>
                          {attr.product_count}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', color: '#6b7280' }}>
                        {attr.value_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAttributes.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
                  {attributes.length === 0 
                    ? 'Žiadne atribúty. Importujte produkty s PARAM tagmi.'
                    : 'Žiadne výsledky pre hľadaný výraz.'}
                </div>
              )}
            </div>
          </div>

          {/* Settings panel */}
          <div>
            {/* Active filters */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px' }}>
                ✅ Aktívne filtre ({settings.filterable_attributes.length})
              </h3>
              {settings.filterable_attributes.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {settings.filterable_attributes.map(slug => {
                    const attr = attributes.find(a => a.slug === slug)
                    return (
                      <span
                        key={slug}
                        onClick={() => toggleAttribute(slug)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          background: '#fff7ed',
                          border: '1px solid #fed7aa',
                          borderRadius: 20,
                          fontSize: 13,
                          color: '#c2410c',
                          cursor: 'pointer'
                        }}
                      >
                        {attr?.name || slug}
                        <span style={{ fontSize: 16, lineHeight: 1 }}>×</span>
                      </span>
                    )
                  })}
                </div>
              ) : (
                <p style={{ color: '#9ca3af', fontSize: 14 }}>Žiadne aktívne atribútové filtre</p>
              )}
            </div>

            {/* Basic settings */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 20px' }}>⚙️ Základné nastavenia</h3>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.show_price_filter}
                  onChange={e => setSettings(prev => ({ ...prev, show_price_filter: e.target.checked }))}
                  style={{ width: 18, height: 18, accentColor: '#ff6b35' }}
                />
                <span style={{ fontSize: 14 }}>Zobraziť filter ceny</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.show_stock_filter}
                  onChange={e => setSettings(prev => ({ ...prev, show_stock_filter: e.target.checked }))}
                  style={{ width: 18, height: 18, accentColor: '#ff6b35' }}
                />
                <span style={{ fontSize: 14 }}>Zobraziť filter skladovosti</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.show_brand_filter}
                  onChange={e => setSettings(prev => ({ ...prev, show_brand_filter: e.target.checked }))}
                  style={{ width: 18, height: 18, accentColor: '#ff6b35' }}
                />
                <span style={{ fontSize: 14 }}>Zobraziť filter značiek</span>
              </label>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                  Max. hodnôt na filter
                </label>
                <input
                  type="number"
                  value={settings.max_values_per_filter}
                  onChange={e => setSettings(prev => ({ ...prev, max_values_per_filter: parseInt(e.target.value) || 20 }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
