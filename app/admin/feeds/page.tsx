'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Feed {
  id: string
  name: string
  url: string
  type: 'xml' | 'csv' | 'json'
  vendor_id?: string
  vendor_name?: string
  schedule: string
  is_active: boolean
  last_run?: string
  last_status?: string
  product_count?: number
  created_at: string
}

interface ImportProgress {
  status: 'idle' | 'downloading' | 'parsing' | 'importing' | 'completed' | 'failed'
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

interface AttributePreview {
  name: string
  count: number
}

interface CategoryPreview {
  name: string
  count: number
}

interface FeedPreview {
  fields: string[]
  sample: any[]
  total_items?: number
  detected_type?: string
  attributes?: AttributePreview[]
  categories?: CategoryPreview[]
}

const targetFields = [
  { value: '', label: '-- Ignorovať --' },
  { value: 'title', label: 'Názov produktu' },
  { value: 'description', label: 'Popis' },
  { value: 'short_description', label: 'Krátky popis' },
  { value: 'price', label: 'Cena' },
  { value: 'ean', label: 'EAN' },
  { value: 'sku', label: 'SKU' },
  { value: 'brand', label: 'Značka' },
  { value: 'image_url', label: 'Obrázok' },
  { value: 'url', label: 'URL produktu' },
  { value: 'category', label: 'Kategória' },
  { value: 'stock_status', label: 'Stav skladu' },
  { value: 'delivery_date', label: 'Dodacia lehota' },
]

export default function FeedsPage() {
  const router = useRouter()
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedFeed, setSelectedFeed] = useState<Feed | null>(null)
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null)
  
  const [newFeed, setNewFeed] = useState({
    name: '',
    url: '',
    type: 'xml' as 'xml' | 'csv' | 'json',
    vendor_id: '',
    schedule: 'daily',
    is_active: true,
    xml_item_path: 'SHOPITEM',
    field_mapping: {} as Record<string, string>,
  })
  
  const [previewLoading, setPreviewLoading] = useState(false)
  const [feedPreview, setFeedPreview] = useState<FeedPreview | null>(null)
  const [previewError, setPreviewError] = useState('')
  const [activePreviewTab, setActivePreviewTab] = useState<'fields' | 'attributes' | 'categories'>('fields')
  
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadFeeds()
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
  }, [])

  async function loadFeeds() {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/feeds`)
      const data = await response.json()
      if (data.success) {
        setFeeds(data.data || [])
      }
    } catch (error) {
      console.error('Error loading feeds:', error)
    }
    setLoading(false)
  }

  async function previewFeed() {
    if (!newFeed.url) {
      setPreviewError('Zadajte URL feedu')
      return
    }
    
    setPreviewLoading(true)
    setPreviewError('')
    setFeedPreview(null)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/feeds/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newFeed.url,
          type: newFeed.type,
          xml_item_path: newFeed.xml_item_path,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setFeedPreview(data.data)
        if (data.data.detected_type) {
          setNewFeed(prev => ({ ...prev, type: data.data.detected_type }))
        }
      } else {
        setPreviewError(data.error || 'Nepodarilo sa načítať feed')
      }
    } catch (error) {
      setPreviewError('Chyba pri načítavaní feedu')
    }
    
    setPreviewLoading(false)
  }

  async function saveFeed() {
    if (!newFeed.name || !newFeed.url) {
      alert('Vyplňte názov a URL feedu')
      return
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/feeds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeed),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setShowAddModal(false)
        resetForm()
        loadFeeds()
      } else {
        alert(data.error || 'Chyba pri ukladaní feedu')
      }
    } catch (error) {
      alert('Chyba pri ukladaní feedu')
    }
  }

  async function deleteFeed(id: string, name: string) {
    if (!confirm(`Naozaj chcete vymazať feed "${name}"?`)) return
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/feeds/${id}`, {
        method: 'DELETE',
      })
      loadFeeds()
    } catch (error) {
      alert('Chyba pri mazaní feedu')
    }
  }

  async function startImport(feed: Feed) {
    setSelectedFeed(feed)
    setShowImportModal(true)
    setImportProgress({
      status: 'downloading',
      message: 'Sťahujem feed...',
      total: 0,
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      percent: 0,
      logs: ['Import started...'],
    })
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/feeds/${feed.id}/import`, {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (data.success) {
        pollProgress(feed.id)
      } else {
        setImportProgress(prev => prev ? {
          ...prev,
          status: 'failed',
          message: data.error || 'Import failed',
        } : null)
      }
    } catch (error) {
      setImportProgress(prev => prev ? {
        ...prev,
        status: 'failed',
        message: 'Chyba pri spustení importu',
      } : null)
    }
  }

  function pollProgress(feedId: string) {
    progressInterval.current = setInterval(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/feeds/${feedId}/progress`)
        const data = await response.json()
        
        if (data.success && data.data) {
          setImportProgress(data.data)
          
          if (data.data.status === 'completed' || data.data.status === 'failed') {
            if (progressInterval.current) {
              clearInterval(progressInterval.current)
            }
            loadFeeds()
          }
        }
      } catch (error) {
        console.error('Error polling progress:', error)
      }
    }, 1000)
  }

  function resetForm() {
    setNewFeed({
      name: '',
      url: '',
      type: 'xml',
      vendor_id: '',
      schedule: 'daily',
      is_active: true,
      xml_item_path: 'SHOPITEM',
      field_mapping: {},
    })
    setFeedPreview(null)
    setPreviewError('')
    setActivePreviewTab('fields')
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('sk-SK')
  }

  return (
    <>
      <style jsx global>{`
        .feeds-page { padding: 24px; max-width: 1400px; margin: 0 auto; }
        .feeds-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .feeds-title { font-size: 24px; font-weight: 700; color: #1f2937; }
        
        .admin-btn { padding: 12px 24px; background: linear-gradient(135deg, #c9a87c, #b8956e); color: #fff; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .admin-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(201,168,124,0.3); }
        .admin-btn-outline { background: #fff; color: #374151; border: 1px solid #e5e7eb; }
        .admin-btn-outline:hover { border-color: #c9a87c; color: #c9a87c; transform: none; box-shadow: none; }
        .admin-btn-sm { padding: 8px 16px; font-size: 13px; }
        .admin-btn-danger { background: #fee2e2; color: #dc2626; }
        .admin-btn-danger:hover { background: #dc2626; color: #fff; }
        
        .feeds-grid { display: grid; gap: 16px; }
        .feed-card { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); display: flex; justify-content: space-between; align-items: center; }
        .feed-info h3 { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 4px; }
        .feed-meta { display: flex; gap: 16px; font-size: 13px; color: #6b7280; }
        .feed-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .feed-badge.active { background: #dcfce7; color: #166534; }
        .feed-badge.inactive { background: #f3f4f6; color: #6b7280; }
        .feed-badge.running { background: #dbeafe; color: #1d4ed8; }
        .feed-badge.failed { background: #fee2e2; color: #dc2626; }
        .feed-actions { display: flex; gap: 8px; }
        
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: #fff; border-radius: 20px; max-width: 900px; width: 90%; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; }
        .modal-header { padding: 20px 24px; border-bottom: 1px solid #e5e7eb; }
        .modal-title { font-size: 20px; font-weight: 700; color: #1f2937; }
        .modal-body { padding: 24px; overflow-y: auto; flex: 1; }
        .modal-footer { padding: 16px 24px; border-top: 1px solid #e5e7eb; display: flex; justify-content: flex-end; gap: 12px; }
        
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .form-input { width: 100%; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; }
        .form-input:focus { outline: none; border-color: #c9a87c; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        
        .preview-section { margin-top: 20px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
        .preview-tabs { display: flex; background: #f9fafb; border-bottom: 1px solid #e5e7eb; }
        .preview-tab { padding: 12px 20px; font-size: 14px; font-weight: 500; color: #6b7280; cursor: pointer; border: none; background: none; transition: all 0.2s; }
        .preview-tab:hover { color: #374151; }
        .preview-tab.active { color: #c9a87c; background: #fff; border-bottom: 2px solid #c9a87c; }
        .preview-content { padding: 16px; max-height: 400px; overflow-y: auto; }
        
        .mapping-table { width: 100%; border-collapse: collapse; }
        .mapping-table th { text-align: left; padding: 10px; background: #f9fafb; font-size: 12px; font-weight: 600; color: #6b7280; }
        .mapping-table td { padding: 10px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
        .sample-value { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #6b7280; }
        
        .attr-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
        .attr-item { display: flex; justify-content: space-between; padding: 10px 14px; background: #f9fafb; border-radius: 8px; }
        .attr-name { font-weight: 500; color: #374151; }
        .attr-count { color: #6b7280; font-size: 13px; }
        
        .cat-list { display: flex; flex-direction: column; gap: 6px; }
        .cat-item { display: flex; justify-content: space-between; padding: 8px 12px; background: #f9fafb; border-radius: 6px; font-size: 13px; }
        
        .progress-bar-container { height: 24px; background: #f3f4f6; border-radius: 12px; overflow: hidden; margin-bottom: 16px; }
        .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #c9a87c, #b8956e); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 600; transition: width 0.3s; }
        .progress-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 20px; }
        .progress-stat { text-align: center; padding: 12px; background: #f9fafb; border-radius: 10px; }
        .progress-stat-value { font-size: 24px; font-weight: 700; color: #1f2937; }
        .progress-stat-value.created { color: #16a34a; }
        .progress-stat-value.updated { color: #2563eb; }
        .progress-stat-value.errors { color: #dc2626; }
        .progress-stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
        .progress-logs { max-height: 200px; overflow-y: auto; background: #1f2937; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 12px; }
        .log-line { color: #9ca3af; padding: 2px 0; }
        .log-line.success { color: #4ade80; }
        .log-line.error { color: #f87171; }
        
        .empty-state { text-align: center; padding: 60px 20px; color: #6b7280; }
        .empty-icon { font-size: 48px; margin-bottom: 16px; }
      `}</style>

      <div className="feeds-page">
        <div className="feeds-header">
          <h1 className="feeds-title">📡 XML Feedy</h1>
          <button className="admin-btn" onClick={() => setShowAddModal(true)}>
            + Pridať feed
          </button>
        </div>

        {loading ? (
          <div className="empty-state">Načítavam...</div>
        ) : feeds.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📡</div>
            <p>Zatiaľ žiadne feedy</p>
            <button className="admin-btn" style={{ marginTop: 16 }} onClick={() => setShowAddModal(true)}>
              Pridať prvý feed
            </button>
          </div>
        ) : (
          <div className="feeds-grid">
            {feeds.map(feed => (
              <div key={feed.id} className="feed-card">
                <div className="feed-info">
                  <h3>{feed.name}</h3>
                  <div className="feed-meta">
                    <span>{feed.type.toUpperCase()}</span>
                    <span>{feed.product_count || 0} produktov</span>
                    {feed.last_run && <span>Posledný: {formatDate(feed.last_run)}</span>}
                    <span className={`feed-badge ${feed.is_active ? 'active' : 'inactive'}`}>
                      {feed.is_active ? 'Aktívny' : 'Neaktívny'}
                    </span>
                    {feed.last_status && feed.last_status !== 'idle' && (
                      <span className={`feed-badge ${feed.last_status}`}>{feed.last_status}</span>
                    )}
                  </div>
                </div>
                <div className="feed-actions">
                  <button className="admin-btn admin-btn-sm" onClick={() => startImport(feed)}>
                    ▶️ Importovať
                  </button>
                  <button 
                    className="admin-btn admin-btn-sm admin-btn-danger"
                    onClick={() => deleteFeed(feed.id, feed.name)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Feed Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => { setShowAddModal(false); resetForm(); }}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">➕ Nový feed</h2>
              </div>
              
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Názov feedu *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newFeed.name}
                      onChange={e => setNewFeed(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Heureka feed"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Typ feedu</label>
                    <select
                      className="form-input"
                      value={newFeed.type}
                      onChange={e => setNewFeed(prev => ({ ...prev, type: e.target.value as any }))}
                    >
                      <option value="xml">XML (Heureka)</option>
                      <option value="csv">CSV</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">URL feedu *</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="url"
                      className="form-input"
                      value={newFeed.url}
                      onChange={e => setNewFeed(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://www.example.sk/xml/heureka"
                    />
                    <button 
                      className="admin-btn admin-btn-outline"
                      onClick={previewFeed}
                      disabled={previewLoading}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {previewLoading ? '⏳ Načítavam...' : '🔍 Náhľad'}
                    </button>
                  </div>
                </div>
                
                {newFeed.type === 'xml' && (
                  <div className="form-group">
                    <label className="form-label">XML Item Path</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newFeed.xml_item_path}
                      onChange={e => setNewFeed(prev => ({ ...prev, xml_item_path: e.target.value }))}
                      placeholder="SHOPITEM"
                    />
                    <small style={{ color: '#6b7280', fontSize: 12 }}>
                      Pre Heureka feedy použite SHOPITEM
                    </small>
                  </div>
                )}
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Plán importu</label>
                    <select
                      className="form-input"
                      value={newFeed.schedule}
                      onChange={e => setNewFeed(prev => ({ ...prev, schedule: e.target.value }))}
                    >
                      <option value="manual">Manuálne</option>
                      <option value="hourly">Každú hodinu</option>
                      <option value="twice_daily">2x denne</option>
                      <option value="daily">Denne</option>
                      <option value="weekly">Týždenne</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">&nbsp;</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '10px 0' }}>
                      <input
                        type="checkbox"
                        checked={newFeed.is_active}
                        onChange={e => setNewFeed(prev => ({ ...prev, is_active: e.target.checked }))}
                        style={{ width: 18, height: 18 }}
                      />
                      Aktívny feed
                    </label>
                  </div>
                </div>
                
                {previewError && (
                  <div style={{ background: '#fee2e2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                    {previewError}
                  </div>
                )}
                
                {feedPreview && (
                  <div className="preview-section">
                    <div className="preview-tabs">
                      <button 
                        className={`preview-tab ${activePreviewTab === 'fields' ? 'active' : ''}`}
                        onClick={() => setActivePreviewTab('fields')}
                      >
                        📋 Polia ({feedPreview.fields.length})
                      </button>
                      <button 
                        className={`preview-tab ${activePreviewTab === 'attributes' ? 'active' : ''}`}
                        onClick={() => setActivePreviewTab('attributes')}
                      >
                        🏷️ Atribúty ({feedPreview.attributes?.length || 0})
                      </button>
                      <button 
                        className={`preview-tab ${activePreviewTab === 'categories' ? 'active' : ''}`}
                        onClick={() => setActivePreviewTab('categories')}
                      >
                        📁 Kategórie ({feedPreview.categories?.length || 0})
                      </button>
                      <span style={{ marginLeft: 'auto', padding: '12px 20px', fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
                        ✅ {feedPreview.total_items || feedPreview.sample.length} položiek
                      </span>
                    </div>
                    
                    <div className="preview-content">
                      {activePreviewTab === 'fields' && (
                        <table className="mapping-table">
                          <thead>
                            <tr>
                              <th>Pole z feedu</th>
                              <th>Ukážka hodnoty</th>
                              <th>Mapovať na</th>
                            </tr>
                          </thead>
                          <tbody>
                            {feedPreview.fields.filter(f => !f.startsWith('_')).map(field => (
                              <tr key={field}>
                                <td><strong>{field}</strong></td>
                                <td className="sample-value">
                                  {String(feedPreview.sample[0]?.[field] || '-').substring(0, 100)}
                                </td>
                                <td>
                                  <select
                                    className="form-input"
                                    style={{ padding: '6px 10px' }}
                                    value={newFeed.field_mapping[field] || ''}
                                    onChange={e => setNewFeed(prev => ({
                                      ...prev,
                                      field_mapping: { ...prev.field_mapping, [field]: e.target.value }
                                    }))}
                                  >
                                    {targetFields.map(tf => (
                                      <option key={tf.value} value={tf.value}>{tf.label}</option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      
                      {activePreviewTab === 'attributes' && (
                        <>
                          {feedPreview.attributes && feedPreview.attributes.length > 0 ? (
                            <>
                              <p style={{ marginBottom: 12, color: '#6b7280', fontSize: 13 }}>
                                Tieto PARAM atribúty boli nájdené vo feede a budú automaticky importované:
                              </p>
                              <div className="attr-list">
                                {feedPreview.attributes
                                  .sort((a, b) => b.count - a.count)
                                  .map(attr => (
                                    <div key={attr.name} className="attr-item">
                                      <span className="attr-name">{attr.name}</span>
                                      <span className="attr-count">{attr.count}x</span>
                                    </div>
                                  ))}
                              </div>
                            </>
                          ) : (
                            <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                              Žiadne PARAM atribúty neboli nájdené vo feede
                            </div>
                          )}
                        </>
                      )}
                      
                      {activePreviewTab === 'categories' && (
                        <>
                          {feedPreview.categories && feedPreview.categories.length > 0 ? (
                            <div className="cat-list">
                              {feedPreview.categories
                                .sort((a, b) => b.count - a.count)
                                .slice(0, 50)
                                .map(cat => (
                                  <div key={cat.name} className="cat-item">
                                    <span>{cat.name}</span>
                                    <span style={{ color: '#6b7280' }}>{cat.count} produktov</span>
                                  </div>
                                ))}
                              {feedPreview.categories.length > 50 && (
                                <div style={{ textAlign: 'center', padding: 12, color: '#6b7280' }}>
                                  ... a ďalších {feedPreview.categories.length - 50} kategórií
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
                              Žiadne kategórie neboli nájdené
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button className="admin-btn admin-btn-outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
                  Zrušiť
                </button>
                <button className="admin-btn" onClick={saveFeed}>
                  💾 Uložiť feed
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Progress Modal */}
        {showImportModal && importProgress && (
          <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: 600 }}>
              <div className="modal-header">
                <h2 className="modal-title">
                  {importProgress.status === 'completed' ? '✅ Import dokončený' :
                   importProgress.status === 'failed' ? '❌ Import zlyhal' :
                   '📥 Import prebieha...'}
                </h2>
              </div>
              
              <div className="modal-body">
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${importProgress.percent}%` }}>
                    {importProgress.percent}%
                  </div>
                </div>
                
                <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 20 }}>
                  {importProgress.message}
                </p>
                
                <div className="progress-stats">
                  <div className="progress-stat">
                    <div className="progress-stat-value">{importProgress.total}</div>
                    <div className="progress-stat-label">Celkom</div>
                  </div>
                  <div className="progress-stat">
                    <div className="progress-stat-value created">{importProgress.created}</div>
                    <div className="progress-stat-label">Vytvorené</div>
                  </div>
                  <div className="progress-stat">
                    <div className="progress-stat-value updated">{importProgress.updated}</div>
                    <div className="progress-stat-label">Aktualizované</div>
                  </div>
                  <div className="progress-stat">
                    <div className="progress-stat-value">{importProgress.skipped}</div>
                    <div className="progress-stat-label">Preskočené</div>
                  </div>
                  <div className="progress-stat">
                    <div className="progress-stat-value errors">{importProgress.errors}</div>
                    <div className="progress-stat-label">Chyby</div>
                  </div>
                </div>
                
                <div className="progress-logs">
                  {importProgress.logs.slice(-20).map((log, i) => (
                    <div key={i} className={`log-line ${log.includes('error') || log.includes('Error') ? 'error' : log.includes('created') || log.includes('Created') ? 'success' : ''}`}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="modal-footer">
                {(importProgress.status === 'completed' || importProgress.status === 'failed') && (
                  <button className="admin-btn" onClick={() => setShowImportModal(false)}>
                    Zavrieť
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
