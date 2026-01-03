'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/theme/Header'
import { Footer } from '@/components/theme/Footer'
import { api, formatPrice } from '@/lib/api'
import type { Product, Category } from '@/lib/types'

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<(Category & { children: Category[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    loadData()
  }, [slug])

  async function loadData() {
    setLoading(true)
    const [prod, cats] = await Promise.all([
      api.getProductBySlug(slug),
      api.getCategoriesTree()
    ])
    setProduct(prod as any)
    setCategories(cats || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <>
        <Header categories={categories} />
        <div style={{padding: '100px 20px', textAlign: 'center'}}>
          <p>Načítavam...</p>
        </div>
        <Footer />
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Header categories={categories} />
        <div style={{padding: '100px 20px', textAlign: 'center'}}>
          <h1>Produkt nebol nájdený</h1>
          <Link href="/" style={{color: '#ff6b35'}}>← Späť na hlavnú stránku</Link>
        </div>
        <Footer />
      </>
    )
  }

  const images = (product as any).images || []
  const mainImage = images[activeImage]?.url || product.image_url

  return (
    <>
      <style jsx global>{`
        .product-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 30px 20px;
        }
        .product-breadcrumb {
          display: flex;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 30px;
        }
        .product-breadcrumb a {
          color: #6b7280;
        }
        .product-breadcrumb a:hover {
          color: #ff6b35;
        }
        .product-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 50px;
        }
        .product-gallery {
          position: sticky;
          top: 100px;
        }
        .product-main-image {
          aspect-ratio: 1;
          background: #f9fafb;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .product-main-image img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .product-main-image .placeholder {
          font-size: 120px;
        }
        .product-thumbnails {
          display: flex;
          gap: 12px;
          overflow-x: auto;
        }
        .product-thumbnail {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          background: #f9fafb;
          border: 2px solid transparent;
          cursor: pointer;
          overflow: hidden;
          flex-shrink: 0;
        }
        .product-thumbnail.active {
          border-color: #ff6b35;
        }
        .product-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .product-info {
          padding-top: 10px;
        }
        .product-category-tag {
          display: inline-block;
          font-size: 13px;
          color: #ff6b35;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .product-title {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 16px;
          line-height: 1.2;
        }
        .product-brand {
          font-size: 15px;
          color: #6b7280;
          margin-bottom: 20px;
        }
        .product-price-box {
          background: #fff5f0;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .product-price-label {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 4px;
        }
        .product-price {
          font-size: 36px;
          font-weight: 800;
          color: #ff6b35;
        }
        .product-price-range {
          font-size: 16px;
          color: #9ca3af;
          font-weight: 400;
        }
        .product-stock {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          margin-top: 12px;
        }
        .product-stock.instock {
          background: #dcfce7;
          color: #16a34a;
        }
        .product-stock.outofstock {
          background: #fee2e2;
          color: #dc2626;
        }
        .product-codes {
          display: flex;
          gap: 20px;
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 24px;
        }
        .product-description {
          margin-bottom: 30px;
        }
        .product-description h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 12px;
        }
        .product-description p {
          color: #4b5563;
          line-height: 1.7;
        }
        .product-attributes {
          background: #f9fafb;
          border-radius: 12px;
          overflow: hidden;
        }
        .product-attribute {
          display: flex;
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
        }
        .product-attribute:last-child {
          border-bottom: none;
        }
        .product-attribute-name {
          width: 40%;
          color: #6b7280;
          font-size: 14px;
        }
        .product-attribute-value {
          flex: 1;
          font-weight: 500;
          color: #1f2937;
          font-size: 14px;
        }
        @media (max-width: 900px) {
          .product-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          .product-gallery {
            position: static;
          }
        }
      `}</style>

      <Header categories={categories} />

      <main className="product-page">
        <div className="product-breadcrumb">
          <Link href="/">Domov</Link>
          <span>/</span>
          {product.category_name && (
            <>
              <Link href={`/kategoria/${(product as any).category_id}`}>{product.category_name}</Link>
              <span>/</span>
            </>
          )}
          <span>{product.title}</span>
        </div>

        <div className="product-grid">
          <div className="product-gallery">
            <div className="product-main-image">
              {mainImage ? (
                <img src={mainImage} alt={product.title} />
              ) : (
                <span className="placeholder">📦</span>
              )}
            </div>
            {images.length > 1 && (
              <div className="product-thumbnails">
                {images.map((img: any, index: number) => (
                  <div
                    key={img.id || index}
                    className={`product-thumbnail ${index === activeImage ? 'active' : ''}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={img.url} alt="" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            {product.category_name && (
              <span className="product-category-tag">{product.category_name}</span>
            )}
            <h1 className="product-title">{product.title}</h1>
            
            {product.brand_name && (
              <div className="product-brand">Značka: <strong>{product.brand_name}</strong></div>
            )}

            <div className="product-codes">
              {product.ean && <span>EAN: {product.ean}</span>}
              {product.sku && <span>SKU: {product.sku}</span>}
              {product.mpn && <span>MPN: {product.mpn}</span>}
            </div>

            <div className="product-price-box">
              <div className="product-price-label">Cena od</div>
              <div className="product-price">
                {formatPrice(product.price_min)}
                {product.price_max > product.price_min && (
                  <span className="product-price-range"> – {formatPrice(product.price_max)}</span>
                )}
              </div>
              <div className={`product-stock ${product.stock_status}`}>
                {product.stock_status === 'instock' ? '✓ Skladom' : product.stock_status === 'outofstock' ? '✕ Nedostupné' : '⏳ Na objednávku'}
              </div>
            </div>

            {product.short_description && (
              <div className="product-description">
                <h3>Popis</h3>
                <p>{product.short_description}</p>
              </div>
            )}

            {product.description && (
              <div className="product-description">
                <h3>Detailný popis</h3>
                <p>{product.description}</p>
              </div>
            )}

            {(product as any).attributes && (product as any).attributes.length > 0 && (
              <div className="product-attributes">
                {(product as any).attributes.map((attr: any, index: number) => (
                  <div key={index} className="product-attribute">
                    <span className="product-attribute-name">{attr.name}</span>
                    <span className="product-attribute-value">{attr.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
