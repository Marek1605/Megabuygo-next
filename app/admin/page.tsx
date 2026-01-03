"use client"

import { useState, useEffect } from "react"
import { 
  Package, 
  Store, 
  FolderTree, 
  MousePointerClick, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Euro,
  Activity,
  Clock,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Mock data
const stats = [
  { 
    name: "Produkty", 
    value: "24,589", 
    change: "+12.5%", 
    trend: "up",
    icon: Package,
    color: "bg-blue-500"
  },
  { 
    name: "Vendori", 
    value: "156", 
    change: "+3.2%", 
    trend: "up",
    icon: Store,
    color: "bg-emerald-500"
  },
  { 
    name: "Kategórie", 
    value: "89", 
    change: "+2", 
    trend: "up",
    icon: FolderTree,
    color: "bg-violet-500"
  },
  { 
    name: "Kliky dnes", 
    value: "1,847", 
    change: "-5.1%", 
    trend: "down",
    icon: MousePointerClick,
    color: "bg-amber-500"
  },
]

const recentActivity = [
  { type: "import", message: "Heureka feed - 1,245 produktov importovaných", time: "2 min" },
  { type: "vendor", message: "Nový vendor: Alza.sk", time: "15 min" },
  { type: "click", message: "Dosiahnutých 10,000 klikov tento mesiac", time: "1 hod" },
  { type: "product", message: "iPhone 15 Pro - aktualizovaná cena", time: "2 hod" },
  { type: "error", message: "Mall.sk feed - chyba importu", time: "3 hod" },
]

const topProducts = [
  { name: "iPhone 15 Pro Max", clicks: 342, revenue: 68.40 },
  { name: "Samsung Galaxy S24", clicks: 289, revenue: 57.80 },
  { name: "MacBook Air M3", clicks: 234, revenue: 46.80 },
  { name: "Sony WH-1000XM5", clicks: 198, revenue: 39.60 },
  { name: "iPad Pro 12.9", clicks: 156, revenue: 31.20 },
]

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulácia načítania
    setTimeout(() => setLoading(false), 500)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Vitajte späť, Marek! Tu je prehľad vašej platformy.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            Exportovať
          </Button>
          <Button>
            + Pridať produkt
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === "up" ? "text-emerald-600" : "text-red-600"
              }`}>
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue card */}
      <div className="bg-gradient-to-br from-brand-navy to-brand-navy-light rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-white/60 text-sm">Celkové tržby (CPC)</p>
            <p className="text-4xl font-bold mt-1">€12,847.50</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                +18.2%
              </span>
              <span className="text-white/40 text-sm">oproti minulému mesiacu</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 md:gap-12">
            <div>
              <p className="text-white/60 text-sm">Dnes</p>
              <p className="text-2xl font-bold">€247.80</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Tento týždeň</p>
              <p className="text-2xl font-bold">€1,847.20</p>
            </div>
            <div>
              <p className="text-white/60 text-sm">Tento mesiac</p>
              <p className="text-2xl font-bold">€8,492.00</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Posledná aktivita</h2>
            <Link href="/admin/activity" className="text-sm text-brand-orange font-medium hover:underline">
              Zobraziť všetko
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  item.type === "import" ? "bg-blue-100 text-blue-600" :
                  item.type === "vendor" ? "bg-emerald-100 text-emerald-600" :
                  item.type === "click" ? "bg-amber-100 text-amber-600" :
                  item.type === "product" ? "bg-violet-100 text-violet-600" :
                  "bg-red-100 text-red-600"
                }`}>
                  {item.type === "import" && <Activity className="h-4 w-4" />}
                  {item.type === "vendor" && <Store className="h-4 w-4" />}
                  {item.type === "click" && <MousePointerClick className="h-4 w-4" />}
                  {item.type === "product" && <Package className="h-4 w-4" />}
                  {item.type === "error" && <AlertCircle className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{item.message}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    pred {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top produkty (kliky)</h2>
            <Link href="/admin/products" className="text-sm text-brand-orange font-medium hover:underline">
              Zobraziť všetko
            </Link>
          </div>
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-sm font-medium flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{product.clicks} klikov</p>
                  <p className="text-xs text-emerald-600">€{product.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rýchle akcie</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/admin/products/new">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <Package className="h-5 w-5" />
              <span>Pridať produkt</span>
            </Button>
          </Link>
          <Link href="/admin/vendors/new">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <Store className="h-5 w-5" />
              <span>Pridať vendora</span>
            </Button>
          </Link>
          <Link href="/admin/feeds/new">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <Activity className="h-5 w-5" />
              <span>Nový feed</span>
            </Button>
          </Link>
          <Link href="/admin/imports">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
              <Clock className="h-5 w-5" />
              <span>Spustiť import</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
