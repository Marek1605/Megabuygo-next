"use client"
import { useState } from "react"
import { Search, Plus, Store, CreditCard, MoreHorizontal, Check, X, Mail, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, formatPrice } from "@/lib/utils"
import Link from "next/link"

const mockVendors = [
  { id: "1", company_name: "Alza.sk", email: "partner@alza.sk", website: "https://alza.sk", status: "active", credit_balance: 1250.00, default_cpc: 0.15, products: 12450 },
  { id: "2", company_name: "Mall.sk", email: "vendor@mall.sk", website: "https://mall.sk", status: "active", credit_balance: 890.50, default_cpc: 0.12, products: 8920 },
  { id: "3", company_name: "Datart.sk", email: "shop@datart.sk", website: "https://datart.sk", status: "pending", credit_balance: 0, default_cpc: 0.10, products: 0 },
]

export default function VendorsPage() {
  const [vendors] = useState(mockVendors)
  const [search, setSearch] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendori</h1>
          <p className="text-gray-500 mt-1">{vendors.length} registrovaných obchodov</p>
        </div>
        <Link href="/admin/vendors/new"><Button><Plus className="h-4 w-4 mr-2" />Pridať vendora</Button></Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Hľadať vendorov..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 focus:border-brand-orange outline-none" />
        </div>
      </div>

      <div className="grid gap-4">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-brand-orange/10 flex items-center justify-center">
                  <Store className="h-7 w-7 text-brand-orange" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{vendor.company_name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{vendor.email}</span>
                    {vendor.website && <a href={vendor.website} className="flex items-center gap-1 text-brand-orange hover:underline"><Globe className="h-3.5 w-3.5" />Web</a>}
                  </div>
                </div>
              </div>
              <span className={cn("px-3 py-1 rounded-full text-xs font-medium", vendor.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                {vendor.status === "active" ? "Aktívny" : "Čaká na schválenie"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-5 pt-5 border-t border-gray-100">
              <div><p className="text-sm text-gray-500">Kredit</p><p className="text-xl font-bold text-gray-900">{formatPrice(vendor.credit_balance)}</p></div>
              <div><p className="text-sm text-gray-500">CPC sadzba</p><p className="text-xl font-bold text-gray-900">{formatPrice(vendor.default_cpc)}</p></div>
              <div><p className="text-sm text-gray-500">Produkty</p><p className="text-xl font-bold text-gray-900">{vendor.products.toLocaleString()}</p></div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm"><CreditCard className="h-4 w-4 mr-1" />Pridať kredit</Button>
              <Link href={`/admin/vendors/${vendor.id}`}><Button variant="outline" size="sm">Upraviť</Button></Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
