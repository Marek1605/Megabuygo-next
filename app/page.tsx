'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/theme/Header'
import { Footer } from '@/components/theme/Footer'
import { api, formatPrice } from '@/lib/api'
import type { Category, Product } from '@/lib/types'

export default function HomePage() {
  const [categories, setCategories] = useState<(Category & { children: Category[] })[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [cats, prods] = await Promise.all([
      api.getCategoriesTree(),
      api.getFeaturedProducts(8)
    ])
    if (cats) setCategories(cats)
    if (prods) setProducts(prods)
    setLoading(false)
  }

  return (
    <>
      <style jsx global>{`
        .container{max-width:1400px;margin:0 auto;padding:0 20px}
        .hero{background:linear-gradient(135deg,#1e3a5f 0%,#2d5a87 100%);color:#fff;padding:60px 0;text-align:center}
        .hero-title{font-size:2.5rem;font-weight:800;margin:0 0 16px;line-height:1.2}
        .hero-title .text-gradient{background:linear-gradient(135deg,#ff6b35,#fbbf24);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .hero-desc{font-size:1.1rem;opacity:.9;margin:0 0 32px;max-width:600px;margin-left:auto;margin-right:auto}
        .hero-search{max-width:600px;margin:0 auto}
        .hero-search form{display:flex;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.2)}
        .hero-search input{flex:1;padding:16px 20px;border:none;font-size:16px;outline:none}
        .hero-search button{padding:16px 32px;background:#ff6b35;border:none;color:#fff;font-weight:600;cursor:pointer}
        .stats-section{padding:60px 0;background:#f9fafb}
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:30px}
        .stat-item{text-align:center;padding:30px 20px;background:#fff;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,0.06)}
        .stat-icon{width:60px;height:60px;margin:0 auto 15px;display:flex;align-items:center;justify-content:center;background:rgba(255,107,53,0.1);border-radius:50%;font-size:28px}
        .stat-number{font-size:2.5rem;font-weight:800;color:#1f2937;margin-bottom:8px}
        .stat-label{font-size:.9375rem;color:#6b7280}
        .categories-section{padding:60px 0}
        .section-header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:30px}
        .section-subtitle{display:block;font-size:.875rem;color:#ff6b35;font-weight:600;text-transform:uppercase;margin-bottom:8px}
        .section-title{font-size:1.75rem;font-weight:700;color:#1f2937;margin:0}
        .section-view-all{display:inline-flex;align-items:center;gap:6px;color:#ff6b35;font-weight:500}
        .categories-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
        .category-card{display:flex;flex-direction:column;align-items:center;padding:30px 20px;background:#fff;border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);text-decoration:none;transition:all .3s}
        .category-card:hover{transform:translateY(-5px);box-shadow:0 12px 24px rgba(0,0,0,0.1)}
        .category-image{width:80px;height:80px;border-radius:50%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:40px;margin-bottom:15px}
        .category-name{font-size:1rem;font-weight:600;color:#1f2937;margin:0 0 5px;text-align:center}
        .category-count{font-size:.875rem;color:#6b7280}
        .products-section{padding:60px 0;background:#f9fafb}
        .products-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
        .product-card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);text-decoration:none;transition:all .3s}
        .product-card:hover{transform:translateY(-5px);box-shadow:0 12px 24px rgba(0,0,0,0.1)}
        .product-image{aspect-ratio:1;background:#f9fafb;display:flex;align-items:center;justify-content:center;font-size:60px;overflow:hidden}
        .product-image img{width:100%;height:100%;object-fit:cover}
        .product-info{padding:16px}
        .product-category{font-size:.75rem;color:#ff6b35;font-weight:500;margin-bottom:4px}
        .product-title{font-size:1rem;font-weight:600;color:#1f2937;margin:0 0 12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .product-price{font-size:1.25rem;font-weight:700;color:#1f2937}
        .how-section{padding:80px 0}
        .how-section .section-header{flex-direction:column;align-items:center;text-align:center}
        .steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:50px}
        .step-item{text-align:center;padding:40px 30px;background:#fff;border-radius:20px;box-shadow:0 4px 16px rgba(0,0,0,0.06);position:relative}
        .step-number{position:absolute;top:-15px;left:50%;transform:translateX(-50%);width:30px;height:30px;background:#ff6b35;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700}
        .step-icon{width:70px;height:70px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;background:rgba(255,107,53,0.1);border-radius:50%;font-size:32px}
        .step-title{font-size:1.25rem;font-weight:600;color:#1f2937;margin-bottom:10px}
        .step-desc{font-size:.9375rem;color:#6b7280;line-height:1.6;margin:0}
        .vendor-cta{padding:60px 0}
        .vendor-cta-box{background:linear-gradient(135deg,#1e3a5f,#2d5a87);border-radius:24px;padding:50px;display:flex;justify-content:space-between;align-items:center;gap:40px;color:#fff}
        .vendor-cta-content h2{font-size:2rem;font-weight:700;margin:0 0 12px}
        .vendor-cta-content p{font-size:1.1rem;opacity:.9;margin:0 0 20px}
        .vendor-cta-benefits{display:flex;gap:20px;flex-wrap:wrap}
        .vendor-cta-benefit{display:flex;align-items:center;gap:8px;font-size:14px}
        .vendor-cta-btns{display:flex;flex-direction:column;gap:12px}
        .vendor-cta-btn{padding:16px 32px;border-radius:12px;font-weight:600;text-decoration:none;text-align:center}
        .vendor-cta-btn-primary{background:#ff6b35;color:#fff}
        .vendor-cta-btn-secondary{background:rgba(255,255,255,0.1);color:#fff;border:2px solid rgba(255,255,255,0.3)}
        .empty-products{text-align:center;padding:60px 20px;background:#fff;border-radius:16px}
        .empty-products h3{font-size:20px;font-weight:600;margin:16px 0 8px}
        .empty-products p{color:#6b7280;margin-bottom:24px}
        .empty-products a{display:inline-block;padding:14px 28px;background:#ff6b35;color:#fff;border-radius:10px;font-weight:600;text-decoration:none}
        @media(max-width:992px){.stats-grid,.categories-grid,.products-grid{grid-template-columns:repeat(2,1fr)}.steps-grid{grid-template-columns:1fr}.vendor-cta-box{flex-direction:column;text-align:center}}
        @media(max-width:600px){.stats-grid,.categories-grid,.products-grid{grid-template-columns:1fr}.hero-title{font-size:1.75rem}}
      `}</style>

      <Header categories={categories} />

      <main>
        <section className="hero">
          <div className="container">
            <h1 className="hero-title">
              Porovnajte ceny z <span className="text-gradient">tisícov obchodov</span>
            </h1>
            <p className="hero-desc">Nájdite najlepšie ceny na Slovensku. Porovnávame ponuky od stoviek overených predajcov.</p>
            <div className="hero-search">
              <form action="/hladanie"><input type="text" name="q" placeholder="Hľadaj produkt, značku..." /><button type="submit">Hľadať</button></form>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-item"><div className="stat-icon">📦</div><div className="stat-number">{products.length || '12,456'}</div><div className="stat-label">Produktov</div></div>
              <div className="stat-item"><div className="stat-icon">🏪</div><div className="stat-number">500+</div><div className="stat-label">Obchodov</div></div>
              <div className="stat-item"><div className="stat-icon">📁</div><div className="stat-number">{categories.length || '48'}</div><div className="stat-label">Kategórií</div></div>
              <div className="stat-item"><div className="stat-icon">👥</div><div className="stat-number">50,000+</div><div className="stat-label">Používateľov</div></div>
            </div>
          </div>
        </section>

        <section className="categories-section">
          <div className="container">
            <div className="section-header">
              <div><span className="section-subtitle">Preskúmajte</span><h2 className="section-title">Populárne kategórie</h2></div>
              <Link href="/admin/categories" className="section-view-all">Spravovať kategórie →</Link>
            </div>
            <div className="categories-grid">
              {categories.slice(0, 8).map(cat => (
                <Link key={cat.id} href={`/kategoria/${cat.slug}`} className="category-card">
                  <div className="category-image">{(cat as any).emoji || '📦'}</div>
                  <h3 className="category-name">{cat.name}</h3>
                  <span className="category-count">{cat.product_count || 0} produktov</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="products-section">
          <div className="container">
            <div className="section-header">
              <div><span className="section-subtitle">Najlepšie ponuky</span><h2 className="section-title">{products.length > 0 ? 'Produkty v katalógu' : 'Pridajte prvé produkty'}</h2></div>
              <Link href="/admin/products" className="section-view-all">{products.length > 0 ? 'Zobraziť všetko →' : 'Pridať produkty →'}</Link>
            </div>
            {products.length > 0 ? (
              <div className="products-grid">
                {products.map(product => (
                  <Link key={product.id} href={`/produkt/${product.slug}`} className="product-card">
                    <div className="product-image">{product.image_url ? <img src={product.image_url} alt={product.title} /> : '📦'}</div>
                    <div className="product-info">
                      <div className="product-category">{product.category_name || 'Bez kategórie'}</div>
                      <h3 className="product-title">{product.title}</h3>
                      <div className="product-price">{formatPrice(product.price_min)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-products">
                <div style={{fontSize: 64}}>📦</div>
                <h3>Zatiaľ žiadne produkty</h3>
                <p>Pridajte prvé produkty do admin panelu</p>
                <Link href="/admin/products/new">+ Pridať produkt</Link>
              </div>
            )}
          </div>
        </section>

        <section className="how-section">
          <div className="container">
            <div className="section-header"><span className="section-subtitle">Ako to funguje</span><h2 className="section-title">Jednoduché porovnávanie cien</h2></div>
            <div className="steps-grid">
              <div className="step-item"><div className="step-number">1</div><div className="step-icon">🔍</div><h3 className="step-title">Vyhľadajte produkt</h3><p className="step-desc">Zadajte názov produktu do vyhľadávača alebo prechádzajte kategórie.</p></div>
              <div className="step-item"><div className="step-number">2</div><div className="step-icon">📊</div><h3 className="step-title">Porovnajte ceny</h3><p className="step-desc">Prezrite si ponuky od rôznych predajcov a vyberte si tú najlepšiu.</p></div>
              <div className="step-item"><div className="step-number">3</div><div className="step-icon">❤️</div><h3 className="step-title">Nakúpte výhodne</h3><p className="step-desc">Prejdite na stránku obchodu a ušetrite na svojom nákupe.</p></div>
            </div>
          </div>
        </section>

        <section className="vendor-cta">
          <div className="container">
            <div className="vendor-cta-box">
              <div className="vendor-cta-content">
                <h2>Predávajte na MegaBuy.sk</h2>
                <p>Získajte tisíce nových zákazníkov pre váš e-shop</p>
                <div className="vendor-cta-benefits">
                  <div className="vendor-cta-benefit">✓ Jednoduchý import produktov</div>
                  <div className="vendor-cta-benefit">✓ Podrobné štatistiky</div>
                  <div className="vendor-cta-benefit">✓ Férový CPC model</div>
                </div>
              </div>
              <div className="vendor-cta-btns">
                <Link href="/registracia-predajcu" className="vendor-cta-btn vendor-cta-btn-primary">Začať predávať</Link>
                <Link href="/prihlasenie-predajcu" className="vendor-cta-btn vendor-cta-btn-secondary">Prihlásiť sa</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
