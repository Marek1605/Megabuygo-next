'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
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
  offer_count?: number
}

interface Offer {
  id: string
  vendor_name: string
  vendor_logo?: string
  price: number
  delivery_time?: string
  delivery_price?: number
  url: string
  is_featured?: boolean
}

interface Category {
  id: string
  name: string
  slug: string
  children?: Category[]
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  
  const [product, setProduct] = useState<Product | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showFullDesc, setShowFullDesc] = useState(false)

  useEffect(() => {
    loadProduct()
    loadCategories()
  }, [slug])

  async function loadProduct() {
    setLoading(true)
    const data = await api.getProductBySlug(slug)
    if (data) {
      setProduct(data)
      // Load offers
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

  // Get all images (main + gallery)
  const allImages = product ? [
    product.image_url,
    ...(product.images || [])
  ].filter(Boolean) as string[] : []

  if (loading) {
    return (
      <>
        <Header categories={categories} />
        <main style={{ padding: '40px 20px', minHeight: '60vh' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <p>Načítavam produkt...</p>
          </div>
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
          <Link href="/" style={{ color: '#ff6b35' }}>← Späť na hlavnú stránku</Link>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <style jsx global>{`
        .product-page { background: #f8fafc; min-height: 100vh; }
        .product-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        /* Breadcrumb */
        .breadcrumb { display: flex; align-items: center; gap: 8px; padding: 16px 0; font-size: 14px; color: #6b7280; flex-wrap: wrap; }
        .breadcrumb a { color: #6b7280; text-decoration: none; }
        .breadcrumb a:hover { color: #ff6b35; }
        .breadcrumb-sep { color: #d1d5db; }
        .breadcrumb-current { color: #1f2937; font-weight: 500; }
        
        /* Main Layout */
        .product-main { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        @media (max-width: 900px) { .product-main { grid-template-columns: 1fr; } }
        
        /* Gallery */
        .product-gallery { background: #fff; border-radius: 20px; padding: 24px; }
        .gallery-main { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; border-radius: 16px; background: #f9fafb; overflow: hidden; }
        .gallery-main img { max-width: 100%; max-height: 400px; object-fit: contain; }
        .gallery-main-placeholder { font-size: 120px; opacity: 0.3; }
        .gallery-thumbs { display: flex; gap: 12px; overflow-x: auto; padding: 4px; }
        .gallery-thumb { width: 80px; height: 80px; border-radius: 12px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: all 0.2s; flex-shrink: 0; background: #f9fafb; display: flex; align-items: center; justify-content: center; }
        .gallery-thumb:hover { border-color: #ff6b35; }
        .gallery-thumb.active { border-color: #ff6b35; box-shadow: 0 0 0 3px rgba(255,107,53,0.2); }
        .gallery-thumb img { width: 100%; height: 100%; object-fit: contain; }
        
        /* Info */
        .product-info { }
        .product-brand { font-size: 14px; color: #ff6b35; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; }
        .product-title { font-size: 28px; font-weight: 700; color: #1f2937; margin: 0 0 16px; line-height: 1.3; }
        .product-meta { display: flex; gap: 24px; margin-bottom: 24px; font-size: 14px; color: #6b7280; }
        .product-meta-item { display: flex; align-items: center; gap: 6px; }
        
        /* Price Box */
        .price-box { background: linear-gradient(135deg, #fff9f5, #fff); border: 2px solid #ffe4d4; border-radius: 20px; padding: 24px; margin-bottom: 24px; }
        .price-label { font-size: 14px; color: #6b7280; margin-bottom: 4px; }
        .price-value { font-size: 36px; font-weight: 800; color: #1f2937; }
        .price-range { font-size: 14px; color: #6b7280; margin-top: 4px; }
        .price-cta { display: flex; gap: 12px; margin-top: 20px; }
        .btn-primary { flex: 1; padding: 16px 24px; background: linear-gradient(135deg, #ff6b35, #ff8c5a); color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s; text-decoration: none; text-align: center; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(255,107,53,0.3); }
        .btn-secondary { padding: 16px 20px; background: #fff; border: 2px solid #e5e7eb; border-radius: 12px; font-size: 16px; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { border-color: #ff6b35; color: #ff6b35; }
        
        /* Offers */
        .offers-section { background: #fff; border-radius: 20px; padding: 24px; margin-bottom: 40px; }
        .offers-title { font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 20px; display: flex; align-items: center; gap: 10px; }
        .offers-count { font-size: 14px; font-weight: 400; color: #6b7280; }
        .offer-card { display: flex; align-items: center; gap: 20px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px; margin-bottom: 12px; transition: all 0.2s; }
        .offer-card:hover { border-color: #ff6b35; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .offer-card.featured { border-color: #10b981; background: #f0fdf4; }
        .offer-vendor { display: flex; align-items: center; gap: 12px; min-width: 180px; }
        .offer-vendor-logo { width: 48px; height: 48px; border-radius: 10px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .offer-vendor-logo img { width: 100%; height: 100%; object-fit: contain; border-radius: 10px; }
        .offer-vendor-name { font-weight: 600; color: #1f2937; }
        .offer-delivery { flex: 1; font-size: 14px; color: #6b7280; }
        .offer-delivery-fast { color: #10b981; font-weight: 500; }
        .offer-price { font-size: 24px; font-weight: 700; color: #1f2937; min-width: 120px; text-align: right; }
        .offer-btn { padding: 12px 24px; background: #ff6b35; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; white-space: nowrap; }
        .offer-btn:hover { background: #e55a2b; }
        
        /* Description */
        .desc-section { background: #fff; border-radius: 20px; padding: 24px; margin-bottom: 40px; }
        .desc-title { font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 16px; }
        .desc-content { font-size: 15px; line-height: 1.7; color: #4b5563; }
        .desc-content.collapsed { max-height: 200px; overflow: hidden; position: relative; }
        .desc-content.collapsed::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 80px; background: linear-gradient(transparent, #fff); }
        .desc-toggle { display: inline-block; margin-top: 12px; color: #ff6b35; font-weight: 500; cursor: pointer; }
        
        /* Specs */
        .specs-section { background: #fff; border-radius: 20px; padding: 24px; }
        .specs-title { font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 16px; }
        .specs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
        .spec-item { display: flex; justify-content: space-between; padding: 12px 16px; background: #f9fafb; border-radius: 10px; }
        .spec-label { color: #6b7280; font-size: 14px; }
        .spec-value { color: #1f2937; font-weight: 500; font-size: 14px; }
        
        /* Empty offers */
        .no-offers { text-align: center; padding: 40px; color: #6b7280; }
        .no-offers-icon { font-size: 48px; margin-bottom: 12px; }
        
        @media (max-width: 768px) {
          .offer-card { flex-wrap: wrap; }
          .offer-vendor { min-width: 100%; }
          .offer-price { min-width: auto; text-align: left; }
        }
      `}</style>

      <Header categories={categories} />

      <main className="product-page">
        <div className="product-container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link href="/">Domov</Link>
            <span className="breadcrumb-sep">›</span>
            {product.category_slug && product.category_name && (
              <>
                <Link href={`/kategoria/${product.category_slug}`}>{product.category_name}</Link>
                <span className="breadcrumb-sep">›</span>
              </>
            )}
            <span className="breadcrumb-current">{product.title}</span>
          </nav>

          {/* Main Section */}
          <div className="product-main">
            {/* Gallery */}
            <div className="product-gallery">
              <div className="gallery-main">
                {allImages.length > 0 ? (
                  <img src={allImages[selectedImage]} alt={product.title} />
                ) : (
                  <span className="gallery-main-placeholder">📦</span>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="gallery-thumbs">
                  {allImages.map((img, i) => (
                    <div 
                      key={i} 
                      className={`gallery-thumb ${selectedImage === i ? 'active' : ''}`}
                      onClick={() => setSelectedImage(i)}
                    >
                      <img src={img} alt={`${product.title} ${i + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="product-info">
              {product.brand && <div className="product-brand">{product.brand}</div>}
              <h1 className="product-title">{product.title}</h1>
              
              <div className="product-meta">
                {product.ean && (
                  <div className="product-meta-item">
                    <span>📊</span> EAN: {product.ean}
                  </div>
                )}
                {product.sku && (
                  <div className="product-meta-item">
                    <span>🏷️</span> SKU: {product.sku}
                  </div>
                )}
              </div>

              {/* Price Box */}
              <div className="price-box">
                <div className="price-label">Najnižšia cena</div>
                <div className="price-value">{formatPrice(product.price_min)}</div>
                {product.price_max > product.price_min && (
                  <div className="price-range">
                    až {formatPrice(product.price_max)} z {offers.length || 1} obchodov
                  </div>
                )}
                <div className="price-cta">
                  {product.affiliate_url ? (
                    <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                      🛒 Kúpiť za {formatPrice(product.price_min)}
                    </a>
                  ) : offers.length > 0 ? (
                    <a href={offers[0].url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                      🛒 Zobraziť v obchode
                    </a>
                  ) : (
                    <span className="btn-primary" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                      Momentálne nedostupné
                    </span>
                  )}
                  <button className="btn-secondary">❤️</button>
                  <button className="btn-secondary">⚖️</button>
                </div>
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: 20 }}>
                  {product.short_description}
                </p>
              )}
            </div>
          </div>

          {/* Offers Section */}
          {offers.length > 0 && (
            <section className="offers-section">
              <h2 className="offers-title">
                🏪 Porovnanie cien <span className="offers-count">({offers.length} obchodov)</span>
              </h2>
              {offers.map((offer, i) => (
                <div key={offer.id || i} className={`offer-card ${offer.is_featured ? 'featured' : ''}`}>
                  <div className="offer-vendor">
                    <div className="offer-vendor-logo">
                      {offer.vendor_logo ? (
                        <img src={offer.vendor_logo} alt={offer.vendor_name} />
                      ) : '🏪'}
                    </div>
                    <span className="offer-vendor-name">{offer.vendor_name}</span>
                  </div>
                  <div className="offer-delivery">
                    {offer.delivery_time === '0' || offer.delivery_time === 'Skladom' ? (
                      <span className="offer-delivery-fast">✓ Skladom - odoslanie ihneď</span>
                    ) : offer.delivery_time ? (
                      <span>Dodanie: {offer.delivery_time}</span>
                    ) : (
                      <span>Overiť dostupnosť</span>
                    )}
                    {offer.delivery_price !== undefined && (
                      <div style={{ fontSize: 12, marginTop: 4 }}>
                        Doprava od {formatPrice(offer.delivery_price)}
                      </div>
                    )}
                  </div>
                  <div className="offer-price">{formatPrice(offer.price)}</div>
                  <a href={offer.url} target="_blank" rel="noopener noreferrer" className="offer-btn">
                    Do obchodu →
                  </a>
                </div>
              ))}
            </section>
          )}

          {offers.length === 0 && product.affiliate_url && (
            <section className="offers-section">
              <h2 className="offers-title">🏪 Kúpiť produkt</h2>
              <div className="offer-card">
                <div className="offer-vendor">
                  <div className="offer-vendor-logo">🏪</div>
                  <span className="offer-vendor-name">Externý obchod</span>
                </div>
                <div className="offer-delivery">
                  <span>Overiť dostupnosť na stránke predajcu</span>
                </div>
                <div className="offer-price">{formatPrice(product.price_min)}</div>
                <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer" className="offer-btn">
                  Do obchodu →
                </a>
              </div>
            </section>
          )}

          {/* Description */}
          {product.description && (
            <section className="desc-section">
              <h2 className="desc-title">📝 Popis produktu</h2>
              <div 
                className={`desc-content ${!showFullDesc ? 'collapsed' : ''}`}
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
              <span className="desc-toggle" onClick={() => setShowFullDesc(!showFullDesc)}>
                {showFullDesc ? '↑ Skryť' : '↓ Zobraziť celý popis'}
              </span>
            </section>
          )}

          {/* Specs */}
          {(product.ean || product.sku || product.brand) && (
            <section className="specs-section">
              <h2 className="specs-title">📋 Špecifikácie</h2>
              <div className="specs-grid">
                {product.brand && (
                  <div className="spec-item">
                    <span className="spec-label">Značka</span>
                    <span className="spec-value">{product.brand}</span>
                  </div>
                )}
                {product.ean && (
                  <div className="spec-item">
                    <span className="spec-label">EAN</span>
                    <span className="spec-value">{product.ean}</span>
                  </div>
                )}
                {product.sku && (
                  <div className="spec-item">
                    <span className="spec-label">SKU</span>
                    <span className="spec-value">{product.sku}</span>
                  </div>
                )}
                {product.category_name && (
                  <div className="spec-item">
                    <span className="spec-label">Kategória</span>
                    <span className="spec-value">{product.category_name}</span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
