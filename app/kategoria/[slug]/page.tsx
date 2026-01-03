'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
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
  category_name?: string
  offer_count?: number
}

interface Category {
  id: string
  name: string
  slug: string
  parent_id?: string
  product_count?: number
  children?: Category[]
}

interface FilterState {
  min_price: string
  max_price: string
  brands: string[]
  sort: string
  in_stock: boolean
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [category, setCategory] = useState<Category | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [brands, setBrands] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 })
  
  const [filters, setFilters] = useState<FilterState>({
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    brands: searchParams.get('brand')?.split(',').filter(Boolean) || [],
    sort: searchParams.get('sort') || 'popular',
    in_stock: searchParams.get('in_stock') === 'true'
  })

  const limit = 24

  useEffect(() => {
    loadCategory()
    loadCategories()
  }, [slug])

  useEffect(() => {
    if (category) {
      loadProducts()
    }
  }, [category, page, filters])

  async function loadCategory() {
    const cat = await api.getCategoryBySlug(slug)
    if (cat) {
      setCategory(cat)
      // Load subcategories
      const allCats = await api.getCategoriesFlat()
      if (allCats && Array.isArray(allCats)) {
        const subs = allCats.filter((c: Category) => c.parent_id === cat.id)
        setSubcategories(subs)
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

  async function loadProducts() {
    if (!category) return
    
    setLoading(true)
    const params: any = { 
      page, 
      limit,
      category: slug
    }
    
    if (filters.min_price) params.min_price = filters.min_price
    if (filters.max_price) params.max_price = filters.max_price
    if (filters.brands.length > 0) params.brand = filters.brands.join(',')
    if (filters.sort) params.sort = filters.sort
    
    const data = await api.getProducts(params)
    if (data) {
      setProducts(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.total_pages || 1)
      
      // Extract unique brands from products
      const uniqueBrands = Array.from(new Set((data.items || []).map((p: Product) => p.brand).filter(Boolean))]
      setBrands(uniqueBrands as string[])
    }
    setLoading(false)
  }

  function applyFilters() {
    setPage(1)
    loadProducts()
  }

  function clearFilters() {
    setFilters({
      min_price: '',
      max_price: '',
      brands: [],
      sort: 'popular',
      in_stock: false
    })
    setPage(1)
  }

  function toggleBrand(brand: string) {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }))
  }

  if (!category && !loading) {
    return (
      <>
        <Header categories={categories} />
        <main style={{ padding: '100px 20px', textAlign: 'center', minHeight: '60vh' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>Kategória nebola nájdená</h1>
          <Link href="/" style={{ color: '#ff6b35' }}>← Späť na hlavnú stránku</Link>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <style jsx global>{`
        .cat-page { background: #f8fafc; min-height: 100vh; }
        .cat-container { max-width: 1400px; margin: 0 auto; padding: 0 20px; }
        
        /* Breadcrumb */
        .breadcrumb { display: flex; align-items: center; gap: 8px; padding: 16px 0; font-size: 14px; color: #6b7280; }
        .breadcrumb a { color: #6b7280; text-decoration: none; }
        .breadcrumb a:hover { color: #ff6b35; }
        .breadcrumb-sep { color: #d1d5db; }
        .breadcrumb-current { color: #1f2937; font-weight: 500; }
        
        /* Header */
        .cat-header { margin-bottom: 24px; }
        .cat-title { font-size: 28px; font-weight: 700; color: #1f2937; margin: 0 0 8px; }
        .cat-count { font-size: 14px; color: #6b7280; }
        
        /* Subcategories */
        .subcats { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 32px; }
        .subcat-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; text-decoration: none; transition: all 0.2s; }
        .subcat-card:hover { border-color: #ff6b35; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .subcat-icon { font-size: 24px; }
        .subcat-name { font-size: 14px; font-weight: 600; color: #1f2937; }
        .subcat-card:hover .subcat-name { color: #ff6b35; }
        .subcat-count { font-size: 12px; color: #6b7280; }
        
        /* Layout */
        .cat-layout { display: grid; grid-template-columns: 280px 1fr; gap: 24px; }
        @media (max-width: 992px) { .cat-layout { grid-template-columns: 1fr; } }
        
        /* Sidebar Filters */
        .filters-sidebar { background: #fff; border-radius: 16px; padding: 24px; height: fit-content; position: sticky; top: 20px; }
        .filters-title { font-size: 18px; font-weight: 700; color: #1f2937; margin: 0 0 20px; display: flex; align-items: center; gap: 8px; }
        .filter-section { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e5e7eb; }
        .filter-section:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
        .filter-label { font-size: 14px; font-weight: 600; color: #1f2937; margin-bottom: 12px; display: block; }
        
        /* Price Filter */
        .price-inputs { display: flex; gap: 12px; align-items: center; }
        .price-input { flex: 1; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; }
        .price-input:focus { outline: none; border-color: #ff6b35; }
        .price-sep { color: #9ca3af; }
        
        /* Brand Filter */
        .brand-list { max-height: 200px; overflow-y: auto; }
        .brand-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; cursor: pointer; }
        .brand-checkbox { width: 18px; height: 18px; border: 2px solid #d1d5db; border-radius: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .brand-checkbox.checked { background: #ff6b35; border-color: #ff6b35; }
        .brand-checkbox.checked::after { content: '✓'; color: #fff; font-size: 12px; }
        .brand-name { font-size: 14px; color: #374151; }
        .brand-count { font-size: 12px; color: #9ca3af; margin-left: auto; }
        
        /* Filter Buttons */
        .filter-buttons { display: flex; gap: 12px; margin-top: 20px; }
        .filter-btn { flex: 1; padding: 12px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .filter-btn-primary { background: #ff6b35; color: #fff; border: none; }
        .filter-btn-primary:hover { background: #e55a2b; }
        .filter-btn-secondary { background: #fff; color: #6b7280; border: 1px solid #e5e7eb; }
        .filter-btn-secondary:hover { border-color: #ff6b35; color: #ff6b35; }
        
        /* Mobile Filter Toggle */
        .mobile-filter-toggle { display: none; padding: 12px 20px; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 16px; }
        @media (max-width: 992px) { 
          .mobile-filter-toggle { display: flex; align-items: center; gap: 8px; }
          .filters-sidebar { display: none; }
          .filters-sidebar.show { display: block; position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1000; border-radius: 0; overflow-y: auto; }
          .filters-close { display: block; position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 24px; cursor: pointer; }
        }
        
        /* Products Area */
        .products-area { }
        
        /* Toolbar */
        .products-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 16px 20px; background: #fff; border-radius: 12px; }
        .toolbar-count { font-size: 14px; color: #6b7280; }
        .toolbar-sort { display: flex; align-items: center; gap: 12px; }
        .sort-label { font-size: 14px; color: #6b7280; }
        .sort-select { padding: 8px 32px 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L2 4h8z'/%3E%3C/svg%3E") no-repeat right 12px center; appearance: none; cursor: pointer; }
        
        /* Products Grid */
        .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
        
        /* Product Card */
        .product-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: all 0.3s; }
        .product-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.12); transform: translateY(-6px); }
        .product-img-wrap { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; padding: 20px; background: #f9fafb; }
        .product-img { max-width: 85%; max-height: 160px; object-fit: contain; transition: transform 0.3s; }
        .product-card:hover .product-img { transform: scale(1.05); }
        .product-img-placeholder { font-size: 60px; opacity: 0.3; }
        .product-content { padding: 16px 18px 20px; }
        .product-brand { font-size: 12px; color: #ff6b35; font-weight: 500; margin-bottom: 4px; }
        .product-title { font-size: 14px; font-weight: 600; color: #1f2937; margin: 0 0 12px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 40px; }
        .product-title a { color: inherit; text-decoration: none; }
        .product-title a:hover { color: #ff6b35; }
        .product-price { font-size: 20px; font-weight: 700; color: #1f2937; margin-bottom: 4px; }
        .product-offers { font-size: 12px; color: #6b7280; }
        .product-offers strong { color: #4a6f8a; }
        
        /* Pagination */
        .pagination { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 40px; }
        .page-btn { padding: 10px 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .page-btn:hover { border-color: #ff6b35; color: #ff6b35; }
        .page-btn.active { background: #ff6b35; color: #fff; border-color: #ff6b35; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        /* Empty State */
        .empty-state { text-align: center; padding: 60px 20px; background: #fff; border-radius: 16px; }
        .empty-state h3 { font-size: 20px; font-weight: 600; margin: 16px 0 8px; }
        .empty-state p { color: #6b7280; }
        
        /* Loading */
        .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
        .loading-card { background: #fff; border-radius: 16px; overflow: hidden; }
        .loading-img { aspect-ratio: 1; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        .loading-content { padding: 16px; }
        .loading-line { height: 14px; background: #f0f0f0; border-radius: 4px; margin-bottom: 8px; }
        .loading-line.short { width: 60%; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      <Header categories={categories} />

      <main className="cat-page">
        <div className="cat-container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link href="/">Domov</Link>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">{category?.name || 'Kategória'}</span>
          </nav>

          {/* Header */}
          <div className="cat-header">
            <h1 className="cat-title">{category?.name}</h1>
            <p className="cat-count">{total} produktov</p>
          </div>

          {/* Subcategories */}
          {subcategories.length > 0 && (
            <div className="subcats">
              {subcategories.map(sub => (
                <Link key={sub.id} href={`/kategoria/${sub.slug}`} className="subcat-card">
                  <span className="subcat-icon">📦</span>
                  <div>
                    <div className="subcat-name">{sub.name}</div>
                    <div className="subcat-count">{sub.product_count || 0} produktov</div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Mobile Filter Toggle */}
          <button className="mobile-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
            🔍 Filtre a zoradenie
          </button>

          <div className="cat-layout">
            {/* Sidebar Filters */}
            <aside className={`filters-sidebar ${showFilters ? 'show' : ''}`}>
              <button className="filters-close" onClick={() => setShowFilters(false)} style={{ display: 'none' }}>×</button>
              <h3 className="filters-title">🔍 Filtrovať</h3>

              {/* Price Filter */}
              <div className="filter-section">
                <label className="filter-label">Cena (€)</label>
                <div className="price-inputs">
                  <input 
                    type="number" 
                    className="price-input" 
                    placeholder="Od"
                    value={filters.min_price}
                    onChange={e => setFilters(prev => ({ ...prev, min_price: e.target.value }))}
                  />
                  <span className="price-sep">–</span>
                  <input 
                    type="number" 
                    className="price-input" 
                    placeholder="Do"
                    value={filters.max_price}
                    onChange={e => setFilters(prev => ({ ...prev, max_price: e.target.value }))}
                  />
                </div>
              </div>

              {/* Brand Filter */}
              {brands.length > 0 && (
                <div className="filter-section">
                  <label className="filter-label">Značka</label>
                  <div className="brand-list">
                    {brands.map(brand => (
                      <div key={brand} className="brand-item" onClick={() => toggleBrand(brand)}>
                        <div className={`brand-checkbox ${filters.brands.includes(brand) ? 'checked' : ''}`}></div>
                        <span className="brand-name">{brand}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filter Buttons */}
              <div className="filter-buttons">
                <button className="filter-btn filter-btn-secondary" onClick={clearFilters}>Zrušiť</button>
                <button className="filter-btn filter-btn-primary" onClick={applyFilters}>Použiť</button>
              </div>
            </aside>

            {/* Products Area */}
            <div className="products-area">
              {/* Toolbar */}
              <div className="products-toolbar">
                <span className="toolbar-count">Nájdených: <strong>{total}</strong> produktov</span>
                <div className="toolbar-sort">
                  <span className="sort-label">Zoradiť:</span>
                  <select 
                    className="sort-select"
                    value={filters.sort}
                    onChange={e => {
                      setFilters(prev => ({ ...prev, sort: e.target.value }))
                      setPage(1)
                    }}
                  >
                    <option value="popular">Najpopulárnejšie</option>
                    <option value="price_asc">Od najlacnejších</option>
                    <option value="price_desc">Od najdrahších</option>
                    <option value="newest">Najnovšie</option>
                    <option value="name_asc">Názov A-Z</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="loading-grid">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="loading-card">
                      <div className="loading-img"></div>
                      <div className="loading-content">
                        <div className="loading-line"></div>
                        <div className="loading-line short"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="products-grid">
                    {products.map(product => (
                      <div key={product.id} className="product-card">
                        <Link href={`/produkt/${product.slug}`}>
                          <div className="product-img-wrap">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.title} className="product-img" />
                            ) : (
                              <span className="product-img-placeholder">📦</span>
                            )}
                          </div>
                        </Link>
                        <div className="product-content">
                          {product.brand && <div className="product-brand">{product.brand}</div>}
                          <h3 className="product-title">
                            <Link href={`/produkt/${product.slug}`}>{product.title}</Link>
                          </h3>
                          <div className="product-price">{formatPrice(product.price_min)}</div>
                          <div className="product-offers">
                            {product.offer_count ? (
                              <>Porovnať ceny z <strong>{product.offer_count} obchodov</strong></>
                            ) : (
                              'Zobraziť detail'
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button 
                        className="page-btn" 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        ← Predošlá
                      </button>
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = page <= 3 ? i + 1 : page - 2 + i
                        if (pageNum > totalPages) return null
                        return (
                          <button 
                            key={pageNum}
                            className={`page-btn ${page === pageNum ? 'active' : ''}`}
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
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
              ) : (
                <div className="empty-state">
                  <div style={{ fontSize: 64 }}>📦</div>
                  <h3>Žiadne produkty</h3>
                  <p>V tejto kategórii zatiaľ nie sú žiadne produkty</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
