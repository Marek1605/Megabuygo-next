import Link from "next/link"
import { ShoppingBag, Search, ArrowRight, Zap, Shield, TrendingUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

// Mock featured products
const featuredProducts = [
  { id: "1", title: "iPhone 15 Pro Max", slug: "iphone-15-pro-max", price_min: 1249, price_max: 1449, offer_count: 12, category: "Mobilné telefóny" },
  { id: "2", title: "Samsung Galaxy S24 Ultra", slug: "samsung-galaxy-s24-ultra", price_min: 1199, price_max: 1399, offer_count: 8, category: "Mobilné telefóny" },
  { id: "3", title: "MacBook Air M3", slug: "macbook-air-m3", price_min: 1299, price_max: 1499, offer_count: 6, category: "Notebooky" },
  { id: "4", title: "Sony WH-1000XM5", slug: "sony-wh-1000xm5", price_min: 299, price_max: 379, offer_count: 15, category: "Slúchadlá" },
]

const categories = [
  { name: "Mobilné telefóny", slug: "mobilne-telefony", count: 2450, icon: "📱" },
  { name: "Notebooky", slug: "notebooky", count: 1820, icon: "💻" },
  { name: "Televízory", slug: "televizory", count: 980, icon: "📺" },
  { name: "Slúchadlá", slug: "sluchadla", count: 1560, icon: "🎧" },
  { name: "Herné konzoly", slug: "herne-konzoly", count: 340, icon: "🎮" },
  { name: "Fotoaparáty", slug: "fotoaparaty", count: 720, icon: "📷" },
]

function formatPrice(price: number) {
  return new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(price)
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-brand-orange-dark flex items-center justify-center shadow-lg shadow-brand-orange/20">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold">
                <span className="text-brand-navy">Mega</span>
                <span className="text-brand-orange">Buy</span>
              </span>
            </Link>
            
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Hľadať produkty..."
                  className="w-full h-11 pl-4 pr-12 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-orange outline-none transition-all"
                />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange-dark">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <Link href="/admin">
              <Button variant="outline">Admin</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-navy via-brand-navy-light to-brand-navy">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-sm px-4 py-2 rounded-full mb-6">
              <Zap className="h-4 w-4 text-brand-orange" />
              <span>Porovnávame <strong className="text-white">2,4 milióna</strong> produktov</span>
            </div>
            
            <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
              Nájdite{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-yellow-400">
                najlepšiu cenu
              </span>
              <br />na Slovensku
            </h1>
            
            <p className="text-lg text-white/70 mb-8">
              Porovnajte ceny z viac ako 500 overených slovenských e-shopov. 
            </p>
            
            <Button size="xl" className="group">
              Začať porovnávať
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="grid grid-cols-4 gap-4">
            {[
              { value: "500+", label: "E-shopov", icon: Users },
              { value: "2.4M", label: "Produktov", icon: TrendingUp },
              { value: "99.9%", label: "Dostupnosť", icon: Shield },
              { value: "24/7", label: "Aktualizácie", icon: Zap },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10">
                <stat.icon className="h-6 w-6 text-brand-orange mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Kategórie</h2>
        <div className="grid grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/kategoria/${cat.slug}`}
              className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-brand-orange/30 hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-3">{cat.icon}</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-brand-orange transition-colors">
                {cat.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{cat.count.toLocaleString()} produktov</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Najlepšie ponuky</h2>
        <div className="grid grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/produkt/${product.slug}`}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center text-6xl">
                📦
              </div>
              <div className="p-4">
                <span className="text-xs font-medium text-brand-orange">{product.category}</span>
                <h3 className="font-semibold text-gray-900 mt-1 group-hover:text-brand-orange transition-colors">
                  {product.title}
                </h3>
                <div className="mt-3 flex items-end justify-between">
                  <div className="text-lg font-bold text-brand-navy">{formatPrice(product.price_min)}</div>
                  <span className="text-xs text-gray-500">{product.offer_count} ponúk</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">© 2024 MegaBuy.sk. Všetky práva vyhradené.</p>
        </div>
      </footer>
    </div>
  )
}
