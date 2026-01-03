"use client"

import Link from "next/link"
import { useState } from "react"
import { Search, Menu, X, ShoppingBag, ChevronDown, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const categories = [
    { name: "Elektronika", slug: "elektronika" },
    { name: "Počítače", slug: "pocitace" },
    { name: "Mobily", slug: "mobily" },
    { name: "TV & Audio", slug: "tv-audio" },
    { name: "Domácnosť", slug: "domacnost" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="bg-brand-navy text-white/90 py-1.5 text-sm hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <p className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-brand-orange" />
            <span>Porovnávame ceny z <strong className="text-white">500+</strong> obchodov</span>
          </p>
          <div className="flex gap-6">
            <Link href="/o-nas" className="hover:text-white transition-colors">O nás</Link>
            <Link href="/pre-obchody" className="hover:text-white transition-colors">Pre obchody</Link>
            <Link href="/kontakt" className="hover:text-white transition-colors">Kontakt</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-brand-orange to-brand-orange-dark flex items-center justify-center shadow-lg shadow-brand-orange/20 group-hover:shadow-brand-orange/40 transition-shadow">
                <ShoppingBag className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-extrabold tracking-tight">
                  <span className="text-brand-navy">Mega</span>
                  <span className="text-brand-orange">Buy</span>
                </span>
                <span className="text-[10px] md:text-xs text-gray-500 -mt-1 tracking-wide">POROVNÁVAČ CIEN</span>
              </div>
            </Link>

            {/* Search bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hľadať produkty, značky, kategórie..."
                  className="w-full h-12 pl-5 pr-14 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 transition-all outline-none text-gray-800 placeholder:text-gray-400"
                />
                <Button 
                  size="icon" 
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg h-9 w-9"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <Link href="/admin" className="hidden md:block">
                <Button variant="outline" size="sm">
                  Admin
                </Button>
              </Link>
              <button 
                className="md:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Categories nav */}
          <nav className="hidden md:flex items-center gap-1 py-2 -mx-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/kategoria/${cat.slug}`}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-brand-orange hover:bg-brand-orange/5 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-brand-orange hover:bg-brand-orange/5 transition-colors flex items-center gap-1">
              Všetky kategórie
              <ChevronDown className="h-4 w-4" />
            </button>
          </nav>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hľadať produkty..."
              className="w-full h-11 pl-4 pr-12 rounded-xl border-2 border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-orange transition-all outline-none"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 animate-slide-in">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/kategoria/${cat.slug}`}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
              <hr className="my-2" />
              <Link
                href="/admin"
                className="px-4 py-3 rounded-lg text-sm font-medium text-brand-orange hover:bg-brand-orange/5"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin panel
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
