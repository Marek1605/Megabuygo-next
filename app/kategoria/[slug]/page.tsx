'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Header } from '@/components/theme/Header'
import { Footer } from '@/components/theme/Footer'
import { api, formatPrice } from '@/lib/api'

interface Product {
  id: string
  title: string
  slug: string
  description?: string
  short_description?: string
  image_url?: string
  images?: string[]
  price_min: number
  price_max: number
  brand?: string
  ean?: string
  sku?: string
  category_name?: string
  category_slug?: string
  stock_status?: string
  affiliate_url?: string
}

interface Offer {
  id: string
  vendor_name: string
  vendor_logo?: string
  price: number
  delivery_days?: string
  shipping_price?: number
  affiliate_url?: string
}

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    if (slug) {
      loadProduct()
      loadCategories()
    }
  }, [slug])

  async function loadProduct() {
    setLoading(true)
    const data = await api.getProductBySlug(slug)
    if (data) {
      setProduct(data)
      if (data.id) {
        const offersData = await api.getProductOffers(data.id)
        if (offersData && Array.isArray(offersData)) {
          setOffers(offersData)
        }
      }
    }
    setLoading(false)
  }

  async function loadCategories() {
    const cats = await api.getCategoriesTree()
    if (cats && Array.isArray(cats)) {
      setCategories(cats)
    }
  }

  const allImages = product ? [product.image_url, ...(product.images || [])].filter(Boolean) as string[] : []

  if (loading) {
    return (
      <>
        <Header categories={categories} />
        <main style={{ padding: '40px 20px', minHeight: '60vh', textAlign: 'center' }}>
          <p>Nacítavam produkt...</p>
        </main>
        <Footer />
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Header categories={categories} />
        <main style={{ padding: '100px 20px', textAlign: 'center', minHeight: '60vh' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>Produkt nebol nájdený</h1>
          <Link href="/" style={{ color: '#ff6b35' }}>? Spät na hlavnú stránku</Link>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header categories={categories} />
      <main style={{ background: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <nav style={{ display: 'flex', gap: 8, padding: '16px 0', fontSize: 14, color: '#6b7280', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Domov</Link>
            <span>›</span>
            {product.category_slug && product.category_name && (
              <>
                <Link href={`/kategoria/${product.category_slug}`} style={{ color: '#6b7280', textDecoration: 'none' }}>{product.category_name}</Link>
                <span>›</span>
              </>
            )}
            <span style={{ color: '#1f2937', fontWeight: 500 }}>{product.title}</span>
          </nav>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 40 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: 24 }}>
              <div style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderRadius: 16, background: '#f9fafb' }}>
                {allImages.length > 0 ? (
                  <img src={allImages[selectedImage]} alt={product.title} style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: 120, opacity: 0.3 }}>??</span>
                )}
              </div>
              {allImages.length > 1 && (
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
                  {allImages.map((img, i) => (
                    <div key={i} onClick={() => setSelectedImage(i)} style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', border: selectedImage === i ? '2px solid #ff6b35' : '2px solid transparent', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              {product.brand && <div style={{ fontSize: 14, color: '#ff6b35', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>{product.brand}</div>}
              <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', margin: '0 0 16px', lineHeight: 1.3 }}>{product.title}</h1>
              
              <div style={{ display: 'flex', gap: 24, marginBottom: 24, fontSize: 14, color: '#6b7280' }}>
                {product.ean && <span>?? EAN: {product.ean}</span>}
                {product.sku && <span>??? SKU: {product.sku}</span>}
              </div>

              <div style={{ background: 'linear-gradient(135deg, #fff9f5, #fff)', border: '2px solid #ffe4d4', borderRadius: 20, padding: 24, marginBottom: 24 }}>
                <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>Najnižšia cena</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#1f2937' }}>{formatPrice(product.price_min)}</div>
                {product.price_max > product.price_min && (
                  <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>až {formatPrice(product.price_max)} z {offers.length || 1} obchodov</div>
                )}
                <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                  {offers.length > 0 && offers[0].affiliate_url ? (
                    <a href={offers[0].affiliate_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '16px 24px', background: 'linear-gradient(135deg, #ff6b35, #ff8c5a)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
                      ?? Kúpit za {formatPrice(product.price_min)}
                    </a>
                  ) : (
                    <span style={{ flex: 1, padding: '16px 24px', background: '#ccc', color: '#fff', borderRadius: 12, fontSize: 16, fontWeight: 600, textAlign: 'center' }}>Momentálne nedostupné</span>
                  )}
                </div>
              </div>

              {product.short_description && (
                <p style={{ color: '#4b5563', lineHeight: 1.6 }}>{product.short_description}</p>
              )}
            </div>
          </div>

          {offers.length > 0 && (
            <section style={{ background: '#fff', borderRadius: 20, padding: 24, marginBottom: 40 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: '0 0 20px' }}>?? Porovnanie cien ({offers.length} obchodov)</h2>
              {offers.map((offer, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 20, border: '1px solid #e5e7eb', borderRadius: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 180 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>??</div>
                    <span style={{ fontWeight: 600, color: '#1f2937' }}>{offer.vendor_name}</span>
                  </div>
                  <div style={{ flex: 1, fontSize: 14, color: '#6b7280' }}>
                    {offer.delivery_days === '1-2' ? <span style={{ color: '#10b981', fontWeight: 500 }}>? Skladom</span> : <span>Dodanie: {offer.delivery_days || 'Na dopyt'}</span>}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', minWidth: 120, textAlign: 'right' }}>{formatPrice(offer.price)}</div>
                  {offer.affiliate_url && (
                    <a href={offer.affiliate_url} target="_blank" rel="noopener noreferrer" style={{ padding: '12px 24px', background: '#ff6b35', color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Do obchodu ?</a>
                  )}
                </div>
              ))}
            </section>
          )}

          {product.description && (
            <section style={{ background: '#fff', borderRadius: 20, padding: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: '0 0 16px' }}>?? Popis produktu</h2>
              <div style={{ fontSize: 15, lineHeight: 1.7, color: '#4b5563' }} dangerouslySetInnerHTML={{ __html: product.description }} />
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}