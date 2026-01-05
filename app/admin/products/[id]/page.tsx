'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

interface Product {
  id: string
  title: string
  slug: string
  description?: string
  short_description?: string
  ean?: string
  sku?: string
  brand?: string
  image_url?: string
  images?: { id: string; url: string; alt?: string; position: number; is_main: boolean }[]
  affiliate_url?: string
  category_id?: string
  price_min: number
  price_max: number
  stock_status: string
  is_active: boolean
  is_featured: boolean
  meta_title?: string
  meta_description?: string
}

interface Category {
  id: string
  name: string
  slug: string
  parent_id?: string
}

export default function EditProductPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [activeTab, setActiveTab] = useState('basic')
  const [uploadingImages, setUploadingImages] = useState(false)
  
  const [product, setProduct] = useState<Product>({
    id: '',
    title: '',
    slug: '',
    description: '',
    short_description: '',
    ean: '',
    sku: '',
    brand: '',
    image_url: '',
    images: [],
    affiliate_url: '',
    category_id: '',
    price_min: 0,
    price_max: 0,
    stock_status: 'instock',
    is_active: true,
    is_featured: false,
    meta_title: '',
    meta_description: ''
  })

  useEffect(() => {
    if (id) {
      loadProduct()
      loadCategories()
    }
  }, [id])

  async function loadProduct() {
    setLoading(true)
    const data = await api.getProduct(id)
    if (data) {
      setProduct({
        ...data,
        images: data.images || []
      })
    }
    setLoading(false)
  }

  async function loadCategories() {
    const cats = await api.getCategoriesFlat()
    if (cats && Array.isArray(cats)) {
      setCategories(cats)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    
    const result = await api.updateProduct(id, product)
    if (result) {
      alert('Produkt bol uložený!')
    } else {
      alert('Chyba pri ukladaní produktu')
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm('Naozaj chcete vymazať tento produkt?')) return
    
    const result = await api.deleteProduct(id)
    if (result) {
      router.push('/admin/products')
    } else {
      alert('Chyba pri mazaní produktu')
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)
    
    for (let i = 0; i < files.length; i++) {
      const result = await api.uploadImage(files[i])
      if (result?.url) {
        if (!product.image_url) {
          setProduct(prev => ({ ...prev, image_url: result.url }))
        } else {
          setProduct(prev => ({ 
            ...prev, 
            images: [...(prev.images || []), { id: '', url: result.url, alt: '', position: 0, is_main: false }] 
          }))
        }
      }
    }
    
    setUploadingImages(false)
  }

  function removeImage(index: number) {
    if (index === -1) {
      const newImages = [...(product.images || [])]
      const newMain = newImages.shift()
      setProduct(prev => ({
        ...prev,
        image_url: newMain?.url || '',
        images: newImages
      }))
    } else {
      setProduct(prev => ({
        ...prev,
        images: (prev.images || []).filter((_, i) => i !== index)
      }))
    }
  }

  function setAsMainImage(index: number) {
    const newImages = [...(product.images || [])]
    const newMain = newImages[index]
    newImages.splice(index, 1)
    if (product.image_url) {
      newImages.unshift({ id: '', url: product.image_url, alt: '', position: 0, is_main: false })
    }
    setProduct(prev => ({
      ...prev,
      image_url: newMain.url,
      images: newImages
    }))
  }

  const allImages = [
    product.image_url ? { url: product.image_url, is_main: true } : null,
    ...(product.images || [])
  ].filter(Boolean) as { url: string; is_main?: boolean }[]

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>Načítavam produkt...</p>
      </div>
    )
  }

  return (
    <>
      <style jsx global>{`
        .edit-page { padding: 24px; max-width: 1200px; margin: 0 auto; }
        .edit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .edit-title { font-size: 24px; font-weight: 700; color: #1f2937; margin: 0; }
        .edit-actions { display: flex; gap: 12px; }
        .btn { padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; border: none; }
        .btn-danger { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .btn-danger:hover { background: #dc2626; color: #fff; }
        .btn-secondary { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
        .btn-secondary:hover { border-color: #9ca3af; }
        .btn-primary { background: linear-gradient(135deg, #c9a87c, #b8956e); color: #fff; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(201,168,124,0.3); }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .tabs { display: flex; gap: 4px; margin-bottom: 24px; background: #f3f4f6; padding: 4px; border-radius: 12px; }
        .tab { padding: 12px 20px; background: transparent; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; color: #6b7280; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .tab:hover { color: #374151; }
        .tab.active { background: #fff; color: #c9a87c; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        
        .form-card { background: #fff; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .form-group { margin-bottom: 20px; }
        .form-group.full { grid-column: 1 / -1; }
        .form-label { display: block; font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px; }
        .form-input { width: 100%; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; transition: all 0.2s; box-sizing: border-box; }
        .form-input:focus { outline: none; border-color: #c9a87c; box-shadow: 0 0 0 3px rgba(201,168,124,0.1); }
        .form-textarea { min-height: 150px; resize: vertical; }
        .form-select { appearance: none; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L2 4h8z'/%3E%3C/svg%3E") no-repeat right 16px center; padding-right: 40px; }
        .form-checkbox { display: flex; align-items: center; gap: 10px; cursor: pointer; }
        .form-checkbox input { width: 18px; height: 18px; accent-color: #c9a87c; }
        
        .images-section { }
        .images-upload { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; border: 2px dashed #e5e7eb; border-radius: 12px; cursor: pointer; transition: all 0.2s; margin-bottom: 20px; }
        .images-upload:hover { border-color: #c9a87c; background: #fefbf6; }
        .images-upload input { display: none; }
        .images-upload-icon { font-size: 40px; margin-bottom: 12px; }
        .images-upload-text { font-size: 14px; color: #374151; font-weight: 500; }
        .images-upload-formats { font-size: 12px; color: #9ca3af; margin-top: 8px; }
        
        .images-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; }
        .image-item { position: relative; aspect-ratio: 1; border-radius: 12px; overflow: hidden; background: #f9fafb; border: 2px solid transparent; }
        .image-item.main { border-color: #c9a87c; }
        .image-item img { width: 100%; height: 100%; object-fit: contain; }
        .image-badge { position: absolute; top: 8px; left: 8px; background: #c9a87c; color: #fff; font-size: 10px; padding: 4px 8px; border-radius: 4px; font-weight: 600; }
        .image-actions { position: absolute; bottom: 8px; right: 8px; display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; }
        .image-item:hover .image-actions { opacity: 1; }
        .image-btn { width: 28px; height: 28px; border-radius: 6px; border: none; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; }
        .image-btn-main { background: #c9a87c; color: #fff; }
        .image-btn-delete { background: #fee2e2; color: #dc2626; }
        
        .no-images { text-align: center; padding: 40px; color: #9ca3af; }
        .no-images-icon { font-size: 48px; margin-bottom: 12px; }
      `}</style>

      <div className="edit-page">
        <div className="edit-header">
          <h1 className="edit-title">✏️ Upraviť produkt</h1>
          <div className="edit-actions">
            <button className="btn btn-danger" onClick={handleDelete}>🗑️ Vymazať</button>
            <Link href="/admin/products" className="btn btn-secondary">← Späť</Link>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? '⏳ Ukladám...' : '💾 Uložiť'}
            </button>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${activeTab === 'basic' ? 'active' : ''}`} onClick={() => setActiveTab('basic')}>
            📝 Základné
          </button>
          <button className={`tab ${activeTab === 'images' ? 'active' : ''}`} onClick={() => setActiveTab('images')}>
            🖼️ Obrázky ({allImages.length})
          </button>
          <button className={`tab ${activeTab === 'attributes' ? 'active' : ''}`} onClick={() => setActiveTab('attributes')}>
            🏷️ Atribúty
          </button>
          <button className={`tab ${activeTab === 'seo' ? 'active' : ''}`} onClick={() => setActiveTab('seo')}>
            🔍 SEO
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === 'basic' && (
            <div className="form-card">
              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label">Názov produktu *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={product.title}
                    onChange={e => setProduct(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kategória</label>
                  <select
                    className="form-input form-select"
                    value={product.category_id || ''}
                    onChange={e => setProduct(prev => ({ ...prev, category_id: e.target.value }))}
                  >
                    <option value="">-- Vyberte kategóriu --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Značka</label>
                  <input
                    type="text"
                    className="form-input"
                    value={product.brand || ''}
                    onChange={e => setProduct(prev => ({ ...prev, brand: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cena od (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={product.price_min}
                    onChange={e => setProduct(prev => ({ ...prev, price_min: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cena do (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={product.price_max}
                    onChange={e => setProduct(prev => ({ ...prev, price_max: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div className="form-group full">
                  <label className="form-label">Krátky popis</label>
                  <textarea
                    className="form-input form-textarea"
                    rows={3}
                    value={product.short_description || ''}
                    onChange={e => setProduct(prev => ({ ...prev, short_description: e.target.value }))}
                  />
                </div>

                <div className="form-group full">
                  <label className="form-label">Popis</label>
                  <textarea
                    className="form-input form-textarea"
                    rows={6}
                    value={product.description || ''}
                    onChange={e => setProduct(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Affiliate URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={product.affiliate_url || ''}
                    onChange={e => setProduct(prev => ({ ...prev, affiliate_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stav skladu</label>
                  <select
                    className="form-input form-select"
                    value={product.stock_status}
                    onChange={e => setProduct(prev => ({ ...prev, stock_status: e.target.value }))}
                  >
                    <option value="instock">Skladom</option>
                    <option value="outofstock">Vypredané</option>
                    <option value="onbackorder">Na objednávku</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-checkbox">
                    <input
                      type="checkbox"
                      checked={product.is_active}
                      onChange={e => setProduct(prev => ({ ...prev, is_active: e.target.checked }))}
                    />
                    Aktívny produkt
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-checkbox">
                    <input
                      type="checkbox"
                      checked={product.is_featured}
                      onChange={e => setProduct(prev => ({ ...prev, is_featured: e.target.checked }))}
                    />
                    Odporúčaný produkt
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="form-card">
              <div className="images-section">
                <label className="images-upload">
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                  />
                  <div className="images-upload-icon">📷</div>
                  <div className="images-upload-text">
                    {uploadingImages ? 'Nahrávam...' : 'Kliknite pre nahratie obrázkov'}
                  </div>
                  <div className="images-upload-formats">JPG, PNG, WebP, GIF (max 10MB)</div>
                </label>

                {allImages.length > 0 ? (
                  <div className="images-grid">
                    {product.image_url && (
                      <div className="image-item main">
                        <img src={product.image_url} alt="Hlavný" />
                        <span className="image-badge">Hlavný</span>
                        <div className="image-actions">
                          <button type="button" className="image-btn image-btn-delete" onClick={() => removeImage(-1)}>×</button>
                        </div>
                      </div>
                    )}
                    {(product.images || []).map((img, index) => (
                      <div key={index} className="image-item">
                        <img src={typeof img === 'string' ? img : img.url} alt={`Obrázok ${index + 2}`} />
                        <div className="image-actions">
                          <button type="button" className="image-btn image-btn-main" onClick={() => setAsMainImage(index)} title="Nastaviť ako hlavný">★</button>
                          <button type="button" className="image-btn image-btn-delete" onClick={() => removeImage(index)}>×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-images">
                    <div className="no-images-icon">🖼️</div>
                    <p>Zatiaľ žiadne obrázky</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'attributes' && (
            <div className="form-card">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">EAN</label>
                  <input
                    type="text"
                    className="form-input"
                    value={product.ean || ''}
                    onChange={e => setProduct(prev => ({ ...prev, ean: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input
                    type="text"
                    className="form-input"
                    value={product.sku || ''}
                    onChange={e => setProduct(prev => ({ ...prev, sku: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="form-card">
              <div className="form-group">
                <label className="form-label">SEO Titulok</label>
                <input
                  type="text"
                  className="form-input"
                  value={product.meta_title || ''}
                  onChange={e => setProduct(prev => ({ ...prev, meta_title: e.target.value }))}
                  placeholder={product.title}
                />
              </div>

              <div className="form-group">
                <label className="form-label">SEO Popis</label>
                <textarea
                  className="form-input form-textarea"
                  rows={3}
                  value={product.meta_description || ''}
                  onChange={e => setProduct(prev => ({ ...prev, meta_description: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL Slug</label>
                <input
                  type="text"
                  className="form-input"
                  value={product.slug}
                  onChange={e => setProduct(prev => ({ ...prev, slug: e.target.value }))}
                />
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  )
}
