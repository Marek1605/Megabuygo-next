'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

interface Product {
  id: string
  title: string
  slug: string
  image_url?: string
  price_min: number
  brand?: string
  is_active: boolean
  created_at: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [deleting, setDeleting] = useState(false)
  const limit = 20

  useEffect(() => {
    loadProducts()
  }, [page, search])

  async function loadProducts() {
    setLoading(true)
    const data = await api.getAdminProducts({ page, limit, search: search || undefined })
    if (data) {
      setProducts(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.total_pages || 1)
    }
    setLoading(false)
  }

  function toggleSelect(id: string) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  function toggleSelectAll() {
    if (selected.length === products.length) {
      setSelected([])
    } else {
      setSelected(products.map(p => p.id))
    }
  }

  async function deleteSelected() {
    if (selected.length === 0) return
    if (!confirm(`Naozaj vymazat ${selected.length} produktov?`)) return
    setDeleting(true)
    const result = await api.bulkUpdateProducts(selected, 'delete')
    if (result) {
      setSelected([])
      loadProducts()
    } else {
      alert('Chyba pri mazani')
    }
    setDeleting(false)
  }

  async function deleteAllProducts() {
    if (!confirm('POZOR! Naozaj vymazat VSETKY produkty? Toto sa neda vratit!')) return
    if (!confirm('Ste si NAOZAJ isty? Vsetky produkty budu vymazane!')) return
    setDeleting(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/all`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        alert('Vsetky produkty boli vymazane')
        setSelected([])
        loadProducts()
      } else {
        alert(data.error || 'Chyba')
      }
    } catch (e) {
      alert('Chyba pri mazani')
    }
    setDeleting(false)
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(price)
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Produkty ({total})</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/admin/products/new" style={{ padding: '12px 24px', background: '#c9a87c', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>+ Novy produkt</Link>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Hladat produkt..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ flex: 1, minWidth: 200, padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: 8 }}
          />
          {selected.length > 0 && (
            <button onClick={deleteSelected} disabled={deleting} style={{ padding: '10px 20px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>
              {deleting ? '...' : `Vymazat (${selected.length})`}
            </button>
          )}
          <button onClick={deleteAllProducts} disabled={deleting} style={{ padding: '10px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>
            {deleting ? '...' : 'Vymazat VSETKY'}
          </button>
        </div>
      </div>

      {loading ? (
        <p>Nacitavam...</p>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
          <p>Ziadne produkty</p>
        </div>
      ) : (
        <>
          <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: 12, textAlign: 'left', width: 40 }}>
                    <input type="checkbox" checked={selected.length === products.length && products.length > 0} onChange={toggleSelectAll} style={{ width: 18, height: 18 }} />
                  </th>
                  <th style={{ padding: 12, textAlign: 'left', width: 60 }}>Img</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Nazov</th>
                  <th style={{ padding: 12, textAlign: 'left', width: 120 }}>Cena</th>
                  <th style={{ padding: 12, textAlign: 'left', width: 100 }}>Status</th>
                  <th style={{ padding: 12, textAlign: 'left', width: 100 }}>Akcie</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: 12 }}>
                      <input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggleSelect(product.id)} style={{ width: 18, height: 18 }} />
                    </td>
                    <td style={{ padding: 12 }}>
                      {product.image_url ? (
                        <img src={product.image_url} alt="" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6, background: '#f9fafb' }} />
                      ) : (
                        <div style={{ width: 40, height: 40, background: '#f3f4f6', borderRadius: 6 }} />
                      )}
                    </td>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 500 }}>{product.title}</div>
                      {product.brand && <div style={{ fontSize: 12, color: '#6b7280' }}>{product.brand}</div>}
                    </td>
                    <td style={{ padding: 12, fontWeight: 600 }}>{formatPrice(product.price_min)}</td>
                    <td style={{ padding: 12 }}>
                      <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: product.is_active ? '#dcfce7' : '#f3f4f6', color: product.is_active ? '#166534' : '#6b7280' }}>
                        {product.is_active ? 'Aktivny' : 'Neaktivny'}
                      </span>
                    </td>
                    <td style={{ padding: 12 }}>
                      <Link href={`/admin/products/${product.id}`} style={{ padding: '6px 12px', background: '#f3f4f6', borderRadius: 6, textDecoration: 'none', color: '#374151', fontSize: 13 }}>Upravit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '10px 20px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>Predchadzajuca</button>
              <span style={{ color: '#6b7280' }}>{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '10px 20px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}>Dalsia</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
