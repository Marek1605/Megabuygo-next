"use client"

import { useState, useEffect } from 'react'

interface AttributeStat {
  name: string
  slug: string
  product_count: number
  value_count: number
}

interface FilterSettings {
  filterable_attributes: string[]
  show_price_filter: boolean
  show_stock_filter: boolean
  show_brand_filter: boolean
  max_values_per_filter: number
}

export default function AdminFiltersPage() {
  const [attributes, setAttributes] = useState<AttributeStat[]>([])
  const [settings, setSettings] = useState<FilterSettings>({
    filterable_attributes: [],
    show_price_filter: true,
    show_stock_filter: true,
    show_brand_filter: true,
    max_values_per_filter: 20
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const attrRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/attributes/stats`)
      const attrData = await attrRes.json()
      if (attrData.success) setAttributes(attrData.data || [])

      const settingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/filter-settings`)
      const settingsData = await settingsRes.json()
      if (settingsData.success && settingsData.data) {
        const parsed = typeof settingsData.data === 'string' ? JSON.parse(settingsData.data) : settingsData.data
        setSettings(parsed)
      }
    } catch (error) {
      console.error('Error loading data:', error)
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
      const data = await res.json()
      if (data.success) alert('Nastavenia ulozene!')
      else alert('Chyba pri ukladani')
    } catch (error) {
      alert('Chyba pri ukladani')
    }
    setSaving(false)
  }

  function toggleAttribute(name: string) {
    setSettings(s => ({
      ...s,
      filterable_attributes: s.filterable_attributes.includes(name)
        ? s.filterable_attributes.filter(a => a !== name)
        : [...s.filterable_attributes, name]
    }))
  }

  function selectTop(n: number) {
    const sorted = [...attributes].sort((a, b) => b.product_count - a.product_count)
    setSettings(s => ({ ...s, filterable_attributes: sorted.slice(0, n).map(a => a.name) }))
  }

  const filteredAttributes = attributes
    .filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.product_count - a.product_count)

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Nacitavam...</div>

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Nastavenie filtrov</h1>
        <button 
          onClick={saveSettings} 
          disabled={saving}
          style={{ padding: '12px 24px', background: '#c9a87c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          {saving ? 'Ukladam...' : 'Ulozit nastavenia'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Dostupne atributy ({attributes.length})</h2>
          
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Hladat atribut..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: 8 }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button onClick={() => selectTop(5)} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Top 5</button>
            <button onClick={() => selectTop(10)} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Top 10</button>
            <button onClick={() => selectTop(20)} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Top 20</button>
            <button onClick={() => setSettings(s => ({ ...s, filterable_attributes: [] }))} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Zrusit</button>
          </div>

          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: 12, textAlign: 'left', width: 40 }}></th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Nazov</th>
                  <th style={{ padding: 12, textAlign: 'left', width: 100 }}>Produkty</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttributes.map(attr => (
                  <tr 
                    key={attr.name}
                    onClick={() => toggleAttribute(attr.name)}
                    style={{ cursor: 'pointer', background: settings.filterable_attributes.includes(attr.name) ? '#fef7ed' : 'transparent' }}
                  >
                    <td style={{ padding: 12 }}>
                      <input type="checkbox" checked={settings.filterable_attributes.includes(attr.name)} onChange={() => {}} style={{ width: 18, height: 18 }} />
                    </td>
                    <td style={{ padding: 12, fontWeight: 500 }}>{attr.name}</td>
                    <td style={{ padding: 12, color: '#6b7280' }}>{attr.product_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Zakladne nastavenia</h2>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}>
              <input type="checkbox" checked={settings.show_price_filter} onChange={e => setSettings(s => ({ ...s, show_price_filter: e.target.checked }))} style={{ width: 18, height: 18 }} />
              <span>Filter ceny</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}>
              <input type="checkbox" checked={settings.show_stock_filter} onChange={e => setSettings(s => ({ ...s, show_stock_filter: e.target.checked }))} style={{ width: 18, height: 18 }} />
              <span>Filter skladu</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', cursor: 'pointer' }}>
              <input type="checkbox" checked={settings.show_brand_filter} onChange={e => setSettings(s => ({ ...s, show_brand_filter: e.target.checked }))} style={{ width: 18, height: 18 }} />
              <span>Filter znacky</span>
            </label>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Aktivne filtre ({settings.filterable_attributes.length})</h2>
            {settings.filterable_attributes.length === 0 ? (
              <p style={{ color: '#6b7280' }}>Ziadne atributy nie su vybrane</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {settings.filterable_attributes.map(name => (
                  <span key={name} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#c9a87c', color: '#fff', borderRadius: 20, fontSize: 12 }}>
                    {name}
                    <button onClick={() => toggleAttribute(name)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>x</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}