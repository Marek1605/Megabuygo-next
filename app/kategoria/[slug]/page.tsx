'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()
  
  const [category, setCategory] = useState<Category | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
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
      loadCategories()
    }
  }, [slug])

  useEffect(() => {
    if (slug) loadProducts()
  }, [slug, page, filters])

  async function loadCategory() {
    const cat = await api.getCategoryBySlug(slug)
    if (cat) setCategory(cat)
  }

  async function loadCategories() {
    const cats = await api.getCategoriesTree()
    if (cats && Array.isArray(cats)) setCategories(cats)
  }

  async function loadProducts() {
    setLoading(true)
    const params: any = { page, limit, category: slug }
    if (filters.min_price) params.min_price = filters.min_price
    if (filters.max_price) params.max_price = filters.max_price
    if (filters.brands.length > 0) params.brand = filters.brands.join(',')
    if (filters.sort) params.sort = filters.sort
    if (filters.in_stock) params.in_stock = 'true'
    
    const data = await api.getProducts(params)
    if (data) {
      setProducts(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.total_pages || 1)
      if (data.facets) setFacets(data.facets)
    }
    setLoading(false)
  }

  function toggleBrand(brand: string) {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand) ? prev.brands.filter(b => b !== brand) : [...prev.brands, brand]
    }))
    setPage(1)
  }

  function clearFilters() {
    setFilters({ min_price: '', max_price: '', brands: [], sort: 'popular', in_stock: false })
    setPage(1)
  }

  const activeFilterCount = filters.brands.length + (filters.min_price ? 1 : 0) + (filters.max_price ? 1 : 0) + (filters.in_stock ? 1 : 0)

  if (!category && !loading) {
    return (
      <>
        <Header categories={categories} />
        <main style={{ padding: '100px 20px', textAlign: 'center', minHeight: '60vh' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>Kategória nebola nájdená</h1>
          <Link href="/" style={{ color: '#ff6b35' }}>? Spät</Link>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header categories={categories} />
      <main style={{ background: '#f8fafc', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px' }}>
          <nav style={{ display: 'flex', gap: 8, padding: '16px 0', fontSize: 14, color: '#6b7280' }}>
            <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Domov</Link>
            <span>›</span>
            <span style={{ color: '#1f2937', fontWeight: 500 }}>{category?.name || 'Kategória'}</span>
          </nav>

          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', margin: '0 0 8px' }}>{category?.name}</h1>
            <p style={{ fontSize: 14, color: '#6b7280' }}>{total} produktov</p>
          </div>

          {category?.subcategories && category.subcategories.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
              {category.subcategories.map(sub => (
                <Link key={sub.id} href={`/kategoria/${sub.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, textDecoration: 'none' }}>
                  <span style={{ fontSize: 24 }}>??</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{sub.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{sub.product_count || 0} produktov</div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
            {/* Filters */}
            <aside style={{ background: '#fff', borderRadius: 16, padding: 20, height: 'fit-content', position: 'sticky', top: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Filtre</h2>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} style={{ fontSize: 13, color: '#ff6b35', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Vymazat ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Price */}
              <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>?? Cena</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input type="number" placeholder="Od" value={filters.min_price} onChange={e => setFilters(prev => ({ ...prev, min_price: e.target.value }))} style={{ flex: 1, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }} />
                  <span style={{ alignSelf: 'center', color: '#9ca3af' }}>-</span>
                  <input type="number" placeholder="Do" value={filters.max_price} onChange={e => setFilters(prev => ({ ...prev, max_price: e.target.value }))} style={{ flex: 1, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[{ label: 'do 50€', min: '', max: '50' }, { label: '50-100€', min: '50', max: '100' }, { label: '100-500€', min: '100', max: '500' }, { label: '500€+', min: '500', max: '' }].map(r => (
                    <button key={r.label} onClick={() => { setFilters(prev => ({ ...prev, min_price: r.min, max_price: r.max })); setPage(1) }} style={{ padding: '6px 12px', fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 20, background: filters.min_price === r.min && filters.max_price === r.max ? '#ff6b35' : '#fff', color: filters.min_price === r.min && filters.max_price === r.max ? '#fff' : '#4b5563', cursor: 'pointer' }}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock */}
              <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #e5e7eb' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={filters.in_stock} onChange={e => { setFilters(prev => ({ ...prev, in_stock: e.target.checked })); setPage(1) }} style={{ width: 18, height: 18, accentColor: '#ff6b35' }} />
                  <span style={{ fontWeight: 500, fontSize: 14 }}>? Len skladom</span>
                </label>
              </div>

              {/* Brands */}
              {facets.brands && facets.brands.length > 0 && (
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>??? Znacka</div>
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {facets.brands.slice(0, 20).map(brand => (
                      <label key={brand.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer' }}>
                        <input type="checkbox" checked={filters.brands.includes(brand.name)} onChange={() => toggleBrand(brand.name)} style={{ width: 16, height: 16, accentColor: '#ff6b35' }} />
                        <span style={{ flex: 1, fontSize: 14 }}>{brand.name}</span>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>({brand.count})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            {/* Products */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '16px 20px', background: '#fff', borderRadius: 12 }}>
                <span style={{ fontSize: 14, color: '#6b7280' }}>Nájdených: <strong>{total}</strong> produktov</span>
                <select value={filters.sort} onChange={e => { setFilters(prev => ({ ...prev, sort: e.target.value })); setPage(1) }} style={{ padding: '8px 32px 8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}>
                  <option value="popular">Najpopulárnejšie</option>
                  <option value="price_asc">Od najlacnejších</option>
                  <option value="price_desc">Od najdrahších</option>
                  <option value="newest">Najnovšie</option>
                  <option value="name_asc">Podla názvu</option>
                </select>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: 60 }}>Nacítavam...</div>
              ) : products.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                  {products.map(product => (
                    <div key={product.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                      <Link href={`/produkt/${product.slug}`}>
                        <div style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#f9fafb' }}>
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.title} style={{ maxWidth: '85%', maxHeight: 140, objectFit: 'contain' }} />
                          ) : (
                            <span style={{ fontSize: 60, opacity: 0.3 }}>??</span>
                          )}
                        </div>
                      </Link>
                      <div style={{ padding: '16px 18px 20px' }}>
                        {product.brand && <div style={{ fontSize: 12, color: '#ff6b35', fontWeight: 500, marginBottom: 4 }}>{product.brand}</div>}
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', margin: '0 0 12px', lineHeight: 1.4, minHeight: 40, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          <Link href={`/produkt/${product.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{product.title}</Link>
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2937' }}>{formatPrice(product.price_min)}</div>
                          {product.stock_status === 'instock' && <span style={{ fontSize: 11, color: '#10b981', fontWeight: 500 }}>? Skladom</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 16 }}>
                  <div style={{ fontSize: 64 }}>??</div>
                  <h3 style={{ fontSize: 20, fontWeight: 600, margin: '16px 0 8px' }}>Žiadne produkty</h3>
                  <p style={{ color: '#6b7280' }}>V tejto kategórii zatial nie sú žiadne produkty</p>
                </div>
              )}

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>? Predošlá</button>
                  <span style={{ padding: '10px 16px' }}>Strana {page} z {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}>Dalšia ?</button>
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
