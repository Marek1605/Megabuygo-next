'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  children?: Category[]
}

interface HeaderProps {
  categories?: Category[]
}

export function Header({ categories = [] }: HeaderProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [visibleCount, setVisibleCount] = useState(12)
  const categoryBarRef = useRef<HTMLDivElement>(null)

  // Calculate how many categories fit
  useEffect(() => {
    function calculateVisibleCategories() {
      if (categoryBarRef.current) {
        const containerWidth = categoryBarRef.current.offsetWidth - 150 // Reserve space for "More" button
        const avgCategoryWidth = 140 // Average width per category
        const count = Math.floor(containerWidth / avgCategoryWidth)
        setVisibleCount(Math.max(6, Math.min(count, 12)))
      }
    }

    calculateVisibleCategories()
    window.addEventListener('resize', calculateVisibleCategories)
    return () => window.removeEventListener('resize', calculateVisibleCategories)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/hladanie?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const visibleCategories = categories.slice(0, visibleCount)
  const hiddenCategories = categories.slice(visibleCount)

  return (
    <>
      <style jsx global>{`
        /* Header Styles */
        .header { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.06); position: sticky; top: 0; z-index: 100; }
        
        /* Top Bar */
        .header-top { border-bottom: 1px solid #f0f0f0; }
        .header-top-inner { max-width: 1400px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; height: 56px; }
        
        /* Logo */
        .header-logo { font-size: 24px; font-weight: 800; color: #1e3a5f; text-decoration: none; }
        .header-logo span { color: #ff6b35; }
        
        /* Search */
        .header-search { flex: 1; max-width: 600px; margin: 0 40px; }
        .header-search form { display: flex; background: #f5f5f5; border-radius: 12px; overflow: hidden; border: 2px solid transparent; transition: all 0.2s; }
        .header-search form:focus-within { border-color: #ff6b35; background: #fff; }
        .header-search input { flex: 1; padding: 12px 16px; border: none; background: transparent; font-size: 15px; outline: none; }
        .header-search button { padding: 12px 24px; background: #ff6b35; color: #fff; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .header-search button:hover { background: #e55a2b; }
        
        /* Nav Icons */
        .header-nav { display: flex; align-items: center; gap: 8px; }
        .header-nav-item { display: flex; flex-direction: column; align-items: center; padding: 8px 12px; color: #4b5563; text-decoration: none; font-size: 11px; border-radius: 8px; transition: all 0.2s; }
        .header-nav-item:hover { background: #f5f5f5; color: #ff6b35; }
        .header-nav-item span:first-child { font-size: 20px; margin-bottom: 2px; }
        
        /* Mobile Menu Toggle */
        .mobile-menu-btn { display: none; padding: 8px; background: none; border: none; font-size: 24px; cursor: pointer; }
        
        /* Category Bar */
        .category-bar { background: #fff; border-bottom: 1px solid #f0f0f0; }
        .category-bar-inner { max-width: 1400px; margin: 0 auto; padding: 0 20px; display: flex; align-items: center; height: 48px; gap: 4px; overflow: hidden; position: relative; }
        .category-link { display: flex; align-items: center; gap: 6px; padding: 8px 14px; color: #374151; text-decoration: none; font-size: 13px; font-weight: 500; border-radius: 8px; white-space: nowrap; transition: all 0.2s; }
        .category-link:hover { background: #fff5f0; color: #ff6b35; }
        .category-link-icon { font-size: 16px; }
        
        /* More Categories Button */
        .more-categories-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #f5f5f5; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; color: #374151; cursor: pointer; white-space: nowrap; margin-left: auto; }
        .more-categories-btn:hover { background: #ff6b35; color: #fff; }
        
        /* Categories Dropdown */
        .categories-dropdown { position: absolute; top: 100%; right: 20px; background: #fff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); padding: 20px; min-width: 400px; max-height: 500px; overflow-y: auto; z-index: 200; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .categories-dropdown-item { display: flex; align-items: center; gap: 10px; padding: 12px 16px; color: #374151; text-decoration: none; font-size: 14px; border-radius: 10px; transition: all 0.2s; }
        .categories-dropdown-item:hover { background: #fff5f0; color: #ff6b35; }
        .categories-dropdown-icon { font-size: 20px; }
        .categories-dropdown-count { font-size: 12px; color: #9ca3af; margin-left: auto; }
        
        /* Overlay */
        .dropdown-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3); z-index: 150; }
        
        /* Mobile Menu */
        .mobile-menu { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #fff; z-index: 200; overflow-y: auto; transform: translateX(-100%); transition: transform 0.3s; }
        .mobile-menu.open { transform: translateX(0); }
        .mobile-menu-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
        .mobile-menu-close { background: none; border: none; font-size: 28px; cursor: pointer; }
        .mobile-menu-search { padding: 16px 20px; }
        .mobile-menu-search form { display: flex; background: #f5f5f5; border-radius: 12px; overflow: hidden; }
        .mobile-menu-search input { flex: 1; padding: 14px 16px; border: none; background: transparent; font-size: 16px; outline: none; }
        .mobile-menu-search button { padding: 14px 20px; background: #ff6b35; color: #fff; border: none; }
        .mobile-menu-categories { padding: 16px 20px; }
        .mobile-menu-title { font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; margin-bottom: 12px; }
        .mobile-menu-item { display: flex; align-items: center; gap: 12px; padding: 14px 0; color: #374151; text-decoration: none; font-size: 16px; border-bottom: 1px solid #f5f5f5; }
        .mobile-menu-item:hover { color: #ff6b35; }
        
        @media (max-width: 900px) {
          .header-search { display: none; }
          .header-nav { display: none; }
          .mobile-menu-btn { display: block; }
          .category-bar { display: none; }
        }
      `}</style>

      <header className="header">
        {/* Top Bar */}
        <div className="header-top">
          <div className="header-top-inner">
            <Link href="/" className="header-logo">
              Mega<span>Buy</span>
            </Link>

            <div className="header-search">
              <form onSubmit={handleSearch}>
                <input 
                  type="text" 
                  placeholder="Hľadaj produkt, značku..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <button type="submit">
                  🔍 Hľadať
                </button>
              </form>
            </div>

            <nav className="header-nav">
              <Link href="/pre-predajcov" className="header-nav-item">
                <span>🏪</span>
                Pre predajcov
              </Link>
              <Link href="/ucet" className="header-nav-item">
                <span>👤</span>
                Môj účet
              </Link>
              <Link href="/oblubene" className="header-nav-item">
                <span>❤️</span>
                Obľúbené
              </Link>
              <Link href="/porovnanie" className="header-nav-item">
                <span>⚖️</span>
                Porovnať
              </Link>
              <Link href="/kosik" className="header-nav-item">
                <span>🛒</span>
                Košík
              </Link>
            </nav>

            <button className="mobile-menu-btn" onClick={() => setShowMobileMenu(true)}>
              ☰
            </button>
          </div>
        </div>

        {/* Category Bar */}
        <div className="category-bar">
          <div className="category-bar-inner" ref={categoryBarRef}>
            {visibleCategories.map(cat => (
              <Link key={cat.id} href={`/kategoria/${cat.slug}`} className="category-link">
                <span className="category-link-icon">{cat.icon || '📦'}</span>
                {cat.name}
              </Link>
            ))}
            
            {hiddenCategories.length > 0 && (
              <button 
                className="more-categories-btn"
                onClick={() => setShowAllCategories(!showAllCategories)}
              >
                ☰ Všetky kategórie ({categories.length})
              </button>
            )}
          </div>

          {/* Categories Dropdown */}
          {showAllCategories && (
            <>
              <div className="dropdown-overlay" onClick={() => setShowAllCategories(false)} />
              <div className="categories-dropdown">
                {categories.map(cat => (
                  <Link 
                    key={cat.id} 
                    href={`/kategoria/${cat.slug}`} 
                    className="categories-dropdown-item"
                    onClick={() => setShowAllCategories(false)}
                  >
                    <span className="categories-dropdown-icon">{cat.icon || '📦'}</span>
                    {cat.name}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${showMobileMenu ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <Link href="/" className="header-logo" onClick={() => setShowMobileMenu(false)}>
            Mega<span>Buy</span>
          </Link>
          <button className="mobile-menu-close" onClick={() => setShowMobileMenu(false)}>×</button>
        </div>
        
        <div className="mobile-menu-search">
          <form onSubmit={e => { handleSearch(e); setShowMobileMenu(false); }}>
            <input 
              type="text" 
              placeholder="Hľadaj produkt..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit">🔍</button>
          </form>
        </div>

        <div className="mobile-menu-categories">
          <div className="mobile-menu-title">Kategórie</div>
          {categories.map(cat => (
            <Link 
              key={cat.id} 
              href={`/kategoria/${cat.slug}`} 
              className="mobile-menu-item"
              onClick={() => setShowMobileMenu(false)}
            >
              <span>{cat.icon || '📦'}</span>
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
