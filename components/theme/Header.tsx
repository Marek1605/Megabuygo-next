'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Category } from '@/lib/types'

interface HeaderProps {
  categories: Category[]
}

export function Header({ categories }: HeaderProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [activeCatId, setActiveCatId] = useState<string | null>(null)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [compareCount, setCompareCount] = useState(0)
  const [cartCount, setCartCount] = useState(0)
  const catListRef = useRef<HTMLDivElement>(null)

  // Badge counts from localStorage
  useEffect(() => {
    const updateBadges = () => {
      try {
        const wishlist = JSON.parse(localStorage.getItem('mp_wishlist') || '[]')
        const compare = JSON.parse(localStorage.getItem('mp_compare') || '[]')
        setWishlistCount(wishlist.length)
        setCompareCount(compare.length)
      } catch {}
    }
    updateBadges()
    window.addEventListener('storage', updateBadges)
    return () => window.removeEventListener('storage', updateBadges)
  }, [])

  // Scroll handler - show collapsed header
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsCollapsed(window.scrollY > 200)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Mobile scroll categories
  const scrollCats = (direction: 'left' | 'right') => {
    if (catListRef.current) {
      catListRef.current.scrollBy({ 
        left: direction === 'left' ? -150 : 150, 
        behavior: 'smooth' 
      })
    }
  }

  // Open mega menu
  const openMega = (catId: string) => {
    if (activeCatId === catId && megaOpen) {
      setMegaOpen(false)
      setActiveCatId(null)
    } else {
      setActiveCatId(catId)
      setMegaOpen(true)
    }
  }

  const closeMega = () => {
    setMegaOpen(false)
    setActiveCatId(null)
  }

  const activeCategory = categories.find(c => c.id === activeCatId)

  return (
    <>
      <style jsx global>{`
        /* === BASE === */
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1f2937; line-height: 1.6; }
        a { text-decoration: none; color: inherit; }
        img { max-width: 100%; height: auto; }
        button { cursor: pointer; font-family: inherit; }

        /* === HEADER === */
        .mp-header { background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.06); position: relative; z-index: 1000; }
        .mp-header__inner { display: flex; align-items: center; gap: 24px; padding: 12px 20px; max-width: 1400px; margin: 0 auto; }
        .mp-header__logo { flex-shrink: 0; }
        .mp-header__logo-text { font-size: 24px; font-weight: 700; color: #ff6b35; }
        .mp-search { flex: 1; max-width: 600px; margin: 0 auto; }
        .mp-search__form { display: flex; }
        .mp-search__input { flex: 1; padding: 12px 20px; border: 2px solid #e5e7eb; border-right: none; border-radius: 10px 0 0 10px; font-size: 15px; outline: none; }
        .mp-search__input:focus { border-color: #ff6b35; }
        .mp-search__btn { padding: 12px 24px; background: #ff6b35; border: none; border-radius: 0 10px 10px 0; color: #fff; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; }
        .mp-search__btn:hover { background: #e55a2b; }
        .mp-header__actions { display: flex; gap: 8px; flex-shrink: 0; }
        .mp-header__action { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 12px; border-radius: 10px; color: #4b5563; font-size: 11px; font-weight: 500; }
        .mp-header__action:hover { background: #f3f4f6; color: #ff6b35; }
        .mp-header__action-icon { position: relative; }
        .mp-header__action-badge { position: absolute; top: -6px; right: -6px; background: #ff6b35; color: #fff; font-size: 10px; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

        /* === KATEGÓRIE === */
        .mp-catnav { background: #fff; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; z-index: 998; }
        .mp-catnav__inner { display: flex; align-items: center; gap: 0; max-width: 100%; margin: 0; padding: 0 20px; position: relative; }
        .mp-catnav__list { display: flex; gap: 0; flex: 1; overflow-x: auto; scrollbar-width: none; }
        .mp-catnav__list::-webkit-scrollbar { display: none; }
        .mp-catnav__item { display: flex; align-items: center; gap: 6px; padding: 12px 14px; color: #1f2937; font-weight: 600; font-size: 13px; white-space: nowrap; transition: all 0.2s; border-bottom: 3px solid transparent; cursor: pointer; }
        .mp-catnav__item:hover, .mp-catnav__item.is-active { background: #fff5f0; color: #ff6b35; border-bottom-color: #ff6b35; }
        .mp-catnav__item-icon { width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .mp-catnav__hamburger { display: none; align-items: center; justify-content: center; width: 40px; height: 40px; background: #f3f4f6; border: none; border-radius: 8px; color: #374151; }
        .mp-catnav.is-collapsed .mp-catnav__hamburger { display: flex; }
        .mp-catnav__right { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; gap: 12px; padding-left: 12px; border-left: 1px solid #e5e7eb; background: #fff; opacity: 0; visibility: hidden; pointer-events: none; transition: all 0.3s ease; }
        .mp-catnav.is-collapsed .mp-catnav__right { opacity: 1; visibility: visible; pointer-events: auto; }
        .mp-catnav__search-form { display: flex; align-items: center; }
        .mp-catnav__search-input { width: 120px; padding: 8px 12px; border: 2px solid #e5e7eb; border-right: none; border-radius: 8px 0 0 8px; font-size: 12px; outline: none; }
        .mp-catnav__search-btn { padding: 8px 12px; background: #ff6b35; border: none; border-radius: 0 8px 8px 0; color: #fff; }
        .mp-catnav__action { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; color: #4b5563; position: relative; }
        .mp-catnav__action:hover { background: #f3f4f6; color: #ff6b35; }
        .mp-catnav__action-badge { position: absolute; top: -4px; right: -4px; background: #ff6b35; color: #fff; font-size: 9px; font-weight: 600; min-width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .mp-catnav__arrow { display: none; }

        /* === MEGA MENU === */
        .mp-mega { position: absolute; left: 0; right: 0; top: 100%; background: #fff; box-shadow: 0 15px 40px rgba(0,0,0,0.15); z-index: 998; display: none; border-top: 1px solid #e5e7eb; }
        .mp-mega.is-open { display: block; }
        .mp-mega__header { display: none; }
        .mp-mega__footer { display: none; }
        .mp-mega__inner { max-width: 1400px; margin: 0 auto; padding: 24px 20px; max-height: 60vh; overflow-y: auto; }
        .mp-mega__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .mp-mega__col { }
        .mp-mega__main { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8fafc; border-radius: 12px; margin-bottom: 12px; transition: all 0.2s; }
        .mp-mega__main:hover { background: #fff5f0; }
        .mp-mega__img { width: 56px; height: 56px; border-radius: 10px; object-fit: cover; background: #e5e7eb; }
        .mp-mega__img-placeholder { width: 56px; height: 56px; border-radius: 10px; background: linear-gradient(135deg, #f3f4f6, #e5e7eb); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: #9ca3af; }
        .mp-mega__title { font-weight: 700; font-size: 15px; color: #1f2937; }
        .mp-mega__main:hover .mp-mega__title { color: #ff6b35; }
        .mp-mega__links { list-style: none; margin: 0; padding: 0 0 0 12px; }
        .mp-mega__links li { margin-bottom: 6px; }
        .mp-mega__links a { font-size: 13px; color: #6b7280; display: flex; align-items: center; gap: 6px; padding: 4px 0; }
        .mp-mega__links a::before { content: '›'; color: #d1d5db; }
        .mp-mega__links a:hover { color: #ff6b35; }

        /* === MOBILE === */
        @media (max-width: 768px) {
          .mp-header__inner { flex-wrap: wrap; gap: 6px; padding: 8px 12px; }
          .mp-header__actions { margin-left: auto; }
          .mp-header__action { padding: 6px; width: 36px; height: 36px; }
          .mp-header__action > span:last-child { display: none; }
          .mp-search { order: 3; flex: 0 0 100%; max-width: 100%; margin-top: 4px; }
          .mp-search__input { padding: 8px 12px; font-size: 13px; border-radius: 20px 0 0 20px; }
          .mp-search__btn { padding: 8px 14px; border-radius: 0 20px 20px 0; }
          .mp-search__btn span { display: none; }
          .mp-catnav__arrow { position: absolute; top: 0; bottom: 0; width: 32px; display: flex; align-items: center; justify-content: center; background: linear-gradient(90deg, #fff 60%, transparent); color: #6b7280; cursor: pointer; z-index: 5; border: none; font-size: 18px; }
          .mp-catnav__arrow--left { left: 0; }
          .mp-catnav__arrow--right { right: 0; background: linear-gradient(-90deg, #fff 60%, transparent); }
          .mp-catnav__list { padding: 0 32px; }
          .mp-catnav__item { padding: 8px 10px; font-size: 11px; gap: 5px; }
          .mp-catnav__hamburger { display: none !important; }
          .mp-catnav__right { display: none !important; }
          .mp-mega { position: fixed; left: 0; right: 0; top: 90px; bottom: 0; background: rgba(0,0,0,0.5); }
          .mp-mega__panel { position: absolute; left: 0; right: 0; top: 0; max-height: 60vh; background: #fff; border-radius: 0 0 16px 16px; overflow: hidden; }
          .mp-mega__header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%); color: #fff; }
          .mp-mega__header-title { font-size: 15px; font-weight: 700; }
          .mp-mega__close { width: 30px; height: 30px; border: none; background: rgba(255,255,255,0.2); border-radius: 50%; color: #fff; cursor: pointer; }
          .mp-mega__inner { padding: 8px; overflow-y: auto; }
          .mp-mega__grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .mp-mega__main { flex-direction: column; text-align: center; padding: 10px 6px; gap: 6px; }
          .mp-mega__img, .mp-mega__img-placeholder { width: 44px; height: 44px; }
          .mp-mega__title { font-size: 11px; }
          .mp-mega__links { padding: 0 4px 6px; display: flex; flex-wrap: wrap; gap: 3px; justify-content: center; }
          .mp-mega__links li { margin: 0; }
          .mp-mega__links a { padding: 4px 8px; background: #f8fafc; border-radius: 10px; font-size: 10px; }
          .mp-mega__links a::before { display: none; }
          .mp-mega__footer { display: flex; padding: 12px 16px; background: #f8fafc; border-top: 1px solid #e5e7eb; }
          .mp-mega__footer-btn { flex: 1; padding: 12px 20px; background: #1f2937; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; color: #fff; }
        }
      `}</style>

      {/* Header */}
      <header className="mp-header">
        <div className="mp-header__inner">
          <div className="mp-header__logo">
            <Link href="/" className="mp-header__logo-text">MegaBuy</Link>
          </div>

          <div className="mp-search">
            <form className="mp-search__form" action="/hladanie" method="get">
              <input type="text" name="q" className="mp-search__input" placeholder="Hľadaj produkt, značku..." />
              <button type="submit" className="mp-search__btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <span>Hľadať</span>
              </button>
            </form>
          </div>

          <div className="mp-header__actions">
            <Link href="/ucet" className="mp-header__action">
              <span className="mp-header__action-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <span>Môj účet</span>
            </Link>
            <Link href="/oblubene" className="mp-header__action">
              <span className="mp-header__action-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {wishlistCount > 0 && <span className="mp-header__action-badge">{wishlistCount}</span>}
              </span>
              <span>Obľúbené</span>
            </Link>
            <Link href="/porovnanie" className="mp-header__action">
              <span className="mp-header__action-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 2l4 4-4 4"/><path d="M3 6h18"/><path d="M7 14l-4 4 4 4"/><path d="M21 18H3"/></svg>
                {compareCount > 0 && <span className="mp-header__action-badge">{compareCount}</span>}
              </span>
              <span>Porovnať</span>
            </Link>
            <Link href="/kosik" className="mp-header__action">
              <span className="mp-header__action-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                {cartCount > 0 && <span className="mp-header__action-badge">{cartCount}</span>}
              </span>
              <span>Košík</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Category Navigation */}
      <nav className={`mp-catnav ${isCollapsed ? 'is-collapsed' : ''}`}>
        <div className="mp-catnav__inner">
          {/* Mobile arrows */}
          <button className="mp-catnav__arrow mp-catnav__arrow--left" onClick={() => scrollCats('left')}>‹</button>
          <button className="mp-catnav__arrow mp-catnav__arrow--right" onClick={() => scrollCats('right')}>›</button>

          <div className="mp-catnav__list" ref={catListRef}>
            {categories.map(cat => (
              <div
                key={cat.id}
                className={`mp-catnav__item ${activeCatId === cat.id ? 'is-active' : ''}`}
                onClick={() => openMega(cat.id)}
              >
                {cat.image_url ? (
                  <Image src={cat.image_url} alt="" width={18} height={18} className="mp-catnav__item-img" style={{borderRadius: 4}} />
                ) : (
                  <span className="mp-catnav__item-icon">{cat.emoji || '📦'}</span>
                )}
                {cat.name}
              </div>
            ))}
          </div>

          {/* Hamburger for collapsed state */}
          <button className="mp-catnav__hamburger" onClick={() => setMegaOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>

          {/* Right side when collapsed */}
          <div className="mp-catnav__right">
            <form className="mp-catnav__search-form" action="/hladanie">
              <input type="text" name="q" className="mp-catnav__search-input" placeholder="Hľadať..." />
              <button type="submit" className="mp-catnav__search-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </button>
            </form>
            <Link href="/oblubene" className="mp-catnav__action">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {wishlistCount > 0 && <span className="mp-catnav__action-badge">{wishlistCount}</span>}
            </Link>
            <Link href="/porovnanie" className="mp-catnav__action">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 2l4 4-4 4"/><path d="M3 6h18"/><path d="M7 14l-4 4 4 4"/><path d="M21 18H3"/></svg>
              {compareCount > 0 && <span className="mp-catnav__action-badge">{compareCount}</span>}
            </Link>
          </div>

          {/* Mega Menu */}
          <div className={`mp-mega ${megaOpen ? 'is-open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) closeMega() }}>
            <div className="mp-mega__panel">
              <div className="mp-mega__header">
                <span className="mp-mega__header-title">{activeCategory?.name || 'Kategória'}</span>
                <button className="mp-mega__close" onClick={closeMega}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="mp-mega__inner">
                <div className="mp-mega__grid">
                  {activeCategory?.children?.map(child => (
                    <div key={child.id} className="mp-mega__col">
                      <Link href={`/kategoria/${child.slug}`} className="mp-mega__main">
                        {child.image_url ? (
                          <Image src={child.image_url} alt="" width={56} height={56} className="mp-mega__img" />
                        ) : (
                          <div className="mp-mega__img-placeholder">{child.name.charAt(0)}</div>
                        )}
                        <span className="mp-mega__title">{child.name}</span>
                      </Link>
                      {child.children && child.children.length > 0 && (
                        <ul className="mp-mega__links">
                          {child.children.slice(0, 6).map(g => (
                            <li key={g.id}><Link href={`/kategoria/${g.slug}`}>{g.name}</Link></li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mp-mega__footer">
                <button className="mp-mega__footer-btn" onClick={closeMega}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  Zatvoriť kategórie
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
