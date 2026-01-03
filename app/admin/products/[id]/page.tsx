'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'
import type { Product } from '@/lib/types'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'attributes' | 'seo'>('basic')
  
  const [form, setForm] = useState<{
    title: string
    slug: string
    description: string
    short_description: string
    ean: string
    sku: string
    mpn: string
    category_id: string
    brand_id: string
    price_min: number
    price_max: number
    stock_status: 'instock' | 'outofstock' | 'onbackorder'
    stock_quantity: number
    is_active: boolean
    seo_title: string
    seo_description: string
  }>({
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

  useEffect(() => {
    loadProduct()
  }, [productId])

  async function loadProduct() {
    const product = await api.getProduct(productId)
    if (product) {
      setForm({
        title: product.title || '',
        slug: product.slug || '',
        description: product.description || '',
        short_description: product.short_description || '',
        ean: product.ean || '',
        sku: product.sku || '',
        mpn: product.mpn || '',
        category_id: product.category_id || '',
        brand_id: product.brand_id || '',
        price_min: product.price_min || 0,
        price_max: product.price_max || 0,
        stock_status: product.stock_status || 'instock',
        stock_quantity: product.stock_quantity || 0,
        is_active: product.is_active !== false,
        seo_title: '',
        seo_description: '',
      })
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      await api.updateProduct(productId, form)
      router.push('/admin/products')
    } catch (error) {
      alert('Chyba pri ukladaní produktu')
    }
    
    setSaving(false)
  }

  if (loading) {
    return (
      <div style={{textAlign:'center',padding:60}}>
        <p>Načítavam produkt...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-title">Upraviť produkt</h1>
        <div style={{display:'flex',gap:12}}>
          <button type="button" onClick={() => router.back()} className="admin-btn admin-btn-outline">
            ← Späť
          </button>
          <button type="submit" form="product-form" className="admin-btn" disabled={saving}>
            {saving ? 'Ukladám...' : 'Uložiť zmeny'}
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
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
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
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Krátky popis</label>
                    <textarea
                      className="admin-textarea"
                      value={form.short_description}
                      onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Popis</label>
                    <textarea
                      className="admin-textarea"
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      rows={6}
                    />
                  </div>
                </div>

                <div>
                  <div className="admin-grid admin-grid-3" style={{marginBottom: 16}}>
                    <div className="admin-form-group">
                      <label className="admin-label">EAN</label>
                      <input type="text" className="admin-input" value={form.ean} onChange={e => setForm(f => ({ ...f, ean: e.target.value }))} />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">SKU</label>
                      <input type="text" className="admin-input" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">MPN</label>
                      <input type="text" className="admin-input" value={form.mpn} onChange={e => setForm(f => ({ ...f, mpn: e.target.value }))} />
                    </div>
                  </div>

                  <div className="admin-grid admin-grid-2" style={{marginBottom: 16}}>
                    <div className="admin-form-group">
                      <label className="admin-label">Cena od (€)</label>
                      <input type="number" step="0.01" className="admin-input" value={form.price_min} onChange={e => setForm(f => ({ ...f, price_min: parseFloat(e.target.value) || 0 }))} />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Cena do (€)</label>
                      <input type="number" step="0.01" className="admin-input" value={form.price_max} onChange={e => setForm(f => ({ ...f, price_max: parseFloat(e.target.value) || 0 }))} />
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
                      <input type="number" className="admin-input" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: parseInt(e.target.value) || 0 }))} />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                      <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} style={{width:18,height:18}} />
                      <span className="admin-label" style={{margin:0}}>Aktívny produkt</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div style={{border:'2px dashed #d1d5db',borderRadius:12,padding:40,textAlign:'center',background:'#f9fafb'}}>
                <div style={{fontSize:48,marginBottom:12}}>📷</div>
                <p style={{color:'#6b7280'}}>Upload obrázkov bude dostupný čoskoro</p>
              </div>
            )}

            {activeTab === 'attributes' && (
              <div>
                <p style={{color:'#6b7280'}}>Atribúty produktu budú dostupné čoskoro</p>
              </div>
            )}

            {activeTab === 'seo' && (
              <div style={{maxWidth:600}}>
                <div className="admin-form-group">
                  <label className="admin-label">SEO Titulok</label>
                  <input type="text" className="admin-input" value={form.seo_title} onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))} maxLength={60} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">SEO Popis</label>
                  <textarea className="admin-textarea" value={form.seo_description} onChange={e => setForm(f => ({ ...f, seo_description: e.target.value }))} maxLength={160} rows={3} />
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
