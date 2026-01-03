'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api, formatPrice } from '@/lib/api'

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState('')
  const limit = 50

  useEffect(() => { loadCategories() }, [])
  useEffect(() => { loadProducts() }, [page, search])

  async function loadCategories() {
    const cats = await api.getCategoriesFlat()
    if (cats) setCategories(cats)
  }

  async function loadProducts() {
    setLoading(true)
    const params: any = { page, limit }
    if (search) params.search = search
    const data = await api.getAdminProducts(params)
    if (data) {
      setProducts(data.items || [])
      setTotal(data.total || 0)
    }
    setLoading(false)
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    if (bulkAction === 'delete' && !confirm('Vymazat ' + ids.length + ' produktov?')) return
    
    for (const id of ids) {
      try {
        if (bulkAction === 'delete') await api.deleteProduct(id)
        else if (bulkAction === 'activate') await api.updateProduct(id, { is_active: true })
        else if (bulkAction === 'deactivate') await api.updateProduct(id, { is_active: false })
      } catch (e) { console.error(e) }
    }
    setSelectedIds(new Set())
    setBulkAction('')
    loadProducts()
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm('Vymazat "' + title + '"?')) return
    await api.deleteProduct(id)
    loadProducts()
  }

  const handleDuplicate = async (id: string) => {
    const p = await api.getProduct(id) as any
    if (p) {
      const np = {
        title: p.title + ' (kopia)',
        slug: p.slug + '-kopia-' + Date.now(),
        description: p.description || '',
        category_id: p.category_id || '',
        price_min: p.price_min || 0,
        price_max: p.price_max || 0,
        is_active: p.is_active
      }
      const r = await api.createProduct(np)
      if (r?.id) router.push('/admin/products/' + r.id)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:24}}>
        <h1 style={{fontSize:24,fontWeight:700}}>Produkty ({total})</h1>
        <div style={{display:'flex',gap:10}}>
          <Link href="/admin/feeds" className="admin-btn admin-btn-outline">Importy</Link>
          <Link href="/admin/products/new" className="admin-btn">+ Novy produkt</Link>
        </div>
      </div>

      <div style={{marginBottom:16,display:'flex',gap:16,alignItems:'center'}}>
        <input
          type="text"
          placeholder="Hladat..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{padding:'8px 12px',border:'1px solid #ddd',borderRadius:6,width:300}}
        />
        <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} style={{padding:'8px 12px',border:'1px solid #ddd',borderRadius:6}}>
          <option value="">-- Hromadna akcia --</option>
          <option value="activate">Aktivovat</option>
          <option value="deactivate">Deaktivovat</option>
          <option value="delete">Vymazat</option>
        </select>
        <button onClick={handleBulkAction} disabled={!bulkAction || selectedIds.size === 0} className="admin-btn">
          Vykonat ({selectedIds.size})
        </button>
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:60}}>Nacitavam...</div>
      ) : products.length === 0 ? (
        <div style={{textAlign:'center',padding:60,background:'white',borderRadius:12}}>
          <h3>Ziadne produkty</h3>
          <Link href="/admin/products/new" className="admin-btn">+ Pridat produkt</Link>
        </div>
      ) : (
        <table style={{width:'100%',borderCollapse:'collapse',background:'white',borderRadius:12,overflow:'hidden'}}>
          <thead>
            <tr style={{background:'#f9fafb'}}>
              <th style={{padding:12,textAlign:'left',width:40}}>
                <input type="checkbox" onChange={e => {
                  if (e.target.checked) setSelectedIds(new Set(products.map(p => p.id)))
                  else setSelectedIds(new Set())
                }} />
              </th>
              <th style={{padding:12,textAlign:'left'}}>Produkt</th>
              <th style={{padding:12,textAlign:'left'}}>Kategoria</th>
              <th style={{padding:12,textAlign:'left'}}>Cena</th>
              <th style={{padding:12,textAlign:'left'}}>Stav</th>
              <th style={{padding:12,textAlign:'left'}}>Akcie</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{borderBottom:'1px solid #f3f4f6'}}>
                <td style={{padding:12}}>
                  <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} />
                </td>
                <td style={{padding:12}}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:50,height:50,background:'#f3f4f6',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                      {p.image_url ? <img src={p.image_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : '📦'}
                    </div>
                    <div>
                      <Link href={'/admin/products/' + p.id} style={{fontWeight:500,color:'#111'}}>{p.title}</Link>
                      {p.ean && <div style={{fontSize:12,color:'#999'}}>EAN: {p.ean}</div>}
                    </div>
                  </div>
                </td>
                <td style={{padding:12,color:'#666'}}>{p.category_name || '-'}</td>
                <td style={{padding:12,fontWeight:600}}>{formatPrice(p.price_min)}</td>
                <td style={{padding:12}}>
                  <span style={{padding:'4px 10px',borderRadius:20,fontSize:12,background:p.is_active ? '#dcfce7' : '#fef3c7',color:p.is_active ? '#166534' : '#92400e'}}>
                    {p.is_active ? 'Aktivny' : 'Neaktivny'}
                  </span>
                </td>
                <td style={{padding:12}}>
                  <div style={{display:'flex',gap:4}}>
                    <Link href={'/admin/products/' + p.id} style={{padding:'6px 10px',border:'1px solid #e5e7eb',borderRadius:6,background:'#ff6b35',color:'white'}}>Edit</Link>
                    <button onClick={() => handleDuplicate(p.id)} style={{padding:'6px 10px',border:'1px solid #e5e7eb',borderRadius:6,background:'white',cursor:'pointer'}}>Copy</button>
                    <button onClick={() => handleDelete(p.id, p.title)} style={{padding:'6px 10px',border:'1px solid #e5e7eb',borderRadius:6,background:'white',cursor:'pointer',color:'#dc2626'}}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <div style={{display:'flex',justifyContent:'space-between',padding:'16px 0'}}>
          <span>Strana {page} z {totalPages}</span>
          <div style={{display:'flex',gap:4}}>
            <button onClick={() => setPage(1)} disabled={page===1} style={{padding:'8px 14px',border:'1px solid #e5e7eb',borderRadius:6,cursor:'pointer'}}>First</button>
            <button onClick={() => setPage(p => p-1)} disabled={page===1} style={{padding:'8px 14px',border:'1px solid #e5e7eb',borderRadius:6,cursor:'pointer'}}>Prev</button>
            <button onClick={() => setPage(p => p+1)} disabled={page===totalPages} style={{padding:'8px 14px',border:'1px solid #e5e7eb',borderRadius:6,cursor:'pointer'}}>Next</button>
            <button onClick={() => setPage(totalPages)} disabled={page===totalPages} style={{padding:'8px 14px',border:'1px solid #e5e7eb',borderRadius:6,cursor:'pointer'}}>Last</button>
          </div>
        </div>
      )}
    </div>
  )
}
