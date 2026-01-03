'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface StoredImage {
  id: string
  url: string
  alt?: string
  is_main: boolean
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
  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'attributes' | 'seo'>('basic')
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [images, setImages] = useState<StoredImage[]>([])
  const [attributes, setAttributes] = useState<{ name: string; value: string }[]>([])
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
    category_id: '',
    brand_name: '',
    price_min: 0,
    price_max: 0,
    stock_status: 'instock' as const,
    stock_quantity: 0,
    is_active: true,
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

  const handleTitleChange = (title: string) => {
    setForm(f => ({ ...f, title, slug: f.slug || generateSlug(title) }))
  }

  // Image handling
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    try {
      const newImages = await api.uploadImages(files)
      setImages(prev => {
        const updated = [...prev, ...newImages]
        // Mark first as main if no main exists
        if (!updated.some(img => img.is_main) && updated.length > 0) {
          updated[0].is_main = true
        }
        return updated
      })
    } catch (error) {
      console.error('Upload error:', error)
      alert('Chyba pri nahrávaní obrázkov')
    }
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
      // If we removed main, make first one main
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

  // Attributes handling
  const addAttribute = () => {
    setAttributes(prev => [...prev, { name: '', value: '' }])
  }

  const updateAttribute = (index: number, field: 'name' | 'value', value: string) => {
    setAttributes(prev => prev.map((attr, i) => 
      i === index ? { ...attr, [field]: value } : attr
    ))
  }

  const removeAttribute = (index: number) => {
    setAttributes(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const productData = {
        ...form,
        images: images,
        image_url: images.find(img => img.is_main)?.url || images[0]?.url || '',
        attributes: attributes.filter(a => a.name && a.value),
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
        }
        .image-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .image-item-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          opacity: 0;
          transition: opacity 0.2s;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }
        .image-item:hover .image-item-overlay {
          opacity: 1;
        }
        .image-item-btn {
          padding: 6px 12px;
          background: #fff;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .image-item-btn.delete {
          background: #fee2e2;
          color: #dc2626;
        }
        .image-item-btn.main {
          background: #dcfce7;
          color: #16a34a;
        }
        .image-main-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #ff6b35;
          color: #fff;
          font-size: 10px;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
        }
        .attribute-row {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
          align-items: flex-start;
        }
        .attribute-row .admin-input {
          flex: 1;
        }
        .attribute-remove {
          padding: 10px;
          background: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
      `}</style>

      <div className="admin-header">
        <h1 className="admin-title">Nový produkt</h1>
        <div style={{display:'flex',gap:12}}>
          <button type="button" onClick={() => router.back()} className="admin-btn admin-btn-outline">
            ← Späť
          </button>
          <button type="submit" form="product-form" className="admin-btn" disabled={loading}>
            {loading ? 'Ukladám...' : 'Uložiť produkt'}
          </button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit}>
        <div className="admin-card">
          <div className="admin-tabs">
            {[
              { id: 'basic', label: 'Základné info' },
              { id: 'media', label: 'Obrázky' },
              { id: 'attributes', label: 'Atribúty' },
              { id: 'seo', label: 'SEO' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                {tab.label}
                {tab.id === 'media' && images.length > 0 && (
                  <span style={{marginLeft: 6, background: '#ff6b35', color: '#fff', padding: '2px 6px', borderRadius: 10, fontSize: 11}}>
                    {images.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="admin-card-body">
            {activeTab === 'basic' && (
              <div className="admin-grid admin-grid-2">
                <div>
                  <div className="admin-form-group">
                    <label className="admin-label">Názov produktu *</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={form.title}
                      onChange={e => handleTitleChange(e.target.value)}
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
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Kategória *</label>
                    <select 
                      className="admin-select" 
                      value={form.category_id} 
                      onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                      required
                    >
                      <option value="">Vyberte kategóriu</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {'—'.repeat(cat.depth)} {cat.name}
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
                      placeholder="Krátky popis produktu..."
                      rows={3}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Popis</label>
                    <textarea
                      className="admin-textarea"
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Dlhý popis produktu..."
                      rows={6}
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
                        placeholder="5901234123457"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">SKU</label>
                      <input
                        type="text"
                        className="admin-input"
                        value={form.sku}
                        onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                        placeholder="APL-IP15-256"
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
                        className="admin-input"
                        value={form.price_min || ''}
                        onChange={e => setForm(f => ({ ...f, price_min: parseFloat(e.target.value) || 0 }))}
                        required
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Cena do (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="admin-input"
                        value={form.price_max || ''}
                        onChange={e => setForm(f => ({ ...f, price_max: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="admin-grid admin-grid-2" style={{marginBottom: 16}}>
                    <div className="admin-form-group">
                      <label className="admin-label">Stav skladu</label>
                      <select className="admin-select" value={form.stock_status} onChange={e => setForm(f => ({ ...f, stock_status: e.target.value as any }))}>
                        <option value="instock">Skladom</option>
                        <option value="outofstock">Nedostupné</option>
                        <option value="onbackorder">Na objednávku</option>
                      </select>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Počet kusov</label>
                      <input
                        type="number"
                        className="admin-input"
                        value={form.stock_quantity}
                        onChange={e => setForm(f => ({ ...f, stock_quantity: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                        style={{width:18,height:18}}
                      />
                      <span className="admin-label" style={{margin:0}}>Aktívny produkt</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

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
                  <p style={{color: '#6b7280', marginBottom: 12}}>
                    Pretiahnite obrázky sem alebo kliknite pre nahratie
                  </p>
                  <p style={{color: '#9ca3af', fontSize: 13}}>
                    Podporované formáty: JPG, PNG, WebP, GIF
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

                {images.length > 0 && (
                  <div className="image-grid">
                    {images.map((image, index) => (
                      <div key={image.id} className="image-item">
                        <img src={image.url} alt={image.alt || ''} />
                        {image.is_main && (
                          <span className="image-main-badge">Hlavný</span>
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
                            >
                              ↑
                            </button>
                            <button 
                              type="button"
                              className="image-item-btn"
                              onClick={() => moveImage(image.id, 'down')}
                              disabled={index === images.length - 1}
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
                )}
              </div>
            )}

            {activeTab === 'attributes' && (
              <div>
                <p style={{color: '#6b7280', marginBottom: 16}}>
                  Pridajte vlastné atribúty produktu (napr. Farba, Veľkosť, Materiál...)
                </p>
                
                {attributes.map((attr, index) => (
                  <div key={index} className="attribute-row">
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Názov atribútu"
                      value={attr.name}
                      onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                    />
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Hodnota"
                      value={attr.value}
                      onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="attribute-remove"
                      onClick={() => removeAttribute(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                <button type="button" className="admin-btn admin-btn-outline" onClick={addAttribute}>
                  + Pridať atribút
                </button>
              </div>
            )}

            {activeTab === 'seo' && (
              <div style={{maxWidth: 600}}>
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
                  <small style={{color: '#9ca3af'}}>{form.seo_title.length}/60 znakov</small>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">SEO Popis</label>
                  <textarea
                    className="admin-textarea"
                    value={form.seo_description}
                    onChange={e => setForm(f => ({ ...f, seo_description: e.target.value }))}
                    placeholder={form.short_description || 'Popis produktu pre vyhľadávače...'}
                    maxLength={160}
                    rows={3}
                  />
                  <small style={{color: '#9ca3af'}}>{form.seo_description.length}/160 znakov</small>
                </div>

                <div style={{marginTop: 24, padding: 16, background: '#f9fafb', borderRadius: 8}}>
                  <p style={{fontSize: 12, color: '#6b7280', marginBottom: 8}}>Náhľad vo vyhľadávači:</p>
                  <div style={{color: '#1a0dab', fontSize: 18, marginBottom: 4}}>{form.seo_title || form.title || 'Názov produktu'}</div>
                  <div style={{color: '#006621', fontSize: 13, marginBottom: 4}}>megabuy.sk › produkt › {form.slug || 'url-produktu'}</div>
                  <div style={{color: '#545454', fontSize: 13}}>{form.seo_description || form.short_description || 'Popis produktu...'}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
