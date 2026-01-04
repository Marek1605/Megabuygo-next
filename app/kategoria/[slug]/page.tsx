'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
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

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
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
  
  const [filters, setFilters] = useState({
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    brands: searchParams.get('brand')?.split(',').filter(Boolean) || [],
    sort: searchParams.get('sort') || 'popular',
    in_stock: searchParams.get('in_stock') === 'true'
  })

  const limit = 24

  useEffect(() => {
    if (slug) {
      loadCategory()
      loadCategories()
    }
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
    const params: any = { page, limit, category: slug }
    if (filters.min_price) params.min_price = filters.min_price
    if (filters.max_price) params.max_price = filters.max_price
    if (filters.brands.length > 0) params.brand = filters.brands.join(',')
    if (filters.sort) params.sort = filters.sort
    
    const data = await api.getProducts(params)
    if (data) {
      setProducts(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.total_pages || 1)
      const uniqueBrands = Array.from(new Set((data.items || []).map((p: Product) => p.brand).filter(Boolean)))
      setBrands(uniqueBrands as string[])
    }
    setLoading(false)
  }

  function applyFilters() {
    setPage(1)
    loadProducts()
  }

  function clearFilters() {
    setFilters({ min_price: '', max_price: '', brands: [], sort: 'popular', in_stock: false })
    setPage(1)
  }

  function toggleBrand(brand: string) {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand) ? prev.brands.filter(b => b !== brand) : [...prev.brands, brand]
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
      <Header categories={categories} />
      <main style={{ background: '#f8fafc', minHeight: '100vh', padding: '20px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <nav style={{ display: 'flex', gap: 8, padding: '16px 0', fontSize: 14, color: '#6b7280' }}>
            <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Domov</Link>
            <span>›</span>
            <span style={{ color: '#1f2937', fontWeight: 500 }}>{category?.name || 'Kategória'}</span>
          </nav>

          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1f2937', margin: '0 0 8px' }}>{category?.name}</h1>
            <p style={{ fontSize: 14, color: '#6b7280' }}>{total} produktov</p>
          </div>

          {subcategories.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
              {subcategories.map(sub => (
                <Link key={sub.id} href={`/kategoria/${sub.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, textDecoration: 'none' }}>
                  <span style={{ fontSize: 24 }}>📦</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{sub.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{sub.product_count || 0} produktov</div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '16px 20px', background: '#fff', borderRadius: 12 }}>
            <span style={{ fontSize: 14, color: '#6b7280' }}>Nájdených: <strong>{total}</strong> produktov</span>
            <select 
              value={filters.sort}
              onChange={e => { setFilters(prev => ({ ...prev, sort: e.target.value })); setPage(1) }}
              style={{ padding: '8px 32px 8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
            >
              <option value="popular">Najpopulárnejšie</option>
              <option value="price_asc">Od najlacnejších</option>
              <option value="price_desc">Od najdrahších</option>
              <option value="newest">Najnovšie</option>
            </select>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}>Načítavam...</div>
          ) : products.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
              {products.map(product => (
                <div key={product.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                  <Link href={`/produkt/${product.slug}`}>
                    <div style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#f9fafb' }}>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} style={{ maxWidth: '85%', maxHeight: 160, objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: 60, opacity: 0.3 }}>📦</span>
                      )}
                    </div>
                  </Link>
                  <div style={{ padding: '16px 18px 20px' }}>
                    {product.brand && <div style={{ fontSize: 12, color: '#ff6b35', fontWeight: 500, marginBottom: 4 }}>{product.brand}</div>}
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', margin: '0 0 12px', lineHeight: 1.4, minHeight: 40, overflow: 'hidden' }}>
                      <Link href={`/produkt/${product.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{product.title}</Link>
                    </h3>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>{formatPrice(product.price_min)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 16 }}>
              <div style={{ fontSize: 64 }}>📦</div>
              <h3 style={{ fontSize: 20, fontWeight: 600, margin: '16px 0 8px' }}>Žiadne produkty</h3>
              <p style={{ color: '#6b7280' }}>V tejto kategórii zatiaľ nie sú žiadne produkty</p>
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>← Predošlá</button>
              <span style={{ padding: '10px 16px' }}>Strana {page} z {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>Ďalšia →</button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
