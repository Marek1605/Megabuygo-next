'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { api, formatPrice, formatDate } from '@/lib/api'

interface Product {
  id: string
  title: string
  slug: string
  ean?: string
  sku?: string
  brand?: string
  image_url?: string
  category_id?: string
  category_name?: string
  price_min: number
  price_max: number
  offer_count?: number
  stock_status: string
  is_active: boolean
  is_featured?: boolean
  created_at: string
}

interface FilterState {
  search: string
  category_id: string
  stock_status: string
  is_active: string
  price_min: string
  price_max: string
  sort: string
}

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [bulkAction, setBulkAction] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [bulkProcessing, setBulkProcessing] = useState(false)
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, outofstock: 0 })
  
  const limit = 50

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    category_id: searchParams.get('category_id') || '',
    stock_status: searchParams.get('stock_status') || '',
    is_active: searchParams.get('is_active') || '',
    price_min: searchParams.get('price_min') || '',
    price_max: searchParams.get('price_max') || '',
    sort: searchParams.get('sort') || 'newest',
  })

  useEffect(() => {
    loadCategories()
    loadStats()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [page, filters])

  useEffect(() => {
    if (selectAll) {
      setSelectedIds(new Set(products.map(p => p.id)))
    }
  }, [selectAll, products])

  async function loadCategories() {
    const cats = await api.getCategoriesFlat()
    if (cats) setCategories(cats)
  }

  async function loadStats() {
    const data = await api.getAdminProducts({ limit: 1 })
    if (data) {
      setStats(prev => ({ ...prev, total: data.total }))
    }
  }

  async function loadProducts() {
    setLoading(true)
    const params: any = { page, limit }
    
    if (filters.search) params.search = filters.search
    if (filters.category_id) params.category_id = filters.category_id
    if (filters.stock_status) params.stock_status = filters.stock_status
    if (filters.is_active) params.is_active = filters.is_active
    if (filters.price_min) params.price_min = filters.price_min
    if (filters.price_max) params.price_max = filters.price_max
    if (filters.sort) params.sort = filters.sort

    const data = await api.getAdminProducts(params)
    if (data) {
      setProducts(data.items || [])
      setTotal(data.total || 0)
    }
    setLoading(false)
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
    setSelectedIds(new Set())
    setSelectAll(false)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category_id: '',
      stock_status: '',
      is_active: '',
      price_min: '',
      price_max: '',
      sort: 'newest',
    })
    setPage(1)
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
      setSelectAll(false)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set())
      setSelectAll(false)
    } else {
      setSelectedIds(new Set(products.map(p => p.id)))
      setSelectAll(true)
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return
    
    const ids = Array.from(selectedIds)
    
    if (bulkAction === 'delete') {
      if (!confirm(`Naozaj chcete vymazať ${ids.length} produktov? Táto akcia je nevratná.`)) {
        return
      }
    }

    setBulkProcessing(true)
    
    try {
      let successCount = 0
      let errorCount = 0

      for (const id of ids) {
        try {
          switch (bulkAction) {
            case 'delete':
              await api.deleteProduct(id)
              break
            case 'activate':
              await api.updateProduct(id, { is_active: true })
              break
            case 'deactivate':
              await api.updateProduct(id, { is_active: false })
              break
            case 'feature':
              await api.updateProduct(id, { is_featured: true })
              break
            case 'unfeature':
              await api.updateProduct(id, { is_featured: false })
              break
          }
          successCount++
        } catch (e) {
          errorCount++
        }
      }

      alert(`Hromadná akcia dokončená:\n✅ Úspešne: ${successCount}\n❌ Chyby: ${errorCount}`)
      
      setSelectedIds(new Set())
      setSelectAll(false)
      setBulkAction('')
      loadProducts()
      loadStats()
    } catch (error) {
      alert('Chyba pri vykonávaní hromadnej akcie')
    }
    
    setBulkProcessing(false)
  }

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Naozaj chcete vymazať produkt "${title}"?`)) return
    
    try {
      await api.deleteProduct(id)
      loadProducts()
      loadStats()
    } catch (error) {
      alert('Chyba pri mazaní produktu')
    }
  }

  const handleDuplicateProduct = async (id: string) => {
    try {
      const product = await api.getProduct(id) as any
      if (product) {
        const newProduct = {
          title: product.title + " (kópia)",
          slug: product.slug + "-kopia-" + Date.now(),
          description: product.description || "",
          short_description: product.short_description || "",
          category_id: product.category_id || "",
          brand_name: product.brand || "",
          image_url: product.image_url || "",
          price_min: product.price_min || 0,
          price_max: product.price_max || 0,
          stock_status: product.stock_status || "instock",
          is_active: product.is_active,
          ean: "",
          sku: "",
        }
        const result = await api.createProduct(newProduct)
        if (result?.id) {
          router.push("/admin/products/" + result.id)
        }
      }
    } catch (error) {
      alert("Chyba pri duplikovaní produktu")
    }
  }

  const handleExport = async () => {
    const ids = selectedIds.size > 0 ? Array.from(selectedIds) : null
    alert(`Export ${ids ? ids.length + ' vybraných' : 'všetkých'} produktov - funkcia bude dostupná čoskoro`)
  }

  const totalPages = Math.ceil(total / limit)
  const hasActiveFilters = filters.search || filters.category_id || filters.stock_status || 
                           filters.is_active || filters.price_min || filters.price_max

  return (
    <div>
      <style jsx>{`
        .products-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .products-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .products-count {
          background: #e5e7eb;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }
        .header-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .stats-bar {
          display: flex;
          gap: 24px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        .stat-icon.total { background: #dbeafe; }
        .stat-icon.active { background: #dcfce7; }
        .stat-icon.inactive { background: #fef3c7; }
        .stat-icon.outofstock { background: #fee2e2; }
        .stat-info strong { display: block; font-size: 18px; }
        .stat-info span { font-size: 12px; color: #6b7280; }

        .filters-section {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          margin-bottom: 20px;
          overflow: hidden;
        }
        .filters-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          cursor: pointer;
        }
        .filters-header:hover { background: #f3f4f6; }
        .filters-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
        .filters-body {
          padding: 16px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        .filter-group label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
          margin-bottom: 6px;
        }
        .filter-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }
        .filter-input:focus {
          outline: none;
          border-color: #ff6b35;
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
        }
        .active-filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          padding: 0 16px 16px;
        }
        .filter-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: #fff5f0;
          border: 1px solid #ff6b35;
          border-radius: 20px;
          font-size: 12px;
          color: #ff6b35;
        }
        .filter-tag button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-size: 14px;
          line-height: 1;
        }

        .bulk-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          margin-bottom: 16px;
        }
        .bulk-bar.has-selection {
          background: #fef3c7;
          border-color: #fcd34d;
        }
        .bulk-select-info {
          font-weight: 500;
          color: #1e40af;
        }
        .bulk-bar.has-selection .bulk-select-info {
          color: #92400e;
        }

        .products-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .products-table th {
          background: #f9fafb;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb;
        }
        .products-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }
        .products-table tr:hover td {
          background: #f9fafb;
        }
        .products-table tr.selected td {
          background: #fef3c7;
        }
        
        .product-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .product-image {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .product-info {
          min-width: 0;
        }
        .product-title {
          font-weight: 500;
          color: #111827;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 250px;
        }
        .product-title a {
          color: inherit;
          text-decoration: none;
        }
        .product-title a:hover {
          color: #ff6b35;
        }
        .product-meta {
          font-size: 12px;
          color: #9ca3af;
          display: flex;
          gap: 8px;
        }
        .product-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        .status-badge.active { background: #dcfce7; color: #166534; }
        .status-badge.inactive { background: #fef3c7; color: #92400e; }
        .status-badge.featured { background: #fef3c7; color: #92400e; }
        .status-badge.instock { background: #dcfce7; color: #166534; }
        .status-badge.outofstock { background: #fee2e2; color: #dc2626; }
        .status-badge.onbackorder { background: #dbeafe; color: #1e40af; }

        .price-cell {
          font-weight: 600;
          color: #111827;
        }
        .price-range {
          font-size: 12px;
          color: #9ca3af;
          font-weight: 400;
        }

        .actions-cell {
          display: flex;
          gap: 4px;
        }
        .action-btn {
          padding: 6px 10px;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.15s;
        }
        .action-btn:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }
        .action-btn.delete:hover {
          background: #fee2e2;
          border-color: #fecaca;
          color: #dc2626;
        }
        .action-btn.primary {
          background: #ff6b35;
          border-color: #ff6b35;
          color: white;
        }
        .action-btn.primary:hover {
          background: #e55a2b;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          flex-wrap: wrap;
          gap: 16px;
        }
        .pagination-info {
          color: #6b7280;
          font-size: 14px;
        }
        .pagination-buttons {
          display: flex;
          gap: 4px;
        }
        .pagination-btn {
          padding: 8px 14px;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        .pagination-btn:hover:not(:disabled) {
          background: #f3f4f6;
        }
        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .pagination-btn.active {
          background: #ff6b35;
          border-color: #ff6b35;
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
        }
        .empty-state-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }
        .empty-state h3 {
          font-size: 18px;
          margin-bottom: 8px;
        }
        .empty-state p {
          color: #6b7280;
          margin-bottom: 20px;
        }

        .loading-overlay {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px;
          background: white;
          border-radius: 12px;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f4f6;
          border-top-color: #ff6b35;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .checkbox-cell {
          width: 40px;
        }
        .checkbox-cell input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
      `}</style>

      {/* Header */}
      <div className="products-header">
        <div>
          <h1 className="products-title">
            📦 Produkty
            <span className="products-count">{total.toLocaleString()}</span>
          </h1>
        </div>
        <div className="header-actions">
          <button className="admin-btn admin-btn-outline" onClick={handleExport}>
            📥 Export
          </button>
          <Link href="/admin/feeds" className="admin-btn admin-btn-outline">
            📡 Importy
          </Link>
          <Link href="/admin/products/new" className="admin-btn">
            + Nový produkt
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-icon total">📦</div>
          <div className="stat-info">
            <strong>{total.toLocaleString()}</strong>
            <span>Celkom produktov</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon active">✅</div>
          <div className="stat-info">
            <strong>{stats.active.toLocaleString()}</strong>
            <span>Aktívnych</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon inactive">⏸️</div>
          <div className="stat-info">
            <strong>{stats.inactive.toLocaleString()}</strong>
            <span>Neaktívnych</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon outofstock">📭</div>
          <div className="stat-info">
            <strong>{stats.outofstock.toLocaleString()}</strong>
            <span>Nedostupných</span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-header" onClick={() => setShowFilters(!showFilters)}>
          <div className="filters-toggle">
            <span>🔍</span>
            <span>Filtre a vyhľadávanie</span>
            {hasActiveFilters && (
              <span className="status-badge featured">Aktívne filtre</span>
            )}
          </div>
          <span>{showFilters ? '▲' : '▼'}</span>
        </div>
        
        {showFilters && (
          <>
            <div className="filters-body">
              <div className="filter-group">
                <label>Vyhľadávanie</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Názov, EAN, SKU..."
                  value={filters.search}
                  onChange={e => handleFilterChange('search', e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Kategória</label>
                <select
                  className="filter-input"
                  value={filters.category_id}
                  onChange={e => handleFilterChange('category_id', e.target.value)}
                >
                  <option value="">Všetky kategórie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {'  '.repeat(cat.depth || 0)}{cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Stav skladu</label>
                <select
                  className="filter-input"
                  value={filters.stock_status}
                  onChange={e => handleFilterChange('stock_status', e.target.value)}
                >
                  <option value="">Všetky</option>
                  <option value="instock">Skladom</option>
                  <option value="outofstock">Nedostupné</option>
                  <option value="onbackorder">Na objednávku</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Stav produktu</label>
                <select
                  className="filter-input"
                  value={filters.is_active}
                  onChange={e => handleFilterChange('is_active', e.target.value)}
                >
                  <option value="">Všetky</option>
                  <option value="true">Aktívne</option>
                  <option value="false">Neaktívne</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Cena od (€)</label>
                <input
                  type="number"
                  className="filter-input"
                  placeholder="0"
                  value={filters.price_min}
                  onChange={e => handleFilterChange('price_min', e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Cena do (€)</label>
                <input
                  type="number"
                  className="filter-input"
                  placeholder="∞"
                  value={filters.price_max}
                  onChange={e => handleFilterChange('price_max', e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Zoradiť podľa</label>
                <select
                  className="filter-input"
                  value={filters.sort}
                  onChange={e => handleFilterChange('sort', e.target.value)}
                >
                  <option value="newest">Najnovšie</option>
                  <option value="oldest">Najstaršie</option>
                  <option value="title_asc">Názov A-Z</option>
                  <option value="title_desc">Názov Z-A</option>
                  <option value="price_asc">Cena vzostupne</option>
                  <option value="price_desc">Cena zostupne</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="active-filters">
                {filters.search && (
                  <span className="filter-tag">
                    Hľadá: {filters.search}
                    <button onClick={() => handleFilterChange('search', '')}>×</button>
                  </span>
                )}
                {filters.category_id && (
                  <span className="filter-tag">
                    Kategória: {categories.find(c => c.id === filters.category_id)?.name}
                    <button onClick={() => handleFilterChange('category_id', '')}>×</button>
                  </span>
                )}
                {filters.stock_status && (
                  <span className="filter-tag">
                    Sklad: {filters.stock_status}
                    <button onClick={() => handleFilterChange('stock_status', '')}>×</button>
                  </span>
                )}
                {filters.is_active && (
                  <span className="filter-tag">
                    {filters.is_active === 'true' ? 'Aktívne' : 'Neaktívne'}
                    <button onClick={() => handleFilterChange('is_active', '')}>×</button>
                  </span>
                )}
                <button 
                  onClick={clearFilters}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#dc2626', 
                    cursor: 'pointer',
                    fontSize: 12,
                    textDecoration: 'underline'
                  }}
                >
                  Zrušiť všetky filtre
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bulk Actions Bar */}
      <div className={`bulk-bar ${selectedIds.size > 0 ? 'has-selection' : ''}`}>
        <span className="bulk-select-info">
          {selectedIds.size > 0 
            ? `Vybraných: ${selectedIds.size} produktov`
            : 'Vyberte produkty pre hromadné akcie'
          }
        </span>
        
        <select 
          value={bulkAction} 
          onChange={e => setBulkAction(e.target.value)}
          className="filter-input"
          style={{ width: 'auto', minWidth: 180 }}
          disabled={selectedIds.size === 0}
        >
          <option value="">-- Hromadná akcia --</option>
          <option value="activate">✅ Aktivovať</option>
          <option value="deactivate">⏸️ Deaktivovať</option>
          <option value="feature">⭐ Označiť ako odporúčané</option>
          <option value="unfeature">☆ Zrušiť odporúčané</option>
          <option value="delete">🗑️ Vymazať</option>
        </select>
        
        <button 
          className="admin-btn"
          onClick={handleBulkAction}
          disabled={!bulkAction || selectedIds.size === 0 || bulkProcessing}
        >
          {bulkProcessing ? 'Spracúvam...' : 'Vykonať'}
        </button>

        {selectedIds.size > 0 && (
          <button 
            className="admin-btn admin-btn-outline"
            onClick={() => { setSelectedIds(new Set()); setSelectAll(false); }}
          >
            Zrušiť výber
          </button>
        )}
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>Žiadne produkty</h3>
          <p>
            {hasActiveFilters 
              ? 'Pre zadané filtre sa nenašli žiadne produkty.'
              : 'Zatiaľ nemáte žiadne produkty. Pridajte prvý produkt alebo importujte z feedu.'
            }
          </p>
          {hasActiveFilters ? (
            <button className="admin-btn admin-btn-outline" onClick={clearFilters}>
              Zrušiť filtre
            </button>
          ) : (
            <Link href="/admin/products/new" className="admin-btn">
              + Pridať prvý produkt
            </Link>
          )}
        </div>
      ) : (
        <>
          <table className="products-table">
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Produkt</th>
                <th>Kategória</th>
                <th>Cena</th>
                <th>Sklad</th>
                <th>Stav</th>
                <th>Vytvorené</th>
                <th>Akcie</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr 
                  key={product.id} 
                  className={selectedIds.has(product.id) ? 'selected' : ''}
                >
                  <td className="checkbox-cell">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                    />
                  </td>
                  <td>
                    <div className="product-cell">
                      <div className="product-image">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" />
                        ) : (
                          <span style={{ fontSize: 24 }}>📦</span>
                        )}
                      </div>
                      <div className="product-info">
                        <div className="product-title">
                          <Link href={`/admin/products/${product.id}`}>
                            {product.title}
                          </Link>
                          {product.is_featured && <span title="Odporúčaný">⭐</span>}
                        </div>
                        <div className="product-meta">
                          {product.ean && <span>EAN: {product.ean}</span>}
                          {product.sku && <span>SKU: {product.sku}</span>}
                          {product.brand && <span>🏷️ {product.brand}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: '#6b7280' }}>
                    {product.category_name || '-'}
                  </td>
                  <td className="price-cell">
                    {formatPrice(product.price_min)}
                    {product.price_max > product.price_min && (
                      <div className="price-range">
                        až {formatPrice(product.price_max)}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${product.stock_status}`}>
                      {product.stock_status === 'instock' && '✅ Skladom'}
                      {product.stock_status === 'outofstock' && '❌ Nedostupné'}
                      {product.stock_status === 'onbackorder' && '📦 Objednávka'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                      {product.is_active ? '✅ Aktívny' : '⏸️ Neaktívny'}
                    </span>
                  </td>
                  <td style={{ color: '#6b7280', fontSize: 13 }}>
                    {new Date(product.created_at).toLocaleDateString('sk-SK')}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <Link 
                        href={`/admin/products/${product.id}`}
                        className="action-btn primary"
                      >
                        ✏️
                      </Link>
                      <button 
                        className="action-btn"
                        onClick={() => handleDuplicateProduct(product.id)}
                        title="Duplikovať"
                      >
                        📋
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteProduct(product.id, product.title)}
                        title="Vymazať"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Zobrazené {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} z {total.toLocaleString()} produktov
              </div>
              <div className="pagination-buttons">
                <button 
                  className="pagination-btn"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  «
                </button>
                <button 
                  className="pagination-btn"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                >
                  ‹
                </button>
                
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 7) {
                    pageNum = i + 1
                  } else if (page <= 4) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i
                  } else {
                    pageNum = page - 3 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-btn ${page === pageNum ? 'active' : ''}`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                
                <button 
                  className="pagination-btn"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === totalPages}
                >
                  ›
                </button>
                <button 
                  className="pagination-btn"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
