'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/theme/Header'
import { Footer } from '@/components/theme/Footer'
import type { Category } from '@/lib/types'

// Mock data - v produkcii by boli z API
const categories: Category[] = [
  { id: '1', name: 'Mobilné telefóny', slug: 'mobilne-telefony', emoji: '📱', product_count: 2450, children: [
    { id: '1-1', name: 'Smartfóny', slug: 'smartfony', product_count: 1800, children: [
      { id: '1-1-1', name: 'iPhone', slug: 'iphone', product_count: 450 },
      { id: '1-1-2', name: 'Samsung', slug: 'samsung', product_count: 380 },
    ]},
    { id: '1-2', name: 'Príslušenstvo', slug: 'prislusenstvo-mobily', product_count: 650 },
  ]},
  { id: '2', name: 'Notebooky', slug: 'notebooky', emoji: '💻', product_count: 1820, children: [
    { id: '2-1', name: 'Pracovné', slug: 'pracovne-notebooky', product_count: 620 },
    { id: '2-2', name: 'Herné', slug: 'herne-notebooky', product_count: 340 },
  ]},
  { id: '3', name: 'Televízory', slug: 'televizory', emoji: '📺', product_count: 980 },
  { id: '4', name: 'Slúchadlá', slug: 'sluchadla', emoji: '🎧', product_count: 1560 },
  { id: '5', name: 'Herné konzoly', slug: 'herne-konzoly', emoji: '🎮', product_count: 340 },
  { id: '6', name: 'Fotoaparáty', slug: 'fotoaparaty', emoji: '📷', product_count: 720 },
  { id: '7', name: 'Dom a záhrada', slug: 'dom-zahrada', emoji: '🏡', product_count: 3450 },
  { id: '8', name: 'Šport', slug: 'sport', emoji: '⚽', product_count: 2100 },
]

