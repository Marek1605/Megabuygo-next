'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'attributes' | 'seo'>('basic')
  
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    ean: '',
    sku: '',
    mpn: '',
    category_id: '',
    brand_id: '',
    price_min: 0,
    price_max: 0,
    stock_status: 'instock' as const,
    stock_quantity: 0,
    is_active: true,
    seo_title: '',
    seo_description: '',
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const result = await api.createProduct(form)
      if (result?.id) {
        router.push('/admin/products')
      } else {
        alert('Chyba pri vytváraní produktu')
      }
    } catch (error) {
      alert('Chyba pri vytváraní produktu')
    }
    
    setLoading(false)
  }

  return (
    <div>
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
                    <label className="admin-label">Kategória</label>
                    <select className="admin-select" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                      <option value="">Vyberte kategóriu</option>
                    </select>
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
                      <label className="admin-label">Cena od (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="admin-input"
                        value={form.price_min}
                        onChange={e => setForm(f => ({ ...f, price_min: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Cena do (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="admin-input"
                        value={form.price_max}
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
                <div style={{border:'2px dashed #d1d5db',borderRadius:12,padding:40,textAlign:'center',background:'#f9fafb'}}>
                  <div style={{fontSize:48,marginBottom:12}}>📷</div>
                  <p style={{color:'#6b7280',marginBottom:12}}>Pretiahnite obrázky sem alebo kliknite pre nahratie</p>
                  <input type="file" accept="image/*" multiple style={{display:'none'}} id="images" />
                  <label htmlFor="images" className="admin-btn admin-btn-outline" style={{cursor:'pointer'}}>
                    Vybrať obrázky
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'attributes' && (
              <div>
                <p style={{color:'#6b7280',marginBottom:16}}>Pridajte vlastné atribúty produktu (napr. Farba, Veľkosť, Materiál...)</p>
                <button type="button" className="admin-btn admin-btn-outline">
                  + Pridať atribút
                </button>
              </div>
            )}

            {activeTab === 'seo' && (
              <div style={{maxWidth:600}}>
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
                  <small style={{color:'#9ca3af'}}>{form.seo_title.length}/60 znakov</small>
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
                  <small style={{color:'#9ca3af'}}>{form.seo_description.length}/160 znakov</small>
                </div>

                <div style={{marginTop:24,padding:16,background:'#f9fafb',borderRadius:8}}>
                  <p style={{fontSize:12,color:'#6b7280',marginBottom:8}}>Náhľad vo vyhľadávači:</p>
                  <div style={{color:'#1a0dab',fontSize:18,marginBottom:4}}>{form.seo_title || form.title || 'Názov produktu'}</div>
                  <div style={{color:'#006621',fontSize:13,marginBottom:4}}>megabuy.sk › produkt › {form.slug || 'url-produktu'}</div>
                  <div style={{color:'#545454',fontSize:13}}>{form.seo_description || form.short_description || 'Popis produktu...'}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
