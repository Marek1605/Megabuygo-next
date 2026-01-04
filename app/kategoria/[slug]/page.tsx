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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Filtre {activeFilterCount > 0 && `(${activeFilterCount})`}</h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">Zrusit</button>
                )}
              </div>

              {/* Price Filter */}
              <div className="mb-4 border-b pb-4">
                <button onClick={() => setCollapsed({...collapsed, price: !collapsed.price})} className="flex justify-between w-full font-medium mb-2">
                  Cena <span>{collapsed.price ? '+' : '-'}</span>
                </button>
                {!collapsed.price && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input type="number" placeholder="Od" value={filters.min_price} onChange={e => { setFilters({...filters, min_price: e.target.value}); setPage(1) }} className="w-full px-2 py-1 border rounded text-sm" />
                      <input type="number" placeholder="Do" value={filters.max_price} onChange={e => { setFilters({...filters, max_price: e.target.value}); setPage(1) }} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {['50', '100', '500'].map(p => (
                        <button key={p} onClick={() => { setFilters({...filters, max_price: p}); setPage(1) }} className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200">do {p} EUR</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Stock Filter */}
              <div className="mb-4 border-b pb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filters.in_stock} onChange={e => { setFilters({...filters, in_stock: e.target.checked}); setPage(1) }} className="rounded" />
                  <span className="text-sm">Len skladom</span>
                </label>
              </div>

              {/* Brand Filter */}
              {facets.brands && facets.brands.length > 0 && (
                <div className="mb-4">
                  <button onClick={() => setCollapsed({...collapsed, brands: !collapsed.brands})} className="flex justify-between w-full font-medium mb-2">
                    Znacka <span>{collapsed.brands ? '+' : '-'}</span>
                  </button>
                  {!collapsed.brands && (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {facets.brands.map(b => (
                        <label key={b.name} className="flex items-center gap-2 cursor-pointer text-sm">
                          <input type="checkbox" checked={filters.brands.includes(b.name)} onChange={() => toggleBrand(b.name)} className="rounded" />
                          <span>{b.name}</span>
                          <span className="text-gray-400 ml-auto">({b.count})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">{category?.name || 'Kategoria'}</h1>
              <select value={filters.sort} onChange={e => { setFilters({...filters, sort: e.target.value}); setPage(1) }} className="border rounded px-3 py-2 text-sm">
                <option value="popular">Najpredavanejsie</option>
                <option value="price_asc">Cena vzostupne</option>
                <option value="price_desc">Cena zostupne</option>
                <option value="newest">Najnovsie</option>
                <option value="name_asc">Nazov A-Z</option>
              </select>
            </div>

            {/* Subcategories */}
            {category?.subcategories && category.subcategories.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {category.subcategories.map(sub => (
                  <Link key={sub.id} href={`/kategoria/${sub.slug}`} className="bg-white rounded-lg p-4 shadow hover:shadow-md transition text-center">
                    <div className="font-medium">{sub.name}</div>
                    <div className="text-sm text-gray-500">{sub.product_count} produktov</div>
                  </Link>
                ))}
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-12">Nacitavam...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Ziadne produkty</div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map(p => (
                    <Link key={p.id} href={`/produkt/${p.slug}`} className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden group">
                      <div className="aspect-square bg-gray-100 relative">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.title} className="w-full h-full object-contain p-2 group-hover:scale-105 transition" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">Bez obrazku</div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm line-clamp-2 mb-1">{p.title}</h3>
                        {p.brand && <div className="text-xs text-gray-500 mb-1">{p.brand}</div>}
                        <div className="font-bold text-blue-600">{formatPrice(p.price_min)}</div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border rounded disabled:opacity-50">Predchadzajuca</button>
                    <span className="px-4 py-2">{page} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 border rounded disabled:opacity-50">Dalsia</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}