import { Header } from "@/components/Header"
import { ProductCard } from "@/components/ProductCard"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Shield, TrendingUp, Users, ChevronRight } from "lucide-react"
import Link from "next/link"

// Mock data - v produkcii by sa načítalo z API
const featuredProducts = [
  {
    id: "1",
    title: "iPhone 15 Pro Max 256GB",
    slug: "iphone-15-pro-max-256gb",
    image_url: "https://via.placeholder.com/400x400/f8f8f8/666?text=iPhone+15",
    price_min: 1249,
    price_max: 1449,
    offer_count: 12,
    is_active: true,
    category_id: "1",
    category_name: "Mobilné telefóny",
    brand_name: "Apple",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Samsung Galaxy S24 Ultra",
    slug: "samsung-galaxy-s24-ultra",
    image_url: "https://via.placeholder.com/400x400/f8f8f8/666?text=Galaxy+S24",
    price_min: 1199,
    price_max: 1399,
    offer_count: 8,
    is_active: true,
    category_id: "1",
    category_name: "Mobilné telefóny",
    brand_name: "Samsung",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "MacBook Air M3 15\"",
    slug: "macbook-air-m3-15",
    image_url: "https://via.placeholder.com/400x400/f8f8f8/666?text=MacBook+Air",
    price_min: 1549,
    price_max: 1699,
    offer_count: 6,
    is_active: true,
    category_id: "2",
    category_name: "Notebooky",
    brand_name: "Apple",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Sony WH-1000XM5",
    slug: "sony-wh-1000xm5",
    image_url: "https://via.placeholder.com/400x400/f8f8f8/666?text=Sony+XM5",
    price_min: 299,
    price_max: 379,
    offer_count: 15,
    is_active: true,
    category_id: "3",
    category_name: "Slúchadlá",
    brand_name: "Sony",
    created_at: new Date().toISOString(),
  },
]

const categories = [
  { name: "Mobilné telefóny", slug: "mobilne-telefony", count: 2450, icon: "📱" },
  { name: "Notebooky", slug: "notebooky", count: 1820, icon: "💻" },
  { name: "Televízory", slug: "televizory", count: 980, icon: "📺" },
  { name: "Slúchadlá", slug: "sluchadla", count: 1560, icon: "🎧" },
  { name: "Herné konzoly", slug: "herne-konzoly", count: 340, icon: "🎮" },
  { name: "Fotoaparáty", slug: "fotoaparaty", count: 720, icon: "📷" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      
      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-navy via-brand-navy-light to-brand-navy">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/50 to-transparent" />
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm px-4 py-2 rounded-full mb-6">
              <Zap className="h-4 w-4 text-brand-orange" />
              <span>Aktuálne porovnávame <strong className="text-white">2,4 milióna</strong> produktov</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
              Nájdite{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-yellow-400">
                najlepšiu cenu
              </span>
              <br />na Slovensku
            </h1>
            
            <p className="text-lg md:text-xl text-white/70 mt-6 max-w-xl">
              Porovnajte ceny z viac ako 500 overených slovenských a českých e-shopov. 
              Ušetrite čas aj peniaze.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-8">
              <Button size="xl" className="group">
                Začať porovnávať
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="xl" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Pre obchody
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container mx-auto px-4 pb-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "500+", label: "E-shopov", icon: Users },
              { value: "2.4M", label: "Produktov", icon: TrendingUp },
              { value: "99.9%", label: "Dostupnosť", icon: Shield },
              { value: "24/7", label: "Aktualizácie", icon: Zap },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/10">
                <stat.icon className="h-6 w-6 text-brand-orange mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Kategórie</h2>
          <Link href="/kategorie" className="text-brand-orange font-medium flex items-center gap-1 hover:gap-2 transition-all">
            Všetky kategórie
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/kategoria/${cat.slug}`}
              className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-brand-orange/30 hover:shadow-lg hover:shadow-brand-orange/5 transition-all"
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

      {/* Featured products */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Najlepšie ponuky</h2>
            <p className="text-gray-500 mt-1">Produkty s najväčšími zľavami</p>
          </div>
          <Link href="/ponuky" className="text-brand-orange font-medium flex items-center gap-1 hover:gap-2 transition-all">
            Všetky ponuky
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product, i) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              featured={i === 0}
            />
          ))}
        </div>
      </section>

      {/* CTA for vendors */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="relative bg-gradient-to-br from-brand-navy to-brand-navy-light rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('/dots.svg')] opacity-20" />
          <div className="relative p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-2xl md:text-4xl font-bold text-white">
                Predávate online?
              </h2>
              <p className="text-white/70 mt-4 text-lg max-w-lg">
                Pridajte svoje produkty do nášho porovnávača a získajte tisíce nových zákazníkov. 
                Platíte len za kliknutia.
              </p>
              <div className="flex flex-wrap gap-4 mt-6">
                <Button size="lg" className="bg-white text-brand-navy hover:bg-gray-100">
                  Registrovať obchod
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Zistiť viac
                </Button>
              </div>
            </div>
            <div className="flex-shrink-0 text-8xl md:text-9xl">
              🚀
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-orange flex items-center justify-center">
                  <span className="text-white font-bold">MB</span>
                </div>
                <span className="text-xl font-bold">MegaBuy</span>
              </div>
              <p className="text-gray-400 text-sm">
                Najväčší slovenský porovnávač cien. Porovnávame milióny produktov z 500+ obchodov.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Kategórie</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/kategoria/elektronika" className="hover:text-white">Elektronika</Link></li>
                <li><Link href="/kategoria/pocitace" className="hover:text-white">Počítače</Link></li>
                <li><Link href="/kategoria/mobily" className="hover:text-white">Mobily</Link></li>
                <li><Link href="/kategoria/domacnost" className="hover:text-white">Domácnosť</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Pre obchody</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/registracia" className="hover:text-white">Registrácia</Link></li>
                <li><Link href="/cennik" className="hover:text-white">Cenník</Link></li>
                <li><Link href="/xml-feed" className="hover:text-white">XML Feed</Link></li>
                <li><Link href="/podpora" className="hover:text-white">Podpora</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Informácie</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/o-nas" className="hover:text-white">O nás</Link></li>
                <li><Link href="/kontakt" className="hover:text-white">Kontakt</Link></li>
                <li><Link href="/ochrana-udajov" className="hover:text-white">Ochrana údajov</Link></li>
                <li><Link href="/podmienky" className="hover:text-white">Podmienky</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2024 MegaBuy.sk. Všetky práva vyhradené.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
              <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