const featuredProducts = [
  { id: '1', title: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', price: 1249, category: 'Mobilné telefóny', image: '📱' },
  { id: '2', title: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra', price: 1199, category: 'Mobilné telefóny', image: '📱' },
  { id: '3', title: 'MacBook Air M3', slug: 'macbook-air-m3', price: 1299, category: 'Notebooky', image: '💻' },
  { id: '4', title: 'Sony WH-1000XM5', slug: 'sony-wh-1000xm5', price: 299, category: 'Slúchadlá', image: '🎧' },
  { id: '5', title: 'PlayStation 5', slug: 'playstation-5', price: 499, category: 'Herné konzoly', image: '🎮' },
  { id: '6', title: 'LG OLED C3 55"', slug: 'lg-oled-c3-55', price: 1199, category: 'Televízory', image: '📺' },
  { id: '7', title: 'iPad Pro M2', slug: 'ipad-pro-m2', price: 1099, category: 'Tablety', image: '📱' },
  { id: '8', title: 'Canon EOS R6', slug: 'canon-eos-r6', price: 2299, category: 'Fotoaparáty', image: '📷' },
]

export default function HomePage() {
  return (
    <>
      <style jsx global>{`
        .container{max-width:1400px;margin:0 auto;padding:0 20px}
        
        /* Hero */
        .hero{background:linear-gradient(135deg,#1e3a5f 0%,#2d5a87 100%);color:#fff;padding:60px 0;text-align:center}
        .hero-title{font-size:2.5rem;font-weight:800;margin:0 0 16px;line-height:1.2}
        .hero-title .text-gradient{background:linear-gradient(135deg,#ff6b35,#fbbf24);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .hero-desc{font-size:1.1rem;opacity:.9;margin:0 0 32px;max-width:600px;margin-left:auto;margin-right:auto}
        .hero-search{max-width:600px;margin:0 auto}
        .hero-search form{display:flex;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.2)}
        .hero-search input{flex:1;padding:16px 20px;border:none;font-size:16px;outline:none}
        .hero-search button{padding:16px 32px;background:#ff6b35;border:none;color:#fff;font-weight:600;cursor:pointer}
        .hero-search button:hover{background:#e55a2b}
        
        /* Stats */
        .stats-section{padding:60px 0;background:#f9fafb}
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:30px}
        .stat-item{text-align:center;padding:30px 20px;background:#fff;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,0.06);transition:transform .3s}
        .stat-item:hover{transform:translateY(-5px)}
        .stat-icon{width:60px;height:60px;margin:0 auto 15px;display:flex;align-items:center;justify-content:center;background:rgba(255,107,53,0.1);border-radius:50%;color:#ff6b35;font-size:28px}
        .stat-number{font-size:2.5rem;font-weight:800;color:#1f2937;margin-bottom:8px}
        .stat-label{font-size:.9375rem;color:#6b7280}
        
        /* Categories */
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
        
        /* Products */
        .products-section{padding:60px 0;background:#f9fafb}
        .products-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
        .product-card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);text-decoration:none;transition:all .3s}
        .product-card:hover{transform:translateY(-5px);box-shadow:0 12px 24px rgba(0,0,0,0.1)}
        .product-image{aspect-ratio:1;background:#f9fafb;display:flex;align-items:center;justify-content:center;font-size:60px}
        .product-info{padding:16px}
        .product-category{font-size:.75rem;color:#ff6b35;font-weight:500;margin-bottom:4px}
        .product-title{font-size:1rem;font-weight:600;color:#1f2937;margin:0 0 12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .product-price{font-size:1.25rem;font-weight:700;color:#1f2937}
        
        /* How it works */
        .how-section{padding:80px 0}
        .how-section .section-header{flex-direction:column;align-items:center;text-align:center}
        .steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:50px}
        .step-item{text-align:center;padding:40px 30px;background:#fff;border-radius:20px;box-shadow:0 4px 16px rgba(0,0,0,0.06);position:relative}
        .step-number{position:absolute;top:-15px;left:50%;transform:translateX(-50%);width:30px;height:30px;background:#ff6b35;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.875rem}
        .step-icon{width:70px;height:70px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;background:rgba(255,107,53,0.1);border-radius:50%;font-size:32px}
        .step-title{font-size:1.25rem;font-weight:600;color:#1f2937;margin-bottom:10px}
        .step-desc{font-size:.9375rem;color:#6b7280;line-height:1.6;margin:0}
        
        /* Newsletter */
        .newsletter-section{padding:60px 0}
        .newsletter-box{display:flex;justify-content:space-between;align-items:center;gap:40px;padding:50px;background:linear-gradient(135deg,#ff6b35,#e55a2b);border-radius:24px;color:#fff}
        .newsletter-title{font-size:1.75rem;font-weight:700;margin-bottom:10px}
        .newsletter-desc{opacity:.9;margin:0}
        .newsletter-form{display:flex;gap:12px;flex-shrink:0}
        .newsletter-form input{padding:14px 20px;border:2px solid rgba(255,255,255,0.3);border-radius:10px;background:rgba(255,255,255,0.1);color:#fff;font-size:1rem;width:280px}
        .newsletter-form input::placeholder{color:rgba(255,255,255,0.6)}
        .newsletter-form button{padding:14px 28px;background:#fff;color:#ff6b35;border:none;border-radius:10px;font-weight:600;cursor:pointer}
        
        @media(max-width:992px){
          .stats-grid,.categories-grid,.products-grid{grid-template-columns:repeat(2,1fr)}
          .steps-grid{grid-template-columns:1fr;gap:30px}
          .newsletter-box{flex-direction:column;text-align:center;padding:40px 30px}
        }
        @media(max-width:600px){
          .stats-grid,.categories-grid,.products-grid{grid-template-columns:1fr}
          .hero-title{font-size:1.75rem}
          .newsletter-form{flex-direction:column;width:100%}
          .newsletter-form input{width:100%}
        }
      `}</style>

      <Header categories={categories} />

      <main>
        {/* Hero */}
        <section className="hero">
          <div className="container">
            <h1 className="hero-title">
              Porovnajte ceny z <span className="text-gradient">tisícov obchodov</span>
            </h1>
            <p className="hero-desc">
              Nájdite najlepšie ceny na Slovensku. Porovnávame ponuky od stoviek overených predajcov.
            </p>
            <div className="hero-search">
              <form action="/hladanie">
                <input type="text" name="q" placeholder="Hľadaj produkt, značku..." />
                <button type="submit">Hľadať</button>
              </form>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon">📦</div>
                <div className="stat-number">12,456</div>
                <div className="stat-label">Produktov</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">🏪</div>
                <div className="stat-number">500+</div>
                <div className="stat-label">Obchodov</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">📁</div>
                <div className="stat-number">48</div>
                <div className="stat-label">Kategórií</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">👥</div>
                <div className="stat-number">50,000+</div>
                <div className="stat-label">Používateľov</div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="categories-section">
          <div className="container">
            <div className="section-header">
              <div>
                <span className="section-subtitle">Preskúmajte</span>
                <h2 className="section-title">Populárne kategórie</h2>
              </div>
              <Link href="/kategorie" className="section-view-all">
                Všetky kategórie →
              </Link>
            </div>
            <div className="categories-grid">
              {categories.slice(0, 8).map(cat => (
                <Link key={cat.id} href={`/kategoria/${cat.slug}`} className="category-card">
                  <div className="category-image">{cat.emoji}</div>
                  <h3 className="category-name">{cat.name}</h3>
                  <span className="category-count">{cat.product_count.toLocaleString()} produktov</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="products-section">
          <div className="container">
            <div className="section-header">
              <div>
                <span className="section-subtitle">Najlepšie ponuky</span>
                <h2 className="section-title">Odporúčané produkty</h2>
              </div>
              <Link href="/produkty" className="section-view-all">
                Zobraziť všetko →
              </Link>
            </div>
            <div className="products-grid">
              {featuredProducts.map(product => (
                <Link key={product.id} href={`/produkt/${product.slug}`} className="product-card">
                  <div className="product-image">{product.image}</div>
                  <div className="product-info">
                    <div className="product-category">{product.category}</div>
                    <h3 className="product-title">{product.title}</h3>
                    <div className="product-price">{product.price.toFixed(2).replace('.',',')} €</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="how-section">
          <div className="container">
            <div className="section-header">
              <span className="section-subtitle">Ako to funguje</span>
              <h2 className="section-title">Jednoduché porovnávanie cien</h2>
            </div>
            <div className="steps-grid">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-icon">🔍</div>
                <h3 className="step-title">Vyhľadajte produkt</h3>
                <p className="step-desc">Zadajte názov produktu do vyhľadávača alebo prechádzajte kategórie.</p>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-icon">📊</div>
                <h3 className="step-title">Porovnajte ceny</h3>
                <p className="step-desc">Prezrite si ponuky od rôznych predajcov a vyberte si tú najlepšiu.</p>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-icon">❤️</div>
                <h3 className="step-title">Nakúpte výhodne</h3>
                <p className="step-desc">Prejdite na stránku obchodu a ušetrite na svojom nákupe.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="newsletter-section">
          <div className="container">
            <div className="newsletter-box">
              <div>
                <h2 className="newsletter-title">Nenechajte si ujsť najlepšie ponuky</h2>
                <p className="newsletter-desc">Prihláste sa na odber a dostávajte upozornenia na zľavy.</p>
              </div>
              <form className="newsletter-form">
                <input type="email" placeholder="Váš e-mail" required />
                <button type="submit">Prihlásiť sa</button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
