'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface ProductImage {
  id: string
  url: string
  alt?: string
  position?: number
  is_main: boolean
}

interface ProductAttribute {
  id?: string
  name: string
  value: string
  position?: number
}

interface CategoryOption {
  id: string
  name: string
  depth: number
  path: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'attributes' | 'seo'>('basic')
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [images, setImages] = useState<ProductImage[]>([])
  const [attributes, setAttributes] = useState<ProductAttribute[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    ean: '',
    sku: '',
    mpn: '',
    brand_name: '',
    category_id: '',
    price_min: 0,
    price_max: 0,
    stock_status: 'instock' as 'instock' | 'outofstock' | 'onbackorder',
    stock_quantity: 0,
    is_active: true,
    is_featured: false,
    seo_title: '',
    seo_description: '',
  })

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    const cats = await api.getCategoriesFlat()
    if (cats) {
      setCategories(cats)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  // ========== IMAGE HANDLING ==========
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    setUploading(true)
    try {
      const newImages: ProductImage[] = []
      
      for (let i = 0; i < files.length; i++) {
        const result = await api.uploadImage(files[i])
        if (result && result.url) {
          newImages.push({
            id: result.filename || `new-${Date.now()}-${i}`,
            url: result.url,
            alt: '',
            position: images.length + i,
            is_main: images.length === 0 && i === 0
          })
        }
      }
      
      setImages(prev => {
        const updated = [...prev, ...newImages]
        if (!updated.some(img => img.is_main) && updated.length > 0) {
          updated[0].is_main = true
        }
        return updated
      })
    } catch (error) {
      console.error('Upload error:', error)
      alert('Chyba pri nahrávaní obrázkov')
    }
    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dropZoneRef.current?.classList.remove('drag-over')
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dropZoneRef.current?.classList.add('drag-over')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dropZoneRef.current?.classList.remove('drag-over')
  }

  const removeImage = (imageId: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== imageId)
      if (filtered.length > 0 && !filtered.some(img => img.is_main)) {
        filtered[0].is_main = true
      }
      return filtered
    })
  }

  const setMainImage = (imageId: string) => {
    setImages(prev => prev.map(img => ({
      ...img,
      is_main: img.id === imageId
    })))
  }

  const moveImage = (imageId: string, direction: 'up' | 'down') => {
    setImages(prev => {
      const index = prev.findIndex(img => img.id === imageId)
      if (index === -1) return prev
      
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= prev.length) return prev
      
      const newImages = [...prev]
      ;[newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]]
      return newImages.map((img, i) => ({ ...img, position: i }))
    })
  }

  // ========== ATTRIBUTES HANDLING ==========
  const addAttribute = () => {
    setAttributes(prev => [...prev, { 
      id: `new-${Date.now()}`,
      name: '', 
      value: '',
      position: prev.length
    }])
  }

  const updateAttribute = (index: number, field: 'name' | 'value', value: string) => {
    setAttributes(prev => prev.map((attr, i) => 
      i === index ? { ...attr, [field]: value } : attr
    ))
  }

  const removeAttribute = (index: number) => {
    setAttributes(prev => prev.filter((_, i) => i !== index))
  }

  // ========== SUBMIT ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.title.trim()) {
      alert('Zadajte názov produktu')
      return
    }
    
    setLoading(true)
    
    try {
      const productData = {
        ...form,
        slug: form.slug || generateSlug(form.title),
        image_url: images.find(img => img.is_main)?.url || images[0]?.url || '',
        images: images.map((img, index) => ({
          url: img.url,
          alt: img.alt || '',
          position: index,
          is_main: img.is_main
        })),
        attributes: attributes
          .filter(a => a.name && a.value)
          .map((a, index) => ({
            name: a.name,
            value: a.value,
            position: index
          })),
      }
      
      const result = await api.createProduct(productData)
      if (result?.id) {
        router.push('/admin/products')
      } else {
        alert('Chyba pri vytváraní produktu')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Chyba pri vytváraní produktu')
    }
    
    setLoading(false)
  }

  return (
    <div>
      <style jsx>{`
        .image-dropzone {
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          background: #f9fafb;
          transition: all 0.2s;
          cursor: pointer;
        }
        .image-dropzone:hover, .image-dropzone.drag-over {
          border-color: #ff6b35;
          background: #fff5f0;
        }
        .image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }
        .image-item {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          background: #f3f4f6;
          aspect-ratio: 1;
          border: 2px solid transparent;
        }
        .image-item.is-main {
          border-color: #ff6b35;
        }
        .image-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .image-item-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.6);
          opacity: 0;
          transition: opacity 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
        }
        .image-item:hover .image-item-overlay {
          opacity: 1;
        }
        .image-item-btn {
          background: white;
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.15s;
        }
        .image-item-btn:hover {
          background: #f3f4f6;
        }
        .image-item-btn.main {
          background: #ff6b35;
          color: white;
        }
        .image-item-btn.main:hover {
          background: #e55a2b;
        }
        .image-item-btn.delete {
          background: #fee2e2;
          color: #dc2626;
        }
        .image-item-btn.delete:hover {
          background: #fecaca;
        }
        .image-main-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #ff6b35;
          color: white;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }
        .attribute-row {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 12px;
          margin-bottom: 12px;
          align-items: start;
        }
        .attribute-remove {
          background: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 6px;
          width: 36px;
          height: 36px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 2px;
        }
        .attribute-remove:hover {
          background: #fecaca;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f4f6;
          border-top-color: #ff6b35;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .upload-progress {
          background: #fff5f0;
          border: 1px solid #ff6b35;
          border-radius: 8px;
          padding: 16px;
          margin-top: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
      `}</style>

      <div className="admin-header">
        <div>
          <h1 className="admin-title">Nový produkt</h1>
          <p style={{color: '#6b7280', fontSize: 14, marginTop: 4}}>
            Pridajte nový produkt do katalógu
          </p>
        </div>
        <div style={{display:'flex',gap:12}}>
          <button type="button" onClick={() => router.back()} className="admin-btn admin-btn-outline">
            ← Späť
          </button>
          <button type="submit" form="product-form" className="admin-btn" disabled={loading}>
            {loading ? 'Ukladám...' : '💾 Vytvoriť produkt'}
          </button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit}>
        <div className="admin-card">
          <div className="admin-tabs">
            {[
              { id: 'basic', label: '📝 Základné info', count: null },
              { id: 'media', label: '🖼️ Obrázky', count: images.length },
              { id: 'attributes', label: '📊 Atribúty', count: attributes.filter(a => a.name && a.value).length },
              { id: 'seo', label: '🔍 SEO', count: null },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span style={{
                    marginLeft: 6,
                    background: activeTab === tab.id ? '#ff6b35' : '#e5e7eb',
                    color: activeTab === tab.id ? 'white' : '#6b7280',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontSize: 11
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="admin-card-body">
            {/* ========== BASIC INFO TAB ========== */}
            {activeTab === 'basic' && (
              <div className="admin-grid admin-grid-2">
                <div>
                  <div className="admin-form-group">
                    <label className="admin-label">Názov produktu *</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.title}
                      onChange={e => {
                        const title = e.target.value
                        setForm(f => ({ 
                          ...f, 
                          title,
                          slug: generateSlug(title)
                        }))
                      }}
                      placeholder="iPhone 15 Pro Max 256GB"
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
                      placeholder="iphone-15-pro-max-256gb"
                    />
                    <small style={{color: '#9ca3af'}}>megabuy.sk/produkt/{form.slug || 'url-produktu'}</small>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Kategória</label>
                    <select 
                      className="admin-select"
                      value={form.category_id}
                      onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                    >
                      <option value="">-- Vyberte kategóriu --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {'  '.repeat(cat.depth)}{cat.depth > 0 ? '└ ' : ''}{cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Značka</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.brand_name}
                      onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))}
                      placeholder="Apple"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Krátky popis</label>
                    <textarea
                      className="admin-textarea"
                      value={form.short_description}
                      onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))}
                      rows={3}
                      placeholder="Stručný popis produktu pre náhľad..."
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Detailný popis</label>
                    <textarea
                      className="admin-textarea"
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      rows={8}
                      placeholder="Kompletný popis produktu s technickými parametrami..."
                    />
                  </div>
                </div>

                <div>
                  <div className="admin-grid admin-grid-3" style={{marginBottom: 16}}>
                    <div className="admin-form-group">
                      <label className="admin-label">EAN</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={form.ean}
                        onChange={e => setForm(f => ({ ...f, ean: e.target.value }))}
                        placeholder="8596311123456"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">SKU</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={form.sku}
                        onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                        placeholder="APPL-IPH15-256"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">MPN</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={form.mpn}
                        onChange={e => setForm(f => ({ ...f, mpn: e.target.value }))}
                        placeholder="MU793"
                      />
                    </div>
                  </div>

                  <div className="admin-grid admin-grid-2" style={{marginBottom: 16}}>
                    <div className="admin-form-group">
                      <label className="admin-label">Cena od (€) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="admin-input"
                        value={form.price_min || ''}
                        onChange={e => setForm(f => ({ ...f, price_min: parseFloat(e.target.value) || 0 }))}
                        placeholder="999.00"
                        required
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Cena do (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="admin-input"
                        value={form.price_max || ''}
                        onChange={e => setForm(f => ({ ...f, price_max: parseFloat(e.target.value) || 0 }))}
                        placeholder="1299.00"
                      />
                    </div>
                  </div>

                  <div className="admin-grid admin-grid-2" style={{marginBottom: 16}}>
                    <div className="admin-form-group">
                      <label className="admin-label">Stav skladu</label>
                      <select 
                        className="admin-select" 
                        value={form.stock_status} 
                        onChange={e => setForm(f => ({ ...f, stock_status: e.target.value as any }))}
                      >
                        <option value="instock">✅ Skladom</option>
                        <option value="outofstock">❌ Nedostupné</option>
                        <option value="onbackorder">📦 Na objednávku</option>
                      </select>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Počet kusov</label>
                      <input
                        type="number"
                        min="0"
                        className="admin-input"
                        value={form.stock_quantity}
                        onChange={e => setForm(f => ({ ...f, stock_quantity: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div style={{
                    background: '#f9fafb',
                    borderRadius: 8,
                    padding: 16,
                    marginTop: 20
                  }}>
                    <div className="admin-form-group" style={{marginBottom: 12}}>
                      <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
                        <input
                          type="checkbox"
                          checked={form.is_active}
                          onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                          style={{width:20,height:20,accentColor:'#22c55e'}}
                        />
                        <span style={{fontWeight:500}}>✅ Aktívny produkt</span>
                      </label>
                      <small style={{color: '#6b7280', marginLeft: 30}}>
                        Produkt bude viditeľný na webe
                      </small>
                    </div>

                    <div className="admin-form-group" style={{margin:0}}>
                      <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}>
                        <input
                          type="checkbox"
                          checked={form.is_featured}
                          onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                          style={{width:20,height:20,accentColor:'#ff6b35'}}
                        />
                        <span style={{fontWeight:500}}>⭐ Odporúčaný produkt</span>
                      </label>
                      <small style={{color: '#6b7280', marginLeft: 30}}>
                        Zobrazí sa na homepage medzi odporúčanými
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========== MEDIA TAB ========== */}
            {activeTab === 'media' && (
              <div>
                <div 
                  ref={dropZoneRef}
                  className="image-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <div style={{fontSize: 48, marginBottom: 12}}>📷</div>
                  <p style={{color: '#374151', fontWeight: 500, marginBottom: 8}}>
                    Pretiahnite obrázky sem alebo kliknite pre nahratie
                  </p>
                  <p style={{color: '#9ca3af', fontSize: 13}}>
                    Podporované formáty: JPG, PNG, WebP, GIF (max 10MB)
                  </p>
                </div>
                
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  multiple 
                  style={{display: 'none'}}
                  onChange={(e) => handleFileSelect(e.target.files)}
                />

                {uploading && (
                  <div className="upload-progress">
                    <div className="spinner" style={{width: 24, height: 24}}></div>
                    <span>Nahrávam obrázky...</span>
                  </div>
                )}

                {images.length > 0 && (
                  <>
                    <div style={{
                      marginTop: 20,
                      padding: '12px 16px',
                      background: '#f0f9ff',
                      borderRadius: 8,
                      color: '#0369a1',
                      fontSize: 14
                    }}>
                      💡 Tip: Prvý obrázok (alebo označený ako hlavný) sa zobrazí v katalógu produktov
                    </div>
                    
                    <div className="image-grid">
                      {images.map((image, index) => (
                        <div key={image.id} className={`image-item ${image.is_main ? 'is-main' : ''}`}>
                          <img src={image.url} alt={image.alt || ''} />
                          {image.is_main && (
                            <span className="image-main-badge">⭐ Hlavný</span>
                          )}
                          <div className="image-item-overlay">
                            {!image.is_main && (
                              <button 
                                type="button"
                                className="image-item-btn main"
                                onClick={() => setMainImage(image.id)}
                              >
                                ⭐ Nastaviť hlavný
                              </button>
                            )}
                            <div style={{display: 'flex', gap: 4}}>
                              <button 
                                type="button"
                                className="image-item-btn"
                                onClick={() => moveImage(image.id, 'up')}
                                disabled={index === 0}
                                style={{opacity: index === 0 ? 0.5 : 1}}
                              >
                                ↑
                              </button>
                              <button 
                                type="button"
                                className="image-item-btn"
                                onClick={() => moveImage(image.id, 'down')}
                                disabled={index === images.length - 1}
                                style={{opacity: index === images.length - 1 ? 0.5 : 1}}
                              >
                                ↓
                              </button>
                            </div>
                            <button 
                              type="button"
                              className="image-item-btn delete"
                              onClick={() => removeImage(image.id)}
                            >
                              🗑️ Odstrániť
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {images.length === 0 && !uploading && (
                  <div style={{
                    marginTop: 20,
                    padding: 40,
                    textAlign: 'center',
                    color: '#9ca3af'
                  }}>
                    <div style={{fontSize: 40, marginBottom: 12}}>🖼️</div>
                    <p>Zatiaľ žiadne obrázky</p>
                  </div>
                )}
              </div>
            )}

            {/* ========== ATTRIBUTES TAB ========== */}
            {activeTab === 'attributes' && (
              <div>
                <p style={{color: '#6b7280', marginBottom: 20}}>
                  Pridajte technické parametre produktu (napr. Farba, Veľkosť, Pamäť, Procesor...)
                </p>
                
                {attributes.length > 0 && (
                  <div style={{marginBottom: 20}}>
                    <div className="attribute-row" style={{marginBottom: 8}}>
                      <label className="admin-label" style={{margin: 0}}>Názov parametra</label>
                      <label className="admin-label" style={{margin: 0}}>Hodnota</label>
                      <div></div>
                    </div>
                    
                    {attributes.map((attr, index) => (
                      <div key={attr.id || index} className="attribute-row">
                        <input
                          type="text"
                          className="admin-input"
                          placeholder="napr. Farba"
                          value={attr.name}
                          onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                        />
                        <input
                          type="text"
                          className="admin-input"
                          placeholder="napr. Čierna"
                          value={attr.value}
                          onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                        />
                        <button 
                          type="button" 
                          className="attribute-remove"
                          onClick={() => removeAttribute(index)}
                          title="Odstrániť"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <button 
                  type="button" 
                  className="admin-btn admin-btn-outline" 
                  onClick={addAttribute}
                >
                  + Pridať parameter
                </button>

                {attributes.length === 0 && (
                  <div style={{
                    marginTop: 30,
                    padding: 40,
                    textAlign: 'center',
                    background: '#f9fafb',
                    borderRadius: 8,
                    color: '#9ca3af'
                  }}>
                    <div style={{fontSize: 40, marginBottom: 12}}>📊</div>
                    <p>Zatiaľ žiadne parametre</p>
                    <p style={{fontSize: 13}}>Kliknite na "Pridať parameter" pre pridanie</p>
                  </div>
                )}
              </div>
            )}

            {/* ========== SEO TAB ========== */}
            {activeTab === 'seo' && (
              <div style={{maxWidth: 700}}>
                <div className="admin-form-group">
                  <label className="admin-label">SEO Titulok</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={form.seo_title}
                    onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))}
                    placeholder={form.title || 'Názov produktu'}
                    maxLength={60}
                  />
                  <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 4}}>
                    <small style={{color: '#9ca3af'}}>Odporúčaná dĺžka: 50-60 znakov</small>
                    <small style={{color: form.seo_title.length > 60 ? '#dc2626' : '#9ca3af'}}>
                      {form.seo_title.length}/60
                    </small>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">SEO Popis (Meta Description)</label>
                  <textarea
                    className="admin-textarea"
                    value={form.seo_description}
                    onChange={e => setForm(f => ({ ...f, seo_description: e.target.value }))}
                    placeholder={form.short_description || 'Popis produktu pre vyhľadávače...'}
                    maxLength={160}
                    rows={3}
                  />
                  <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 4}}>
                    <small style={{color: '#9ca3af'}}>Odporúčaná dĺžka: 150-160 znakov</small>
                    <small style={{color: form.seo_description.length > 160 ? '#dc2626' : '#9ca3af'}}>
                      {form.seo_description.length}/160
                    </small>
                  </div>
                </div>

                <div style={{
                  marginTop: 30,
                  padding: 20,
                  background: '#f9fafb',
                  borderRadius: 12,
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{fontSize: 12, color: '#6b7280', marginBottom: 12, fontWeight: 500}}>
                    📱 Náhľad vo výsledkoch vyhľadávania:
                  </p>
                  <div style={{
                    background: 'white',
                    padding: 16,
                    borderRadius: 8,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{color: '#1a0dab', fontSize: 18, marginBottom: 4, fontFamily: 'Arial'}}>
                      {form.seo_title || form.title || 'Názov produktu'} | MegaBuy.sk
                    </div>
                    <div style={{color: '#006621', fontSize: 14, marginBottom: 4}}>
                      https://megabuy.sk › produkt › {form.slug || 'url-produktu'}
                    </div>
                    <div style={{color: '#545454', fontSize: 13, lineHeight: 1.4}}>
                      {form.seo_description || form.short_description || 'Popis produktu sa zobrazí tu. Napíšte zaujímavý popis, ktorý priláka návštevníkov z vyhľadávačov.'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
