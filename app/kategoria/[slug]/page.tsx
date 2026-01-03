'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/theme/Header'
import { Footer } from '@/components/theme/Footer'
import { api, formatPrice } from '@/lib/api'
import type { Product, Category } from '@/lib/types'

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<(Category & { children: Category[] })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [slug])

  async function loadData() {
    setLoading(true)
    const [cat, prods, cats] = await Promise.all([
      api.getCategoryBySlug(slug),
      api.getProductsByCategory(slug),
      api.getCategoriesTree()
    ])
    setCategory(cat)
    setProducts(prods || [])
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

  if (!category) {
    return (
      <>
        <Header categories={categories} />
        <div style={{padding: '100px 20px', textAlign: 'center'}}>
          <h1>Kategória nebola nájdená</h1>
          <Link href="/" style={{color: '#ff6b35'}}>← Späť na hlavnú stránku</Link>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <style jsx global>{`
        .category-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 30px 20px;
        }
        .category-breadcrumb {
          display: flex;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 20px;
        }
        .category-breadcrumb a {
          color: #6b7280;
        }
        .category-breadcrumb a:hover {
          color: #ff6b35;
        }
        .category-header {
          margin-bottom: 40px;
        }
        .category-title {
          font-size: 32px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .category-emoji {
          font-size: 36px;
        }
        .category-desc {
          color: #6b7280;
          font-size: 16px;
        }
        .category-count {
          color: #9ca3af;
          font-size: 14px;
          margin-top: 8px;
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .product-card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          text-decoration: none;
          transition: all 0.3s;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.1);
        }
        .product-image {
          aspect-ratio: 1;
          background: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .product-image .placeholder {
          font-size: 60px;
        }
        .product-info {
          padding: 16px;
        }
        .product-category {
          font-size: 12px;
          color: #ff6b35;
          font-weight: 500;
          margin-bottom: 4px;
        }
        .product-title {
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
        }
        .product-price {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
        }
        .product-stock {
          display: inline-block;
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 10px;
          margin-top: 8px;
        }
        .product-stock.instock {
          background: #dcfce7;
          color: #16a34a;
        }
        .product-stock.outofstock {
          background: #fee2e2;
          color: #dc2626;
        }
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: #f9fafb;
          border-radius: 16px;
        }
        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }
        .empty-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }
        .empty-desc {
          color: #6b7280;
        }
        @media (max-width: 1100px) {
          .products-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
        }
        @media (max-width: 480px) {
          .products-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Header categories={categories} />

      <main className="category-page">
        <div className="category-breadcrumb">
          <Link href="/">Domov</Link>
          <span>/</span>
          <span>{category.name}</span>
        </div>

        <div className="category-header">
          <h1 className="category-title">
            {(category as any).emoji && <span className="category-emoji">{(category as any).emoji}</span>}
            {category.name}
          </h1>
          {category.description && (
            <p className="category-desc">{category.description}</p>
          )}
          <p className="category-count">{products.length} produktov</p>
        </div>

        {products.length > 0 ? (
          <div className="products-grid">
            {products.map(product => (
              <Link key={product.id} href={`/produkt/${product.slug}`} className="product-card">
                <div className="product-image">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.title} />
                  ) : (
                    <span className="placeholder">📦</span>
                  )}
                </div>
                <div className="product-info">
                  {product.category_name && (
                    <div className="product-category">{product.category_name}</div>
                  )}
                  <h3 className="product-title">{product.title}</h3>
                  <div className="product-price">{formatPrice(product.price_min)}</div>
                  <span className={`product-stock ${product.stock_status}`}>
                    {product.stock_status === 'instock' ? '✓ Skladom' : product.stock_status === 'outofstock' ? '✕ Nedostupné' : '⏳ Na objednávku'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h2 className="empty-title">Žiadne produkty</h2>
            <p className="empty-desc">V tejto kategórii zatiaľ nie sú žiadne produkty.</p>
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}
