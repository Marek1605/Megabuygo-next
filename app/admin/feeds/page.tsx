'use client'

import { useState, useEffect, useRef } from 'react'

interface Feed {
  id: string
  name: string
  url: string
  type: string
  schedule: string
  is_active: boolean
  last_run?: string
  last_status?: string
  product_count?: number
  xml_item_path?: string
  field_mapping?: Record<string, string>
}

interface ImportProgress {
  status: string
  message: string
  total: number
  processed: number
  created: number
  updated: number
  skipped: number
  errors: number
  percent: number
  logs: string[]
}

interface FeedPreview {
  fields: string[]
  sample: any[]
  total_items?: number
  attributes?: { name: string; count: number }[]
  categories?: { name: string; count: number }[]
}

const targetFields = [
  { value: '', label: '-- Ignorovat --' },
  { value: 'title', label: 'Nazov produktu' },
  { value: 'description', label: 'Popis' },
  { value: 'short_description', label: 'Kratky popis' },
  { value: 'price', label: 'Cena' },
  { value: 'ean', label: 'EAN' },
  { value: 'sku', label: 'SKU' },
  { value: 'brand', label: 'Znacka' },
  { value: 'image_url', label: 'Obrazok' },
  { value: 'url', label: 'URL produktu' },
  { value: 'category', label: 'Kategoria' },
  { value: 'stock_status', label: 'Stav skladu' },
]

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [feedPreview, setFeedPreview] = useState<FeedPreview | null>(null)
  const [previewError, setPreviewError] = useState('')
  const [activeTab, setActiveTab] = useState<'fields' | 'attributes' | 'categories'>('fields')
  
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'xml',
    schedule: 'daily',
    is_active: true,
    xml_item_path: 'SHOPITEM',
    field_mapping: {} as Record<string, string>,
  })
  
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadFeeds()
    return () => { if (progressInterval.current) clearInterval(progressInterval.current) }
  }, [])

  async function loadFeeds() {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/feeds`)
      const data = await res.json()
      if (data.success) setFeeds(data.data || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  function openAddModal() {
    setEditingFeed(null)
    setFormData({ name: '', url: '', type: 'xml', schedule: 'daily', is_active: true, xml_item_path: 'SHOPITEM', field_mapping: {} })
    setFeedPreview(null)
    setPreviewError('')
    setShowModal(true)
  }

  function openEditModal(feed: Feed) {
    setEditingFeed(feed)
    setFormData({
      name: feed.name,
      url: feed.url,
      type: feed.type || 'xml',
      schedule: feed.schedule || 'daily',
      is_active: feed.is_active,
      xml_item_path: feed.xml_item_path || 'SHOPITEM',
      field_mapping: feed.field_mapping || {},
    })
    setFeedPreview(null)
    setPreviewError('')
    setShowModal(true)
  }

  async function previewFeed() {
    if (!formData.url) { setPreviewError('Zadajte URL'); return }
    setPreviewLoading(true)
    setPreviewError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/feeds/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.url, type: formData.type, xml_item_path: formData.xml_item_path }),
      })
      const data = await res.json()
      if (data.success) setFeedPreview(data.data)
      else setPreviewError(data.error || 'Chyba')
    } catch (e) { setPreviewError('Chyba pri nacitavani') }
    setPreviewLoading(false)
  }

  async function saveFeed() {
    if (!formData.name || !formData.url) { alert('Vyplnte nazov a URL'); return }
    try {
      const url = editingFeed 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/feeds/${editingFeed.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/feeds`
      const res = await fetch(url, {
        method: editingFeed ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) { setShowModal(false); loadFeeds() }
      else alert(data.error || 'Chyba')
    } catch (e) { alert('Chyba pri ukladani') }
  }

  async function deleteFeed(id: string, name: string) {
    if (!confirm(`Vymazat feed "${name}"?`)) return
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/feeds/${id}`, { method: 'DELETE' })
      loadFeeds()
    } catch (e) { alert('Chyba') }
  }

  async function startImport(feed: Feed) {
    setShowImportModal(true)
    setImportProgress({ status: 'downloading', message: 'Stahujem...', total: 0, processed: 0, created: 0, updated: 0, skipped: 0, errors: 0, percent: 0, logs: ['Start...'] })
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/feeds/${feed.id}/import`, { method: 'POST' })
      const data = await res.json()
      if (data.success) pollProgress(feed.id)
      else setImportProgress(p => p ? { ...p, status: 'failed', message: data.error } : null)
    } catch (e) { setImportProgress(p => p ? { ...p, status: 'failed', message: 'Chyba' } : null) }
  }

  function pollProgress(feedId: string) {
    progressInterval.current = setInterval(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/feeds/${feedId}/progress`)
        const data = await res.json()
        if (data.success && data.data) {
          setImportProgress(data.data)
          if (data.data.status === 'completed' || data.data.status === 'failed') {
            if (progressInterval.current) clearInterval(progressInterval.current)
            loadFeeds()
          }
        }
      } catch (e) {}
    }, 1000)
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>XML Feedy</h1>
        <button onClick={openAddModal} style={{ padding: '12px 24px', background: '#c9a87c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>+ Pridat feed</button>
      </div>

      {loading ? <p>Nacitavam...</p> : feeds.length === 0 ? <p>Ziadne feedy</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {feeds.map(feed => (
            <div key={feed.id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{feed.name}</h3>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                  {feed.type?.toUpperCase()} | {feed.product_count || 0} produktov | {feed.last_status || 'idle'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEditModal(feed)} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Upravit</button>
                <button onClick={() => startImport(feed)} style={{ padding: '8px 16px', background: '#c9a87c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Importovat</button>
                <button onClick={() => deleteFeed(feed.id, feed.name)} style={{ padding: '8px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Vymazat</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '90%', maxWidth: 800, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: 20, borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ margin: 0 }}>{editingFeed ? 'Upravit feed' : 'Novy feed'}</h2>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Nazov *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #e5e7eb', borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Typ</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #e5e7eb', borderRadius: 8 }}>
                    <option value="xml">XML</option>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>URL *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="url" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} style={{ flex: 1, padding: 10, border: '1px solid #e5e7eb', borderRadius: 8 }} />
                  <button onClick={previewFeed} disabled={previewLoading} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer' }}>{previewLoading ? '...' : 'Nahled'}</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>XML Item Path</label>
                  <input type="text" value={formData.xml_item_path} onChange={e => setFormData({ ...formData, xml_item_path: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #e5e7eb', borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Plan</label>
                  <select value={formData.schedule} onChange={e => setFormData({ ...formData, schedule: e.target.value })} style={{ width: '100%', padding: 10, border: '1px solid #e5e7eb', borderRadius: 8 }}>
                    <option value="manual">Manualne</option>
                    <option value="daily">Denne</option>
                    <option value="hourly">Kazdou hodinu</option>
                  </select>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
                Aktivny feed
              </label>
              
              {previewError && <div style={{ background: '#fee2e2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16 }}>{previewError}</div>}
              
              {feedPreview && (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <button onClick={() => setActiveTab('fields')} style={{ padding: 12, border: 'none', background: activeTab === 'fields' ? '#fff' : 'transparent', cursor: 'pointer', fontWeight: activeTab === 'fields' ? 600 : 400 }}>Polia ({feedPreview.fields.length})</button>
                    <button onClick={() => setActiveTab('attributes')} style={{ padding: 12, border: 'none', background: activeTab === 'attributes' ? '#fff' : 'transparent', cursor: 'pointer', fontWeight: activeTab === 'attributes' ? 600 : 400 }}>Atributy ({feedPreview.attributes?.length || 0})</button>
                    <button onClick={() => setActiveTab('categories')} style={{ padding: 12, border: 'none', background: activeTab === 'categories' ? '#fff' : 'transparent', cursor: 'pointer', fontWeight: activeTab === 'categories' ? 600 : 400 }}>Kategorie ({feedPreview.categories?.length || 0})</button>
                    <span style={{ marginLeft: 'auto', padding: 12, color: '#16a34a', fontWeight: 600 }}>{feedPreview.total_items} poloziek</span>
                  </div>
                  <div style={{ padding: 16, maxHeight: 300, overflow: 'auto' }}>
                    {activeTab === 'fields' && (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: '#f9fafb' }}><th style={{ padding: 8, textAlign: 'left' }}>Pole</th><th style={{ padding: 8, textAlign: 'left' }}>Ukazka</th><th style={{ padding: 8, textAlign: 'left' }}>Mapovat na</th></tr></thead>
                        <tbody>
                          {feedPreview.fields.filter(f => !f.startsWith('_')).map(field => (
                            <tr key={field}>
                              <td style={{ padding: 8, fontWeight: 500 }}>{field}</td>
                              <td style={{ padding: 8, color: '#6b7280', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(feedPreview.sample[0]?.[field] || '-').substring(0, 80)}</td>
                              <td style={{ padding: 8 }}>
                                <select value={formData.field_mapping[field] || ''} onChange={e => setFormData({ ...formData, field_mapping: { ...formData.field_mapping, [field]: e.target.value } })} style={{ padding: 6, border: '1px solid #e5e7eb', borderRadius: 6, width: '100%' }}>
                                  {targetFields.map(tf => <option key={tf.value} value={tf.value}>{tf.label}</option>)}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    {activeTab === 'attributes' && (
                      feedPreview.attributes?.length ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                          {feedPreview.attributes.sort((a,b) => b.count - a.count).map(a => (
                            <div key={a.name} style={{ padding: 10, background: '#f9fafb', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                              <span>{a.name}</span><span style={{ color: '#6b7280' }}>{a.count}x</span>
                            </div>
                          ))}
                        </div>
                      ) : <p style={{ color: '#6b7280' }}>Ziadne PARAM atributy</p>
                    )}
                    {activeTab === 'categories' && (
                      feedPreview.categories?.length ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {feedPreview.categories.sort((a,b) => b.count - a.count).slice(0, 30).map(c => (
                            <div key={c.name} style={{ padding: 8, background: '#f9fafb', borderRadius: 6, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                              <span>{c.name}</span><span style={{ color: '#6b7280' }}>{c.count}</span>
                            </div>
                          ))}
                        </div>
                      ) : <p style={{ color: '#6b7280' }}>Ziadne kategorie</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: 20, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Zrusit</button>
              <button onClick={saveFeed} style={{ padding: '10px 20px', background: '#c9a87c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Ulozit</button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && importProgress && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '90%', maxWidth: 500, padding: 24 }}>
            <h2 style={{ marginTop: 0 }}>{importProgress.status === 'completed' ? 'Hotovo' : importProgress.status === 'failed' ? 'Chyba' : 'Importujem...'}</h2>
            <div style={{ height: 24, background: '#f3f4f6', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ height: '100%', background: '#c9a87c', width: `${importProgress.percent}%`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 600 }}>{importProgress.percent}%</div>
            </div>
            <p style={{ color: '#6b7280', textAlign: 'center' }}>{importProgress.message}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16 }}>
              <div style={{ textAlign: 'center', padding: 8, background: '#f9fafb', borderRadius: 8 }}><div style={{ fontSize: 20, fontWeight: 700 }}>{importProgress.total}</div><div style={{ fontSize: 11, color: '#6b7280' }}>Celkom</div></div>
              <div style={{ textAlign: 'center', padding: 8, background: '#f9fafb', borderRadius: 8 }}><div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>{importProgress.created}</div><div style={{ fontSize: 11, color: '#6b7280' }}>Nove</div></div>
              <div style={{ textAlign: 'center', padding: 8, background: '#f9fafb', borderRadius: 8 }}><div style={{ fontSize: 20, fontWeight: 700, color: '#2563eb' }}>{importProgress.updated}</div><div style={{ fontSize: 11, color: '#6b7280' }}>Update</div></div>
              <div style={{ textAlign: 'center', padding: 8, background: '#f9fafb', borderRadius: 8 }}><div style={{ fontSize: 20, fontWeight: 700 }}>{importProgress.skipped}</div><div style={{ fontSize: 11, color: '#6b7280' }}>Skip</div></div>
              <div style={{ textAlign: 'center', padding: 8, background: '#f9fafb', borderRadius: 8 }}><div style={{ fontSize: 20, fontWeight: 700, color: '#dc2626' }}>{importProgress.errors}</div><div style={{ fontSize: 11, color: '#6b7280' }}>Chyby</div></div>
            </div>
            {(importProgress.status === 'completed' || importProgress.status === 'failed') && (
              <button onClick={() => setShowImportModal(false)} style={{ width: '100%', padding: 12, background: '#c9a87c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Zavriet</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
