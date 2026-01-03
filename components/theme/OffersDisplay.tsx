'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Offer } from '@/lib/types'
import { formatPrice } from '@/lib/api'

interface OffersDisplayProps {
  offers: Offer[]
  productId: string
}

export function OffersDisplay({ offers, productId }: OffersDisplayProps) {
  const [filter, setFilter] = useState<'all' | 'instock'>('all')
  const [showAll, setShowAll] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  
  const initialShow = 5
  
  const filteredOffers = offers.filter(o => filter === 'all' || o.availability === 'instock')
  const visibleOffers = showAll ? filteredOffers : filteredOffers.slice(0, initialShow)
  const hasMore = filteredOffers.length > initialShow

  const handleClick = async (offer: Offer) => {
    setLoadingId(offer.id)
    
    try {
      const res = await fetch(`/api/go/${offer.id}`, { method: 'POST' })
      const data = await res.json()
      window.open(data.redirect_url || offer.affiliate_url || offer.url, '_blank', 'noopener,noreferrer')
    } catch {
      window.open(offer.affiliate_url || offer.url, '_blank', 'noopener,noreferrer')
    }
    
    setTimeout(() => setLoadingId(null), 1000)
  }

  return (
    <>
      <style jsx>{`
        .mkod10{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;margin:20px 0;background:#fff;border-radius:16px;box-shadow:0 4px 6px rgba(0,0,0,0.04),0 10px 24px rgba(0,0,0,0.08),0 20px 48px rgba(0,0,0,0.06);overflow:hidden}
        .mkod10-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:#f9fafb;border-bottom:1px solid #e5e7eb}
        .mkod10-title{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:600;color:#1f2937}
        .mkod10-title svg{width:20px;height:20px;color:#ff6b35}
        .mkod10-count{font-size:13px;color:#6b7280;font-weight:400;margin-left:4px}
        .mkod10-filters{display:flex;gap:6px}
        .mkod10-filter{padding:6px 14px;background:#fff;border:1px solid #e5e7eb;border-radius:20px;font-size:12px;font-weight:500;color:#6b7280;cursor:pointer;transition:all .15s}
        .mkod10-filter:hover{border-color:#ff6b35;color:#ff6b35}
        .mkod10-filter.active{background:#ff6b35;border-color:#ff6b35;color:#fff}
        .mkod10-list{padding:16px;display:flex;flex-direction:column;gap:10px}
        .mkod10-card{display:grid;grid-template-columns:minmax(180px,1fr) 90px 90px 110px 140px;align-items:center;gap:16px;padding:14px 18px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;transition:all .2s}
        .mkod10-card:hover{border-color:#d1d5db;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
        .mkod10-vendor{display:flex;align-items:center;gap:12px;min-width:0}
        .mkod10-logo{width:42px;height:42px;border-radius:10px;background:#f3f4f6;border:1px solid #e5e7eb;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#9ca3af;flex-shrink:0;overflow:hidden}
        .mkod10-logo img{width:100%;height:100%;object-fit:contain}
        .mkod10-vendor-info{min-width:0;flex:1}
        .mkod10-name{font-size:14px;font-weight:600;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .mkod10-meta{display:flex;align-items:center;gap:6px;margin-top:3px}
        .mkod10-rating{display:flex;align-items:center;gap:3px;font-size:12px;color:#6b7280}
        .mkod10-rating svg{width:12px;height:12px;fill:#fbbf24}
        .mkod10-stock{display:flex;align-items:center;gap:4px;font-size:12px;font-weight:500}
        .mkod10-stock.in{color:#16a34a}
        .mkod10-stock.out{color:#d97706}
        .mkod10-stock svg{width:14px;height:14px}
        .mkod10-delivery{display:flex;align-items:center;gap:4px;font-size:12px;color:#6b7280}
        .mkod10-delivery svg{width:14px;height:14px}
        .mkod10-price-col{text-align:right}
        .mkod10-price{font-size:17px;font-weight:800;color:#111827}
        .mkod10-shipping{font-size:11px;color:#16a34a;margin-top:1px}
        .mkod10-shipping.paid{color:#6b7280}
        .mkod10-cta-col{display:flex;flex-direction:column;align-items:flex-end;gap:3px}
        .mkod10-cta{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;transition:all .15s;border:none;white-space:nowrap}
        .mkod10-cta svg{width:14px;height:14px}
        .mkod10-cta.affiliate{background:#ff6b35;color:#fff}
        .mkod10-cta.affiliate:hover{background:#e55a2b;box-shadow:0 2px 8px rgba(255,107,53,0.3)}
        .mkod10-cta.cart{background:#ff6b35;color:#fff}
        .mkod10-cta.cart:hover{background:#e55a2b}
        .mkod10-megabuy-label{font-size:9px;color:#9ca3af}
        .mkod10-cta.loading{opacity:.7;pointer-events:none}
        .mkod10-more{padding:14px 20px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center}
        .mkod10-more-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;background:#fff;border:1px solid #e5e7eb;border-radius:20px;font-size:12px;font-weight:500;color:#6b7280;cursor:pointer;transition:all .15s}
        .mkod10-more-btn:hover{border-color:#ff6b35;color:#ff6b35}
        @media(max-width:800px){
          .mkod10-card{grid-template-columns:1fr auto;gap:8px;padding:10px 12px}
          .mkod10-vendor{grid-column:1;grid-row:1}
          .mkod10-price-col{grid-column:2;grid-row:1}
          .mkod10-stock{grid-column:1;grid-row:2}
          .mkod10-delivery{display:none}
          .mkod10-cta-col{grid-column:2;grid-row:2}
          .mkod10-logo{width:34px;height:34px}
          .mkod10-name{font-size:13px}
          .mkod10-price{font-size:15px}
          .mkod10-cta{padding:8px 12px;font-size:11px}
        }
        @media(max-width:480px){
          .mkod10-card{grid-template-columns:1fr;gap:8px;padding:10px}
          .mkod10-price-col{grid-column:1;grid-row:2;text-align:left;display:flex;align-items:center;gap:10px}
          .mkod10-stock{display:none}
          .mkod10-cta-col{grid-column:1;grid-row:3;align-items:stretch}
          .mkod10-cta{width:100%;justify-content:center}
        }
      `}</style>

      <div className="mkod10" id="mkod-offers">
        <div className="mkod10-header">
          <div className="mkod10-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            Porovnanie cien
            <span className="mkod10-count">
              {filteredOffers.length} {filteredOffers.length === 1 ? 'ponuka' : filteredOffers.length < 5 ? 'ponuky' : 'ponúk'}
            </span>
          </div>
          <div className="mkod10-filters">
            <button 
              className={`mkod10-filter ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Všetky
            </button>
            <button 
              className={`mkod10-filter ${filter === 'instock' ? 'active' : ''}`}
              onClick={() => setFilter('instock')}
            >
              Skladom
            </button>
          </div>
        </div>

        <div className="mkod10-list">
          {visibleOffers.map((offer) => (
            <div key={offer.id} className="mkod10-card">
              <div className="mkod10-vendor">
                <div className="mkod10-logo">
                  {offer.vendor.logo_url ? (
                    <Image src={offer.vendor.logo_url} alt="" width={42} height={42} />
                  ) : (
                    offer.vendor.company_name.substring(0, 2).toLowerCase()
                  )}
                </div>
                <div className="mkod10-vendor-info">
                  <div className="mkod10-name">{offer.vendor.company_name}</div>
                  <div className="mkod10-meta">
                    <span className="mkod10-rating">
                      <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      {offer.vendor.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`mkod10-stock ${offer.availability === 'instock' ? 'in' : 'out'}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  {offer.availability === 'instock' 
                    ? <polyline points="20 6 9 17 4 12"/>
                    : <circle cx="12" cy="12" r="10"/>
                  }
                </svg>
                {offer.availability === 'instock' ? 'Skladom' : 'Nedostupné'}
              </div>

              <div className="mkod10-delivery">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13"/>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                {offer.delivery_days} dní
              </div>

              <div className="mkod10-price-col">
                <div className="mkod10-price">{formatPrice(offer.price)}</div>
                <div className={`mkod10-shipping ${offer.shipping_price > 0 ? 'paid' : ''}`}>
                  {offer.shipping_price > 0 ? `+ ${formatPrice(offer.shipping_price)}` : '✓ Doprava zdarma'}
                </div>
              </div>

              <div className="mkod10-cta-col">
                <button 
                  className={`mkod10-cta affiliate ${loadingId === offer.id ? 'loading' : ''}`}
                  onClick={() => handleClick(offer)}
                >
                  {loadingId === offer.id ? (
                    <>Presmerovanie...</>
                  ) : offer.is_megabuy && offer.can_add_to_cart ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                      </svg>
                      Do košíka
                    </>
                  ) : (
                    <>
                      Do obchodu
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </>
                  )}
                </button>
                {offer.is_megabuy && <span className="mkod10-megabuy-label">Cez MegaBuy</span>}
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="mkod10-more">
            <button className="mkod10-more-btn" onClick={() => setShowAll(!showAll)}>
              {showAll ? (
                <>
                  Zobraziť menej
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
                </>
              ) : (
                <>
                  Zobraziť ďalších {filteredOffers.length - initialShow} ponúk
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
