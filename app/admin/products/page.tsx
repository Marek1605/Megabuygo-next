"use client"

import { useState, useEffect } from "react"
import { 
  Search, Plus, Filter, Edit, Trash2, Download, Upload,
  ChevronDown, ChevronLeft, ChevronRight, Check, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import type { Product } from "@/lib/types"
import { formatPrice, cn } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const limit = 20

  useEffect(() => {
    loadProducts()
  }, [page, search])

  async function loadProducts() {
    setLoading(true)
    const response = await api.getProducts({ page, limit, search: search || undefined })
    if (response.success && response.data) {
      setProducts(response.data.items || [])
      setTotal(response.data.total || 0)
    }
    setLoading(false)
  }

  const totalPages = Math.ceil(total / limit)

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(id)) newSelected.delete(id)
    else newSelected.add(id)
    setSelectedProducts(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) setSelectedProducts(new Set())
    else setSelectedProducts(new Set(products.map(p => p.id)))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produkty</h1>
          <p className="text-gray-500 mt-1">{total.toLocaleString()} produktov celkovo</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><Upload className="h-4 w-4 mr-2" />Import</Button>
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
          <Link href="/admin/products/new"><Button><Plus className="h-4 w-4 mr-2" />Pridať produkt</Button></Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Hľadať podľa názvu, EAN, SKU..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none" />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className={cn(showFilters && "border-brand-orange text-brand-orange")}>
            <Filter className="h-4 w-4 mr-2" />Filtre<ChevronDown className={cn("h-4 w-4 ml-2 transition-transform", showFilters && "rotate-180")} />
          </Button>
        </div>
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Kategória</label>
              <select className="w-full h-10 px-3 rounded-lg border border-gray-200"><option value="">Všetky</option></select></div>
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Stav</label>
              <select className="w-full h-10 px-3 rounded-lg border border-gray-200"><option value="">Všetky</option><option value="active">Aktívne</option><option value="inactive">Neaktívne</option></select></div>
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Cena od</label>
              <input type="number" placeholder="0" className="w-full h-10 px-3 rounded-lg border border-gray-200" /></div>
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Cena do</label>
              <input type="number" placeholder="10000" className="w-full h-10 px-3 rounded-lg border border-gray-200" /></div>
          </div>
        )}
      </div>

      {selectedProducts.size > 0 && (
        <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm font-medium text-brand-orange">Vybraných: {selectedProducts.size}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">Aktivovať</Button>
            <Button size="sm" variant="outline">Deaktivovať</Button>
            <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4 mr-1" />Zmazať</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-12 px-4 py-3"><input type="checkbox" checked={products.length > 0 && selectedProducts.size === products.length} onChange={toggleSelectAll} className="w-4 h-4 rounded" /></th>
                <th className="w-16 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Foto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Produkt</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Kategória</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cena</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ponuky</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stav</th>
                <th className="w-20 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-4"><div className="w-4 h-4 bg-gray-200 rounded" /></td>
                  <td className="px-4 py-4"><div className="w-12 h-12 bg-gray-200 rounded-lg" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-48" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-12" /></td>
                  <td className="px-4 py-4"><div className="h-6 bg-gray-200 rounded w-16" /></td>
                  <td className="px-4 py-4"><div className="h-8 bg-gray-200 rounded w-8" /></td>
                </tr>
              )) : products.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center">
                  <div className="text-gray-400 text-6xl mb-4">📦</div>
                  <p className="text-gray-500 font-medium">Žiadne produkty</p>
                </td></tr>
              ) : products.map((product) => (
                <tr key={product.id} className={cn("hover:bg-gray-50", selectedProducts.has(product.id) && "bg-brand-orange/5")}>
                  <td className="px-4 py-4"><input type="checkbox" checked={selectedProducts.has(product.id)} onChange={() => toggleSelect(product.id)} className="w-4 h-4 rounded" /></td>
                  <td className="px-4 py-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      {product.image_url ? <Image src={product.image_url} alt="" width={48} height={48} className="object-cover" /> : <span className="text-2xl">📦</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4"><p className="font-medium text-gray-900 line-clamp-1">{product.title}</p><p className="text-xs text-gray-500">{product.ean || "-"}</p></td>
                  <td className="px-4 py-4 text-sm text-gray-600">{product.category_name || "-"}</td>
                  <td className="px-4 py-4"><p className="font-semibold text-gray-900">{formatPrice(product.price_min)}</p>{product.price_max > product.price_min && <p className="text-xs text-gray-400">až {formatPrice(product.price_max)}</p>}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{product.offer_count}</td>
                  <td className="px-4 py-4"><span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium", product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600")}>{product.is_active ? <><Check className="h-3 w-3" />Aktívny</> : <><X className="h-3 w-3" />Neaktívny</>}</span></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/products/${product.id}`}><Button size="icon" variant="ghost" className="h-8 w-8"><Edit className="h-4 w-4" /></Button></Link>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">Zobrazené {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} z {total}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="h-4 w-4" /></Button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => (<Button key={i+1} variant={page === i+1 ? "default" : "outline"} size="sm" onClick={() => setPage(i+1)} className="w-9">{i+1}</Button>))}
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
