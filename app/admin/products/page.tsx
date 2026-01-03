'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { api, formatPrice } from '@/lib/api'
import type { Product } from '@/lib/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const limit = 20

  useEffect(() => {
    loadProducts()
  }, [page, search])

  async function loadProducts() {
    setLoading(true)
    const data = await api.getProducts({ page, limit, search: search || undefined })
    if (data) {
      setProducts(data.items || [])
      setTotal(data.total || 0)
    }
    setLoading(false)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-title">Produkty</h1>
        <Link href="/admin/products/new" className="admin-btn">
          + Pridať produkt
        </Link>
      </div>

      <div className="admin-card" style={{marginBottom: 20}}>
        <div style={{padding: 16, display: 'flex', gap: 12}}>
          <input
            type="text"
            className="admin-input"
            placeholder="Hľadať podľa názvu, EAN, SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            style={{maxWidth: 400}}
          />
        </div>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{width: 60}}>Foto</th>
              <th>Produkt</th>
              <th>Kategória</th>
              <th>Cena</th>
              <th>Ponuky</th>
              <th>Stav</th>
              <th style={{width: 100}}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{textAlign: 'center', padding: 40}}>Načítavam...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} style={{textAlign: 'center', padding: 40}}>
                <div style={{fontSize: 48, marginBottom: 12}}>📦</div>
                <p style={{color: '#6b7280'}}>Žiadne produkty</p>
              </td></tr>
            ) : products.map(product => (
              <tr key={product.id}>
                <td>
                  <div style={{width: 48, height: 48, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {product.image_url ? (
                      <Image src={product.image_url} alt="" width={48} height={48} style={{objectFit: 'contain'}} />
                    ) : (
                      <span style={{fontSize: 24}}>📦</span>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{fontWeight: 500}}>{product.title}</div>
                  <div style={{fontSize: 12, color: '#6b7280'}}>{product.ean || '-'}</div>
                </td>
                <td style={{color: '#6b7280'}}>{product.category_name || '-'}</td>
                <td>
                  <div style={{fontWeight: 600}}>{formatPrice(product.price_min)}</div>
                  {product.price_max > product.price_min && (
                    <div style={{fontSize: 12, color: '#9ca3af'}}>až {formatPrice(product.price_max)}</div>
                  )}
                </td>
                <td>{product.offer_count}</td>
                <td>
                  <span className={`admin-badge ${product.is_active ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                    {product.is_active ? '✓ Aktívny' : '✗ Neaktívny'}
                  </span>
                </td>
                <td>
                  <div style={{display: 'flex', gap: 8}}>
                    <Link href={`/admin/products/${product.id}`} className="admin-btn admin-btn-outline" style={{padding: '6px 12px', fontSize: 13}}>
                      Upraviť
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="admin-pagination">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
          {Array.from({length: Math.min(5, totalPages)}, (_, i) => (
            <button key={i+1} onClick={() => setPage(i+1)} className={page === i+1 ? 'active' : ''}>
              {i+1}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>→</button>
        </div>
      )}
    </div>
  )
}
