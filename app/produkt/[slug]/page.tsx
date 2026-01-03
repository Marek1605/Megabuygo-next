'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api, formatPrice } from '@/lib/api'

interface Product {
  id: string
  title: string
  slug: string
  description?: string
  short_description?: string
  ean?: string
  sku?: string
  mpn?: string
  brand?: string
  image_url?: string
  gallery_images?: string[]
  category_id?: string
  category_name?: string
  category_slug?: string
  price_min: number
  price_max: number
  stock_status: string
  stock_quantity?: number
  is_active: boolean
  attributes?: Record<string, string>
  rating?: number
  review_count?: number
}

interface Offer {
  id: string
  product_id?: string
  vendor_id?: string
  vendor_name: string
  vendor_logo?: string
  vendor_rating: number
  vendor_reviews: number
  price: number
  shipping_price: number
  delivery_days: string
  stock_status: string
  stock_quantity?: number
  is_megabuy: boolean
  affiliate_url?: string
  created_at?: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [product, setProduct] = useState<Product | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)
  const [showAllOffers, setShowAllOffers] = useState(false)
  const [descExpanded, setDescExpanded] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)
  const [inCompare, setInCompare] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [slug])

  async function loadProduct() {
    setLoading(true)
    const data = await api.getProductBySlug(slug)
    if (data) {
      setProduct(data)
      // Load offers for this product
      const offersData = await api.getProductOffers(data.id)
      if (offersData) setOffers(offersData)
    }
    setLoading(false)
  }

  // Get all images
  const allImages = product ? [
    product.image_url,
    ...(product.gallery_images || [])
  ].filter(Boolean) as string[] : []

  // Winner offer (cheapest)
  const winnerOffer = offers.length > 0 ? offers[0] : null

  // Short description preview
  const shortPreview = product?.short_description || product?.description
  const previewText = shortPreview ? shortPreview.substring(0, 150) + (shortPreview.length > 150 ? '...' : '') : ''

  // Description length check
  const descText = product?.description || product?.short_description || ''
  const isLongDesc = descText.length > 600

  if (loading) {
    return (
      <div className="mp-single">
        <div className="mp-container">
          <div style={{display:'flex',justifyContent:'center',padding:100}}>
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mp-single">
        <div className="mp-container">
          <h1>Produkt nebol nájdený</h1>
          <Link href="/">Späť na úvod</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <style jsx>{`
        :root {
          --mp-primary: #ff6b35;
          --mp-primary-dark: #e55a2b;
          --mp-success: #16a34a;
          --mp-text: #1f2937;
          --mp-text-light: #6b7280;
          --mp-border: #e5e7eb;
          --mp-bg-light: #f9fafb;
        }

        .mp-single { padding: 12px 0 50px; background: #fff; }
        .mp-container { max-width: 1280px; margin: 0 auto; padding: 0 20px; }

        /* Breadcrumb */
        .mp-breadcrumb { display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 0; font-size: 12px; color: var(--mp-text-light); margin-bottom: 10px; }
        .mp-breadcrumb a { color: var(--mp-text-light); text-decoration: none; }
        .mp-breadcrumb a:hover { color: var(--mp-primary); }
        .mp-breadcrumb__sep { color: #d1d5db; }

        /* Main Layout */
        .mp-product-top { 
          display: grid; 
          grid-template-columns: 380px 1fr 380px;
          gap: 20px; 
          margin-bottom: 16px;
          align-items: start;
        }
        @media (max-width: 1200px) { .mp-product-top { grid-template-columns: 320px 1fr 340px; gap: 16px; } }
        @media (max-width: 1000px) { .mp-product-top { grid-template-columns: 280px 1fr 300px; gap: 14px; } }
        @media (max-width: 900px) { .mp-product-top { grid-template-columns: 1fr; } }

        /* Gallery */
        .mp-gallery { display: flex; gap: 8px; }
        .mp-thumbs { display: flex; flex-direction: column; gap: 5px; flex-shrink: 0; }
        @media (max-width: 900px) { 
          .mp-gallery { flex-direction: column-reverse; }
          .mp-thumbs { flex-direction: row; overflow-x: auto; } 
        }
        .mp-thumb { 
          width: 48px; height: 48px; padding: 3px; 
          border: 2px solid var(--mp-border); border-radius: 6px; 
          cursor: pointer; background: #fff; flex-shrink: 0; 
        }
        .mp-thumb:hover, .mp-thumb.active { border-color: var(--mp-primary); }
        .mp-thumb img { width: 100%; height: 100%; object-fit: contain; }

        .mp-main-img { position: relative; background: #fff; border-radius: 10px; flex: 1; }
        .mp-main-img__wrap { 
          aspect-ratio: 1; 
          display: flex; align-items: center; justify-content: center; 
          padding: 12px; max-height: 340px; cursor: zoom-in; 
        }
        .mp-main-img__img { max-width: 100%; max-height: 100%; object-fit: contain; transition: transform 0.2s; }
        .mp-main-img__wrap:hover .mp-main-img__img { transform: scale(1.03); }
        .mp-main-img__nav { 
          position: absolute; top: 50%; transform: translateY(-50%); 
          width: 28px; height: 28px; background: #fff; border: none; border-radius: 50%; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.12); cursor: pointer; 
          display: flex; align-items: center; justify-content: center; z-index: 2; 
        }
        .mp-main-img__nav:hover { background: var(--mp-primary); color: #fff; }
        .mp-main-img__nav--prev { left: 6px; }
        .mp-main-img__nav--next { right: 6px; }

        /* Info Section */
        .mp-info { display: flex; flex-direction: column; gap: 10px; }
        .mp-info__title { font-size: 17px; font-weight: 700; color: var(--mp-text); margin: 0; line-height: 1.3; }

        .mp-info__meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .mp-info__rating { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--mp-text-light); }
        .mp-stars { display: flex; gap: 1px; }
        .mp-stars svg { width: 13px; height: 13px; }
        .mp-info__reviews { color: var(--mp-primary); font-size: 12px; text-decoration: none; }
        .mp-info__reviews:hover { text-decoration: underline; }

        /* Short Description */
        .mp-short-desc { font-size: 13px; line-height: 1.5; color: var(--mp-text-light); }
        .mp-short-desc__more { color: var(--mp-primary); font-weight: 600; text-decoration: none; margin-left: 4px; }
        .mp-short-desc__more:hover { text-decoration: underline; }

        /* Action Buttons */
        .mp-product-actions { display: flex; gap: 6px; margin: 8px 0; }
        .mp-action-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 6px 10px; background: #fff; border: 1px solid var(--mp-border);
          border-radius: 6px; font-size: 11px; font-weight: 500;
          color: var(--mp-text-light); cursor: pointer; transition: all 0.2s;
        }
        .mp-action-btn svg { width: 14px; height: 14px; transition: all 0.2s; }
        .mp-action-btn:hover { border-color: var(--mp-text-light); color: var(--mp-text); }
        .mp-action-btn.active { background: #fef2f2; border-color: #fca5a5; color: #dc2626; }
        .mp-action-btn.active svg { fill: #dc2626; stroke: #dc2626; }

        /* Buy Box */
        .mp-buybox { 
          background: #fff; border-radius: 16px; padding: 16px;
          position: sticky; top: 80px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
        }
        @media (max-width: 900px) { .mp-buybox { position: static; } }

        .mp-winner { background: #fff; border-radius: 12px; padding: 14px; margin-bottom: 12px; }
        .mp-winner__badge { 
          display: inline-flex; align-items: center; gap: 4px; 
          padding: 6px 12px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #92400e; border-radius: 20px; font-size: 11px; font-weight: 700; margin-bottom: 12px;
        }
        .mp-winner__vendor { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .mp-winner__logo { 
          width: 44px; height: 44px; border-radius: 10px; 
          background: linear-gradient(135deg, var(--mp-primary) 0%, #e55a2b 100%); 
          display: flex; align-items: center; justify-content: center; 
          font-weight: 700; color: #fff; font-size: 13px;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
        }
        .mp-winner__logo img { max-width: 100%; max-height: 100%; border-radius: 8px; }
        .mp-winner__name { font-weight: 700; font-size: 15px; color: var(--mp-text); }
        .mp-winner__rating { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--mp-text-light); }
        .mp-winner__rating svg { width: 14px; height: 14px; fill: #fbbf24; }

        .mp-winner__meta { display: flex; gap: 12px; margin-bottom: 10px; font-size: 12px; color: var(--mp-text-light); }
        .mp-winner__meta svg { width: 14px; height: 14px; color: var(--mp-success); }

        .mp-winner__price-row { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
        .mp-winner__price { font-size: 28px; font-weight: 800; color: var(--mp-text); }
        .mp-winner__shipping { font-size: 13px; color: var(--mp-success); }

        /* CTA Button */
        .mp-cta { 
          width: 100%; padding: 16px 20px; border: none; border-radius: 12px; 
          font-size: 16px; font-weight: 700; cursor: pointer; 
          display: flex; align-items: center; justify-content: center; gap: 10px; 
          background: linear-gradient(135deg, var(--mp-primary) 0%, #e55a2b 100%); 
          color: #fff; box-shadow: 0 4px 14px rgba(255, 107, 53, 0.35);
          transition: all 0.2s; text-decoration: none;
        }
        .mp-cta:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255, 107, 53, 0.45); }
        .mp-cta svg { width: 20px; height: 20px; }
        .mp-megabuy-label { display: block; text-align: center; font-size: 11px; color: #9ca3af; margin-top: 6px; }
        .mp-more-offers { display: block; text-align: center; padding: 6px; color: var(--mp-primary); font-size: 12px; font-weight: 600; text-decoration: none; }
        .mp-more-offers:hover { text-decoration: underline; }

        /* Nav Tabs */
        .mp-nav { display: flex; gap: 4px; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--mp-border); overflow-x: auto; }
        .mp-nav__btn { 
          padding: 6px 12px; background: #f3f4f6; border: none; border-radius: 5px; 
          font-size: 12px; font-weight: 600; color: var(--mp-text); cursor: pointer; white-space: nowrap; 
        }
        .mp-nav__btn:hover { background: #e5e7eb; }
        .mp-nav__btn.active { background: var(--mp-primary); color: #fff; }

        /* Sections */
        .mp-section-title { font-size: 15px; font-weight: 700; color: var(--mp-text); margin: 0 0 10px; display: flex; align-items: center; gap: 8px; }
        .mp-offers-section, .mp-description, .mp-params { margin-bottom: 24px; scroll-margin-top: 70px; }

        /* Offers List */
        .mp-offers__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .mp-offers__count { font-size: 12px; color: var(--mp-text-light); }

        .mkod10-card { 
          display: grid; grid-template-columns: 2fr 0.8fr 0.8fr 1fr 1fr;
          gap: 10px; align-items: center; padding: 12px 14px;
          background: #fff; border: 1px solid var(--mp-border); border-radius: 10px;
          margin-bottom: 8px; transition: all 0.15s;
        }
        .mkod10-card:hover { border-color: var(--mp-primary); box-shadow: 0 2px 8px rgba(255, 107, 53, 0.1); }
        @media (max-width: 768px) { 
          .mkod10-card { grid-template-columns: 1fr 1fr; gap: 8px; }
        }

        .mkod10-vendor { display: flex; align-items: center; gap: 10px; }
        .mkod10-logo { 
          width: 38px; height: 38px; border-radius: 8px; 
          background: linear-gradient(135deg, var(--mp-primary) 0%, #e55a2b 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff; text-transform: lowercase;
        }
        .mkod10-logo img { width: 100%; height: 100%; object-fit: contain; border-radius: 8px; }
        .mkod10-name { font-weight: 600; font-size: 13px; color: var(--mp-text); }
        .mkod10-meta { font-size: 11px; color: var(--mp-text-light); display: flex; align-items: center; gap: 4px; }
        .mkod10-meta svg { width: 12px; height: 12px; fill: #fbbf24; }

        .mkod10-stock { font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 4px; }
        .mkod10-stock.in { color: var(--mp-success); }
        .mkod10-stock.out { color: #9ca3af; }
        .mkod10-stock svg { width: 14px; height: 14px; }

        .mkod10-delivery { font-size: 11px; color: var(--mp-text-light); display: flex; align-items: center; gap: 4px; }
        .mkod10-delivery svg { width: 14px; height: 14px; }

        .mkod10-price-col { text-align: right; }
        .mkod10-price { font-size: 16px; font-weight: 700; color: var(--mp-text); }
        .mkod10-shipping { font-size: 10px; color: var(--mp-success); }
        .mkod10-shipping.paid { color: var(--mp-text-light); }

        .mkod10-cta { 
          padding: 10px 16px; border-radius: 8px; font-size: 12px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all 0.15s; text-decoration: none; border: none;
        }
        .mkod10-cta.cart { background: linear-gradient(135deg, var(--mp-primary) 0%, #e55a2b 100%); color: #fff; }
        .mkod10-cta.affiliate { background: #f3f4f6; color: var(--mp-text); border: 1px solid var(--mp-border); }
        .mkod10-cta:hover { transform: translateY(-1px); }
        .mkod10-cta svg { width: 14px; height: 14px; }
        .mkod10-megabuy-label { font-size: 9px; color: #9ca3af; text-align: center; margin-top: 2px; }

        .mkod10-more { text-align: center; padding: 10px; }
        .mkod10-more-btn { 
          padding: 10px 20px; background: #f3f4f6; border: none; border-radius: 8px;
          font-size: 13px; font-weight: 600; color: var(--mp-text); cursor: pointer;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .mkod10-more-btn:hover { background: #e5e7eb; }
        .mkod10-more-btn svg { width: 16px; height: 16px; transition: transform 0.2s; }
        .mkod10-more-btn.expanded svg { transform: rotate(180deg); }

        /* Description */
        .mp-description__content { 
          background: #fff; border: 1px solid var(--mp-border); border-radius: 10px; 
          padding: 18px; font-size: 14px; line-height: 1.7; color: var(--mp-text); position: relative; 
        }
        .mp-description__content.collapsed { max-height: 200px; overflow: hidden; }
        .mp-description__content.collapsed::after { 
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 50px; 
          background: linear-gradient(transparent, #fff); 
        }
        .mp-description__toggle { 
          display: block; width: 100%; padding: 10px; 
          background: #f3f4f6; border: none; border-radius: 0 0 10px 10px; 
          font-size: 12px; font-weight: 600; color: var(--mp-text); cursor: pointer; margin-top: -1px; 
        }

        /* Parameters */
        .mp-params__table { 
          width: 100%; background: #fff; border: 1px solid var(--mp-border); 
          border-radius: 10px; overflow: hidden; border-collapse: collapse; font-size: 13px;
        }
        .mp-params__table tr:nth-child(even) { background: #fafafa; }
        .mp-params__table th, .mp-params__table td { padding: 10px 14px; text-align: left; }
        .mp-params__table th { font-weight: 600; color: var(--mp-text-light); width: 160px; border-right: 1px solid var(--mp-border); }

        /* Lightbox */
        .mp-lightbox { 
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
          background: rgba(0,0,0,0.9); z-index: 9999; 
          display: flex; align-items: center; justify-content: center; 
        }
        .mp-lightbox__close { 
          position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; 
          background: rgba(255,255,255,0.1); border: none; border-radius: 50%; 
          color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; 
        }
        .mp-lightbox__img { max-width: 90vw; max-height: 90vh; object-fit: contain; border-radius: 8px; }
        .mp-lightbox__nav { 
          position: absolute; top: 50%; transform: translateY(-50%); 
          width: 44px; height: 44px; background: rgba(255,255,255,0.1); 
          border: none; border-radius: 50%; color: #fff; cursor: pointer; 
        }
        .mp-lightbox__nav--prev { left: 20px; }
        .mp-lightbox__nav--next { right: 20px; }
        .mp-lightbox__counter { 
          position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); 
          color: #fff; font-size: 12px; background: rgba(0,0,0,0.5); padding: 5px 12px; border-radius: 20px; 
        }

        .spinner { width: 40px; height: 40px; border: 3px solid #f3f4f6; border-top-color: var(--mp-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="mp-single">
        <div className="mp-container">
          
          {/* Breadcrumb */}
          <nav className="mp-breadcrumb">
            <Link href="/">Domov</Link>
            <span className="mp-breadcrumb__sep">›</span>
            {product.category_name && (
              <>
                <Link href={`/kategoria/${product.category_slug}`}>{product.category_name}</Link>
                <span className="mp-breadcrumb__sep">›</span>
              </>
            )}
            <span>{product.title.length > 40 ? product.title.substring(0, 40) + '...' : product.title}</span>
          </nav>

          {/* Main Product Area */}
          <div className="mp-product-top">
            
            {/* LEFT: Gallery */}
            <div className="mp-gallery-wrapper">
              <div className="mp-gallery">
                {allImages.length > 1 && (
                  <div className="mp-thumbs">
                    {allImages.map((img, i) => (
                      <button 
                        key={i} 
                        className={`mp-thumb ${currentImage === i ? 'active' : ''}`}
                        onClick={() => setCurrentImage(i)}
                      >
                        <img src={img} alt="" />
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="mp-main-img">
                  <div className="mp-main-img__wrap" onClick={() => setLightboxOpen(true)}>
                    <img 
                      src={allImages[currentImage] || '/placeholder.png'} 
                      alt={product.title}
                      className="mp-main-img__img"
                    />
                  </div>
                  {allImages.length > 1 && (
                    <>
                      <button 
                        className="mp-main-img__nav mp-main-img__nav--prev"
                        onClick={() => setCurrentImage((currentImage - 1 + allImages.length) % allImages.length)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                      </button>
                      <button 
                        className="mp-main-img__nav mp-main-img__nav--next"
                        onClick={() => setCurrentImage((currentImage + 1) % allImages.length)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* MIDDLE: Info */}
            <div className="mp-info">
              <h1 className="mp-info__title">{product.title}</h1>
              
              {(product.rating || product.review_count) && (
                <div className="mp-info__meta">
                  {product.rating && (
                    <div className="mp-info__rating">
                      <div className="mp-stars">
                        {[1,2,3,4,5].map(i => (
                          <svg key={i} viewBox="0 0 24 24" fill={i <= Math.round(product.rating || 0) ? '#fbbf24' : '#e5e7eb'}>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                      {product.rating?.toFixed(1)}
                    </div>
                  )}
                  {product.review_count && (
                    <a href="#recenzie" className="mp-info__reviews">({product.review_count} hodnotení)</a>
                  )}
                </div>
              )}

              {/* Short Description */}
              {previewText && (
                <div className="mp-short-desc">
                  {previewText}
                  <a href="#popis" className="mp-short-desc__more">Zobraziť viac →</a>
                </div>
              )}

              {/* Product Meta */}
              <div style={{fontSize:12, color:'#6b7280', display:'flex', gap:16, flexWrap:'wrap', marginTop:8}}>
                {product.ean && <span>EAN: {product.ean}</span>}
                {product.sku && <span>SKU: {product.sku}</span>}
                {product.brand && <span>Značka: {product.brand}</span>}
              </div>

              {/* Action Buttons */}
              <div className="mp-product-actions">
                <button 
                  className={`mp-action-btn ${inWishlist ? 'active' : ''}`}
                  onClick={() => setInWishlist(!inWishlist)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <span>{inWishlist ? 'V obľúbených' : 'Pridať do obľúbených'}</span>
                </button>
                <button 
                  className={`mp-action-btn ${inCompare ? 'active' : ''}`}
                  onClick={() => setInCompare(!inCompare)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                  <span>{inCompare ? 'V porovnaní' : 'Porovnať'}</span>
                </button>
              </div>
            </div>

            {/* RIGHT: Buy Box */}
            <div className="mp-buybox">
              <div className="mp-winner">
                <div className="mp-winner__badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                  Najlepšia ponuka
                </div>
                
                <div className="mp-winner__vendor">
                  <div className="mp-winner__logo">
                    {winnerOffer?.vendor_logo ? (
                      <img src={winnerOffer.vendor_logo} alt="" />
                    ) : (
                      'MB'
                    )}
                  </div>
                  <div>
                    <div className="mp-winner__name">{winnerOffer?.vendor_name || 'MegaBuy.sk'}</div>
                    <div className="mp-winner__rating">
                      <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      {winnerOffer?.vendor_rating?.toFixed(1) || '4.8'} ({winnerOffer?.vendor_reviews || 1250})
                    </div>
                  </div>
                </div>

                <div className="mp-winner__meta">
                  <span style={{display:'flex', alignItems:'center', gap:4, color:'#16a34a'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {product.stock_status === 'instock' ? 'Skladom' : 'Na objednávku'}
                  </span>
                  <span style={{display:'flex', alignItems:'center', gap:4}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    {winnerOffer?.delivery_days || '1-2'} dni
                  </span>
                </div>

                <div className="mp-winner__price-row">
                  <span className="mp-winner__price">{formatPrice(winnerOffer?.price || product.price_min)}</span>
                  <span className="mp-winner__shipping">
                    {(winnerOffer?.shipping_price || 0) > 0 
                      ? `+ ${formatPrice(winnerOffer?.shipping_price || 0)} doprava`
                      : '✓ Doprava zdarma'
                    }
                  </span>
                </div>
              </div>

              <button className="mp-cta">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Do košíka
              </button>
              <span className="mp-megabuy-label">Predaj cez MegaBuy</span>

              {offers.length > 1 && (
                <a href="#ponuky" className="mp-more-offers">
                  Zobraziť všetkých {offers.length} ponúk →
                </a>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="mp-nav">
            <a href="#ponuky" className="mp-nav__btn active">Ponuky ({offers.length || 1})</a>
            <a href="#popis" className="mp-nav__btn">Popis</a>
            <a href="#parametre" className="mp-nav__btn">Parametre</a>
          </nav>

          {/* Offers Section */}
          <section className="mp-offers-section" id="ponuky">
            <div className="mp-offers__header">
              <h2 className="mp-section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                Ponuky predajcov
              </h2>
              <span className="mp-offers__count">{offers.length || 1} {offers.length === 1 ? 'ponuka' : 'ponúk'}</span>
            </div>

            <div className="mkod10-list">
              {(offers.length > 0 ? offers : [{
                id: '1',
                vendor_name: 'MegaBuy.sk',
                vendor_rating: 4.8,
                vendor_reviews: 1250,
                price: product.price_min,
                shipping_price: product.price_min >= 49 ? 0 : 2.99,
                delivery_days: '1-2',
                stock_status: product.stock_status,
                is_megabuy: true
              }]).slice(0, showAllOffers ? undefined : 3).map((offer, index) => (
                <div key={offer.id || index} className="mkod10-card">
                  <div className="mkod10-vendor">
                    <div className="mkod10-logo">
                      {offer.vendor_logo ? (
                        <img src={offer.vendor_logo} alt="" />
                      ) : (
                        offer.vendor_name?.substring(0, 2).toLowerCase() || 'mb'
                      )}
                    </div>
                    <div>
                      <div className="mkod10-name">{offer.vendor_name}</div>
                      <div className="mkod10-meta">
                        <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        {offer.vendor_rating?.toFixed(1)} ({offer.vendor_reviews})
                      </div>
                    </div>
                  </div>

                  <div className={`mkod10-stock ${offer.stock_status === 'instock' ? 'in' : 'out'}`}>
                    {offer.stock_status === 'instock' ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        Skladom
                      </>
                    ) : 'Na obj.'}
                  </div>

                  <div className="mkod10-delivery">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    {offer.delivery_days} dni
                  </div>

                  <div className="mkod10-price-col">
                    <div className="mkod10-price">{formatPrice(offer.price)}</div>
                    <div className={`mkod10-shipping ${offer.shipping_price > 0 ? 'paid' : ''}`}>
                      {offer.shipping_price > 0 ? `+ ${formatPrice(offer.shipping_price)} doprava` : 'Doprava zdarma'}
                    </div>
                  </div>

                  <div>
                    {offer.is_megabuy ? (
                      <>
                        <button className="mkod10-cta cart">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                          Do košíka
                        </button>
                        <div className="mkod10-megabuy-label">Predaj cez MegaBuy</div>
                      </>
                    ) : (
                      <a href={offer.affiliate_url} target="_blank" rel="nofollow noopener" className="mkod10-cta affiliate">
                        Do obchodu
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {offers.length > 3 && (
              <div className="mkod10-more">
                <button 
                  className={`mkod10-more-btn ${showAllOffers ? 'expanded' : ''}`}
                  onClick={() => setShowAllOffers(!showAllOffers)}
                >
                  {showAllOffers ? 'Skryť' : `Zobraziť ďalších ${offers.length - 3}`}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>
            )}
          </section>

          {/* Description Section */}
          <section className="mp-description" id="popis">
            <h2 className="mp-section-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
              Popis produktu
            </h2>
            <div className={`mp-description__content ${!descExpanded && isLongDesc ? 'collapsed' : ''}`}>
              <div dangerouslySetInnerHTML={{ __html: descText || 'Popis produktu nie je k dispozícii.' }} />
            </div>
            {isLongDesc && (
              <button className="mp-description__toggle" onClick={() => setDescExpanded(!descExpanded)}>
                {descExpanded ? 'Skryť' : 'Zobraziť viac'}
              </button>
            )}
          </section>

          {/* Parameters Section */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <section className="mp-params" id="parametre">
              <h2 className="mp-section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
                Parametre
              </h2>
              <table className="mp-params__table">
                <tbody>
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <tr key={key}>
                      <th>{key}</th>
                      <td>{value}</td>
                    </tr>
                  ))}
                  {product.ean && <tr><th>EAN</th><td>{product.ean}</td></tr>}
                  {product.sku && <tr><th>SKU</th><td>{product.sku}</td></tr>}
                  {product.brand && <tr><th>Značka</th><td>{product.brand}</td></tr>}
                </tbody>
              </table>
            </section>
          )}

        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="mp-lightbox" onClick={() => setLightboxOpen(false)}>
          <button className="mp-lightbox__close" onClick={() => setLightboxOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <button 
            className="mp-lightbox__nav mp-lightbox__nav--prev"
            onClick={(e) => { e.stopPropagation(); setCurrentImage((currentImage - 1 + allImages.length) % allImages.length); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <img src={allImages[currentImage]} alt="" className="mp-lightbox__img" onClick={(e) => e.stopPropagation()} />
          <button 
            className="mp-lightbox__nav mp-lightbox__nav--next"
            onClick={(e) => { e.stopPropagation(); setCurrentImage((currentImage + 1) % allImages.length); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <div className="mp-lightbox__counter">{currentImage + 1} / {allImages.length}</div>
        </div>
      )}
    </>
  )
}
