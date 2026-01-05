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
  image_url?: string
  price_min: number
  price_max: number
  brand?: string
  stock_status?: string
}

interface Category {
  id: string
  name: string
  slug: string
  parent_id?: string
  product_count?: number
  subcategories?: Category[]
}

interface Facets {
  brands?: { name: string; count: number }[]
  price_range?: { min: number; max: number }
}

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [facets, setFacets] = useState<Facets>({})
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const [filters, setFilters] = useState({
    min_price: '',
    max_price: '',
    brands: [] as string[],
    sort: 'popular',
    in_stock: false
  })

  const [collapsed, setCollapsed] = useState<{ [key: string]: boolean }>({})
  const limit = 24

  useEffect(() => {
    if (slug) {
      loadCategory()
    }
  }, [slug])

  useEffect(() => {
    if (slug) loadProducts()
  }, [slug, page, filters])

  async function loadCategory() {
    const cat = await api.getCategoryBySlug(slug)
    if (cat) setCategory(cat)
  }

  async function loadProducts() {
    setLoading(true)
    const p: any = { page, limit, category: slug }
    if (filters.min_price) p.min_price = filters.min_price
    if (filters.max_price) p.max_price = filters.max_price
    if (filters.brands.length > 0) p.brand = filters.brands.join(',')
    if (filters.sort) p.sort = filters.sort
    if (filters.in_stock) p.in_stock = 'true'
    
    const data = await api.getProducts(p)
    if (data) {
      setProducts(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.total_pages || 1)
      if (data.facets) setFacets(data.facets)
    }
    setLoading(false)
  }

  function toggleBrand(brand: string) {
    setFilters(f => ({
      ...f,
      brands: f.brands.includes(brand) 
        ? f.brands.filter(b => b !== brand)
        : [...f.brands, brand]
    }))
    setPage(1)
  }

  function clearFilters() {
    setFilters({ min_price: '', max_price: '', brands: [], sort: 'popular', in_stock: false })
    setPage(1)
  }

  const activeFilterCount = (filters.min_price ? 1 : 0) + (filters.max_price ? 1 : 0) + filters.brands.length + (filters.in_stock ? 1 : 0)

  return (
    <>
      <style jsx global>{`
        .category-page { min-height: 100vh; background: #f8f9fa; }
        .category-container { max-width: 1400px; margin: 0 auto; padding: 24px; display: flex; gap: 24px; }
        
        /* Sidebar */
        .category-sidebar { width: 280px; flex-shrink: 0; }
        .filter-card { background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); position: sticky; top: 24px; }
        .filter-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #eee; }
        .filter-title { font-size: 18px; font-weight: 700; color: #1f2937; display: flex; align-items: center; gap: 8px; }
        .filter-count { background: #c9a87c; color: #fff; font-size: 12px; padding: 2px 8px; border-radius: 10px; }
        .filter-clear { color: #c9a87c; font-size: 13px; cursor: pointer; border: none; background: none; }
        .filter-clear:hover { text-decoration: underline; }
        
        .filter-section { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #f0f0f0; }
        .filter-section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .filter-section-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 8px 0; }
        .filter-section-title { font-weight: 600; color: #374151; font-size: 14px; }
        .filter-toggle { color: #9ca3af; font-size: 18px; }
        
        .price-inputs { display: flex; gap: 8px; margin-top: 12px; }
        .price-input { flex: 1; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; }
        .price-input:focus { outline: none; border-color: #c9a87c; }
        .price-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .price-pill { padding: 6px 12px; background: #f3f4f6; border: none; border-radius: 20px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
        .price-pill:hover { background: #c9a87c; color: #fff; }
        
        .stock-checkbox { display: flex; align-items: center; gap: 10px; margin-top: 12px; cursor: pointer; }
        .stock-checkbox input { width: 18px; height: 18px; accent-color: #c9a87c; }
        
        .brand-list { max-height: 200px; overflow-y: auto; margin-top: 12px; }
        .brand-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; cursor: pointer; }
        .brand-item input { width: 16px; height: 16px; accent-color: #c9a87c; }
        .brand-name { flex: 1; font-size: 14px; color: #374151; }
        .brand-count { color: #9ca3af; font-size: 12px; }
        
        /* Main content */
        .category-main { flex: 1; min-width: 0; }
        .category-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .category-title { font-size: 28px; font-weight: 700; color: #1f2937; }
        .category-count { color: #6b7280; font-size: 14px; margin-top: 4px; }
        
        .sort-select { padding: 10px 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; background: #fff; min-width: 180px; }
        .sort-select:focus { outline: none; border-color: #c9a87c; }
        
        /* Subcategories */
        .subcategories { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .subcat-card { background: #fff; border-radius: 12px; padding: 16px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: all 0.2s; text-decoration: none; }
        .subcat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .subcat-name { font-weight: 600; color: #1f2937; font-size: 14px; }
        .subcat-count { color: #6b7280; font-size: 12px; margin-top: 4px; }
        
        /* Products grid */
        .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
        .product-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: all 0.2s; text-decoration: none; }
        .product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .product-image { aspect-ratio: 1; background: #f8f9fa; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .product-image img { max-width: 100%; max-height: 100%; object-fit: contain; padding: 16px; transition: transform 0.3s; }
        .product-card:hover .product-image img { transform: scale(1.05); }
        .product-info { padding: 16px; }
        .product-title { font-size: 14px; font-weight: 500; color: #1f2937; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 40px; }
        .product-brand { font-size: 12px; color: #6b7280; margin-top: 4px; }
        .product-price { font-size: 18px; font-weight: 700; color: #c9a87c; margin-top: 8px; }
        
        /* Loading & empty */
        .loading, .empty { text-align: center; padding: 60px 20px; color: #6b7280; }
        .loading-spinner { width: 40px; height: 40px; border: 3px solid #f3f4f6; border-top-color: #c9a87c; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        /* Pagination */
        .pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin-top: 40px; }
        .page-btn { padding: 12px 24px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .page-btn:hover:not(:disabled) { border-color: #c9a87c; color: #c9a87c; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .page-info { color: #6b7280; font-size: 14px; }
        
        /* Mobile */
        @media (max-width: 768px) {
          .category-container { flex-direction: column; padding: 16px; }
          .category-sidebar { width: 100%; }
          .filter-card { position: static; }
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .category-header { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
      `}</style>
      
      <div className="category-page">
        <Header />
        <div className="category-container">
          {/* Sidebar */}
          <aside className="category-sidebar">
            <div className="filter-card">
              <div className="filter-header">
                <div className="filter-title">
                  Filtre
                  {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
                </div>
                {activeFilterCount > 0 && (
                  <button className="filter-clear" onClick={clearFilters}>Zrušiť všetky</button>
                )}
              </div>

              {/* Price */}
              <div className="filter-section">
                <div className="filter-section-header" onClick={() => setCollapsed({...collapsed, price: !collapsed.price})}>
                  <span className="filter-section-title">Cena</span>
                  <span className="filter-toggle">{collapsed.price ? '+' : '−'}</span>
                </div>
                {!collapsed.price && (
                  <>
                    <div className="price-inputs">
                      <input 
                        type="number" 
                        className="price-input" 
                        placeholder="Od €" 
                        value={filters.min_price}
                        onChange={e => { setFilters({...filters, min_price: e.target.value}); setPage(1) }}
                      />
                      <input 
                        type="number" 
                        className="price-input" 
                        placeholder="Do €" 
                        value={filters.max_price}
                        onChange={e => { setFilters({...filters, max_price: e.target.value}); setPage(1) }}
                      />
                    </div>
                    <div className="price-pills">
                      {['50', '100', '200', '500'].map(p => (
                        <button key={p} className="price-pill" onClick={() => { setFilters({...filters, max_price: p}); setPage(1) }}>
                          do {p} €
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Stock */}
              <div className="filter-section">
                <label className="stock-checkbox">
                  <input 
                    type="checkbox" 
                    checked={filters.in_stock}
                    onChange={e => { setFilters({...filters, in_stock: e.target.checked}); setPage(1) }}
                  />
                  <span>Len skladom</span>
                </label>
              </div>

              {/* Brands */}
              {facets.brands && facets.brands.length > 0 && (
                <div className="filter-section">
                  <div className="filter-section-header" onClick={() => setCollapsed({...collapsed, brands: !collapsed.brands})}>
                    <span className="filter-section-title">Značka</span>
                    <span className="filter-toggle">{collapsed.brands ? '+' : '−'}</span>
                  </div>
                  {!collapsed.brands && (
                    <div className="brand-list">
                      {facets.brands.map(b => (
                        <label key={b.name} className="brand-item">
                          <input 
                            type="checkbox" 
                            checked={filters.brands.includes(b.name)}
                            onChange={() => toggleBrand(b.name)}
                          />
                          <span className="brand-name">{b.name}</span>
                          <span className="brand-count">{b.count}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Main */}
          <main className="category-main">
            <div className="category-header">
              <div>
                <h1 className="category-title">{category?.name || 'Kategória'}</h1>
                <div className="category-count">{total} produktov</div>
              </div>
              <select 
                className="sort-select" 
                value={filters.sort}
                onChange={e => { setFilters({...filters, sort: e.target.value}); setPage(1) }}
              >
                <option value="popular">Najpredávanejšie</option>
                <option value="price_asc">Cena vzostupne</option>
                <option value="price_desc">Cena zostupne</option>
                <option value="newest">Najnovšie</option>
                <option value="name_asc">Názov A-Z</option>
              </select>
            </div>

            {/* Subcategories */}
            {category?.subcategories && category.subcategories.length > 0 && (
              <div className="subcategories">
                {category.subcategories.map(sub => (
                  <Link key={sub.id} href={`/kategoria/${sub.slug}`} className="subcat-card">
                    <div className="subcat-name">{sub.name}</div>
                    <div className="subcat-count">{sub.product_count} produktov</div>
                  </Link>
                ))}
              </div>
            )}

            {/* Products */}
            {loading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <div>Načítavam produkty...</div>
              </div>
            ) : products.length === 0 ? (
              <div className="empty">
                <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
                <div>Žiadne produkty v tejto kategórii</div>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map(p => (
                    <Link key={p.id} href={`/produkt/${p.slug}`} className="product-card">
                      <div className="product-image">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.title} />
                        ) : (
                          <span style={{ color: '#ccc', fontSize: 48 }}>📷</span>
                        )}
                      </div>
                      <div className="product-info">
                        <div className="product-title">{p.title}</div>
                        {p.brand && <div className="product-brand">{p.brand}</div>}
                        <div className="product-price">{formatPrice(p.price_min)}</div>
                      </div>
                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      className="page-btn" 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      ← Predchádzajúca
                    </button>
                    <span className="page-info">{page} / {totalPages}</span>
                    <button 
                      className="page-btn"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Ďalšia →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
        <Footer />
      </div>
    </>
  )
}
