'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

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

interface FeedPreview {
  fields: string[]
  sample: any[]
  total_items?: number
  detected_type?: string
}

export default function FeedsPage() {
  const router = useRouter()
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedFeed, setSelectedFeed] = useState<Feed | null>(null)
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null)
  
  // New feed form
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/feeds`)
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/feeds/preview`, {
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
        // Auto-detect type
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/feeds`, {
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/feeds/${id}`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/feeds/${feed.id}/import`, {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Start polling for progress
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/feeds/${feedId}/progress`)
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
  }

  const targetFields = [
    { value: '', label: '-- Ignorovať --' },
    { value: 'title', label: 'Názov produktu' },
    { value: 'description', label: 'Popis' },
    { value: 'short_description', label: 'Krátky popis' },
    { value: 'price', label: 'Cena' },
    { value: 'ean', label: 'EAN' },
    { value: 'sku', label: 'SKU' },
    { value: 'mpn', label: 'MPN' },
    { value: 'brand', label: 'Značka' },
    { value: 'category', label: 'Kategória' },
    { value: 'image_url', label: 'Obrázok (hlavný)' },
    { value: 'gallery_images', label: 'Galéria obrázkov' },
    { value: 'affiliate_url', label: 'Affiliate URL' },
    { value: 'stock_quantity', label: 'Počet kusov' },
    { value: 'stock_status', label: 'Stav skladu' },
    { value: 'weight', label: 'Váha' },
    { value: 'attributes', label: 'Atribúty/Parametre' },
  ]

  return (
    <div>
      <style jsx>{`
        .feeds-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .feeds-title {
          font-size: 24px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .feeds-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
        }
        
        .feed-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          overflow: hidden;
          transition: all 0.2s;
        }
        .feed-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .feed-card.inactive {
          opacity: 0.7;
        }
        .feed-card-header {
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .feed-name {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 4px;
        }
        .feed-url {
          font-size: 12px;
          color: #6b7280;
          word-break: break-all;
        }
        .feed-badge {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .feed-badge.xml { background: #dbeafe; color: #1e40af; }
        .feed-badge.csv { background: #dcfce7; color: #166534; }
        .feed-badge.json { background: #fef3c7; color: #92400e; }
        
        .feed-card-body {
          padding: 16px 20px;
        }
        .feed-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }
        .feed-stat {
          text-align: center;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
        }
        .feed-stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
        }
        .feed-stat-label {
          font-size: 11px;
          color: #6b7280;
          margin-top: 2px;
        }
        
        .feed-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          margin-bottom: 12px;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .status-dot.idle { background: #9ca3af; }
        .status-dot.running { background: #22c55e; animation: pulse 1s infinite; }
        .status-dot.completed { background: #22c55e; }
        .status-dot.failed { background: #ef4444; }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .feed-card-actions {
          display: flex;
          gap: 8px;
          padding: 16px 20px;
          background: #f9fafb;
          border-top: 1px solid #f3f4f6;
        }
        .feed-action-btn {
          flex: 1;
          padding: 10px;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s;
        }
        .feed-action-btn:hover {
          background: #f3f4f6;
        }
        .feed-action-btn.primary {
          background: #ff6b35;
          border-color: #ff6b35;
          color: white;
        }
        .feed-action-btn.primary:hover {
          background: #e55a2b;
        }
        .feed-action-btn.danger:hover {
          background: #fee2e2;
          border-color: #fecaca;
          color: #dc2626;
        }
        
        .empty-state {
          text-align: center;
          padding: 60px;
          background: white;
          border-radius: 12px;
          border: 2px dashed #e5e7eb;
        }
        .empty-state-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }
        
        /* Modal styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal {
          background: white;
          border-radius: 16px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-title {
          font-size: 20px;
          font-weight: 700;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
        }
        .modal-body {
          padding: 24px;
        }
        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        .form-label {
          display: block;
          font-weight: 500;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .form-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
        }
        .form-input:focus {
          outline: none;
          border-color: #ff6b35;
          box-shadow: 0 0 0 3px rgba(255,107,53,0.1);
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .preview-section {
          background: #f9fafb;
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
        }
        .preview-title {
          font-weight: 600;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mapping-table {
          width: 100%;
          border-collapse: collapse;
        }
        .mapping-table th, .mapping-table td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        .mapping-table th {
          background: #f3f4f6;
          font-size: 12px;
          font-weight: 600;
        }
        .sample-value {
          font-size: 12px;
          color: #6b7280;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        /* Progress Modal */
        .progress-bar-container {
          height: 24px;
          background: #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff6b35, #ff8c5a);
          border-radius: 12px;
          transition: width 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: 600;
        }
        .progress-stats {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .progress-stat {
          text-align: center;
          padding: 12px;
          background: #f3f4f6;
          border-radius: 8px;
        }
        .progress-stat-value {
          font-size: 24px;
          font-weight: 700;
        }
        .progress-stat-value.created { color: #22c55e; }
        .progress-stat-value.updated { color: #3b82f6; }
        .progress-stat-value.errors { color: #ef4444; }
        .progress-stat-label {
          font-size: 11px;
          color: #6b7280;
        }
        .progress-logs {
          background: #111827;
          border-radius: 8px;
          padding: 16px;
          max-height: 200px;
          overflow-y: auto;
          font-family: monospace;
          font-size: 12px;
          color: #9ca3af;
        }
        .progress-logs .log-line {
          margin-bottom: 4px;
        }
        .progress-logs .log-line.error { color: #ef4444; }
        .progress-logs .log-line.success { color: #22c55e; }
      `}</style>

      {/* Header */}
      <div className="feeds-header">
        <h1 className="feeds-title">
          📡 Importy Feedov
          <span style={{ 
            background: '#e5e7eb', 
            padding: '4px 12px', 
            borderRadius: 20, 
            fontSize: 14 
          }}>
            {feeds.length}
          </span>
        </h1>
        <button className="admin-btn" onClick={() => setShowAddModal(true)}>
          + Nový feed
        </button>
      </div>

      {/* Feeds Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner"></div>
        </div>
      ) : feeds.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📡</div>
          <h3>Žiadne feedy</h3>
          <p style={{ color: '#6b7280', marginBottom: 20 }}>
            Pridajte prvý feed pre automatické importovanie produktov
          </p>
          <button className="admin-btn" onClick={() => setShowAddModal(true)}>
            + Pridať feed
          </button>
        </div>
      ) : (
        <div className="feeds-grid">
          {feeds.map(feed => (
            <div key={feed.id} className={`feed-card ${!feed.is_active ? 'inactive' : ''}`}>
              <div className="feed-card-header">
                <div>
                  <div className="feed-name">{feed.name}</div>
                  <div className="feed-url">{feed.url}</div>
                </div>
                <span className={`feed-badge ${feed.type}`}>
                  {feed.type.toUpperCase()}
                </span>
              </div>
              
              <div className="feed-card-body">
                <div className="feed-stats">
                  <div className="feed-stat">
                    <div className="feed-stat-value">{feed.product_count || 0}</div>
                    <div className="feed-stat-label">Produktov</div>
                  </div>
                  <div className="feed-stat">
                    <div className="feed-stat-value">{feed.schedule}</div>
                    <div className="feed-stat-label">Plán</div>
                  </div>
                  <div className="feed-stat">
                    <div className="feed-stat-value">
                      {feed.last_run 
                        ? new Date(feed.last_run).toLocaleDateString('sk-SK')
                        : '-'
                      }
                    </div>
                    <div className="feed-stat-label">Posledný import</div>
                  </div>
                </div>
                
                <div className="feed-status">
                  <span className={`status-dot ${feed.last_status || 'idle'}`}></span>
                  <span>
                    {feed.last_status === 'running' && 'Beží...'}
                    {feed.last_status === 'completed' && 'Dokončený'}
                    {feed.last_status === 'failed' && 'Zlyhal'}
                    {(!feed.last_status || feed.last_status === 'idle') && 'Nečinný'}
                  </span>
                </div>
              </div>
              
              <div className="feed-card-actions">
                <button 
                  className="feed-action-btn primary"
                  onClick={() => startImport(feed)}
                  disabled={feed.last_status === 'running'}
                >
                  ▶ Importovať
                </button>
                <button className="feed-action-btn">
                  ✏️ Upraviť
                </button>
                <button 
                  className="feed-action-btn danger"
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
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nový Feed</h2>
              <button className="modal-close" onClick={() => { setShowAddModal(false); resetForm(); }}>
                ×
              </button>
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
                    placeholder="napr. Heureka Feed"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Typ feedu</label>
                  <select
                    className="form-input"
                    value={newFeed.type}
                    onChange={e => setNewFeed(prev => ({ ...prev, type: e.target.value as any }))}
                  >
                    <option value="xml">XML</option>
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
                    placeholder="https://example.com/feed.xml"
                  />
                  <button 
                    className="admin-btn admin-btn-outline"
                    onClick={previewFeed}
                    disabled={previewLoading}
                  >
                    {previewLoading ? '...' : '🔍 Náhľad'}
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
                    Názov elementu pre jednotlivé produkty (napr. SHOPITEM, product, item)
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
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
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
                <div style={{ 
                  background: '#fee2e2', 
                  color: '#dc2626', 
                  padding: 12, 
                  borderRadius: 8,
                  marginBottom: 16
                }}>
                  {previewError}
                </div>
              )}
              
              {feedPreview && (
                <div className="preview-section">
                  <div className="preview-title">
                    📋 Mapovanie polí
                    <span style={{ 
                      background: '#dcfce7', 
                      color: '#166534', 
                      padding: '2px 8px', 
                      borderRadius: 10, 
                      fontSize: 11 
                    }}>
                      {feedPreview.total_items || feedPreview.sample.length} položiek
                    </span>
                  </div>
                  
                  <table className="mapping-table">
                    <thead>
                      <tr>
                        <th>Pole z feedu</th>
                        <th>Ukážka hodnoty</th>
                        <th>Mapovať na</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedPreview.fields.map(field => (
                        <tr key={field}>
                          <td><strong>{field}</strong></td>
                          <td className="sample-value">
                            {feedPreview.sample[0]?.[field] || '-'}
                          </td>
                          <td>
                            <select
                              className="form-input"
                              style={{ padding: '6px 10px' }}
                              value={newFeed.field_mapping[field] || ''}
                              onChange={e => setNewFeed(prev => ({
                                ...prev,
                                field_mapping: {
                                  ...prev.field_mapping,
                                  [field]: e.target.value
                                }
                              }))}
                            >
                              {targetFields.map(tf => (
                                <option key={tf.value} value={tf.value}>
                                  {tf.label}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="admin-btn admin-btn-outline"
                onClick={() => { setShowAddModal(false); resetForm(); }}
              >
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
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${importProgress.percent}%` }}
                >
                  {importProgress.percent}%
                </div>
              </div>
              
              <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: 20 }}>
                {importProgress.message}
              </p>
              
              <div className="progress-stats">
                <div className="progress-stat">
                  <div className="progress-stat-value">{importProgress.processed}</div>
                  <div className="progress-stat-label">Spracované</div>
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
                {importProgress.logs.map((log, i) => (
                  <div 
                    key={i} 
                    className={`log-line ${log.includes('error') ? 'error' : log.includes('created') ? 'success' : ''}`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-footer">
              {(importProgress.status === 'completed' || importProgress.status === 'failed') && (
                <button 
                  className="admin-btn"
                  onClick={() => setShowImportModal(false)}
                >
                  Zavrieť
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
