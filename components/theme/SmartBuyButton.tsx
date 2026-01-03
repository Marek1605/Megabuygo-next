'use client'

import { useState } from 'react'
import type { Offer } from '@/lib/types'
import { formatPrice } from '@/lib/api'

interface SmartBuyButtonProps {
  bestOffer: Offer
  productId: string
}

export function SmartBuyButton({ bestOffer, productId }: SmartBuyButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const price = bestOffer.price
  const freeShipping = price >= 49
  const shippingCost = freeShipping ? 0 : 2.99
  const inStock = bestOffer.availability === 'instock'

  const handleClick = async () => {
    setIsLoading(true)

    try {
      if (bestOffer.is_megabuy && bestOffer.can_add_to_cart) {
        // Add to cart (MegaBuy)
        // TODO: Implement cart API
        setIsSuccess(true)
        setTimeout(() => setIsSuccess(false), 2500)
      } else {
        // Affiliate redirect
        const res = await fetch(`/api/go/${bestOffer.id}`, { method: 'POST' })
        const data = await res.json()
        window.open(data.redirect_url || bestOffer.affiliate_url || bestOffer.url, '_blank', 'noopener,noreferrer')
      }
    } catch {
      window.open(bestOffer.affiliate_url || bestOffer.url, '_blank', 'noopener,noreferrer')
    }

    setIsLoading(false)
  }

  return (
    <>
      <style jsx>{`
        .mksb9{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
        .mksb9-box{background:#fff;border-radius:16px;padding:18px;box-shadow:0 4px 6px rgba(0,0,0,0.04),0 10px 24px rgba(0,0,0,0.08)}
        .mksb9-header{display:flex;align-items:center;gap:12px;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #e5e7eb}
        .mksb9-logo{width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,#ff6b35,#e55a2b);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px}
        .mksb9-name{font-size:15px;font-weight:600;color:#1f2937}
        .mksb9-rating{font-size:12px;color:#6b7280;display:flex;align-items:center;gap:4px;margin-top:2px}
        .mksb9-rating svg{width:12px;height:12px;fill:#fbbf24}
        .mksb9-badges{display:flex;gap:14px;margin-bottom:14px;font-size:12px}
        .mksb9-badge{display:flex;align-items:center;gap:5px;color:#6b7280}
        .mksb9-badge.stock{color:#16a34a;font-weight:500}
        .mksb9-badge svg{width:14px;height:14px}
        .mksb9-price-row{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:14px}
        .mksb9-price{font-size:26px;font-weight:800;color:#111827}
        .mksb9-shipping{font-size:12px;color:#16a34a}
        .mksb9-shipping.paid{color:#6b7280}
        .mksb9-cta{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 24px;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;text-decoration:none;border:none;transition:all .2s;background:linear-gradient(135deg,#ff6b35,#e55a2b);color:#fff;box-shadow:0 4px 14px rgba(255,107,53,0.35)}
        .mksb9-cta:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(255,107,53,0.45)}
        .mksb9-cta svg{width:18px;height:18px}
        .mksb9-label{text-align:center;font-size:11px;color:#9ca3af;margin-top:6px}
        .mksb9-more{display:block;text-align:center;margin-top:14px;padding-top:14px;border-top:1px solid #e5e7eb;font-size:13px;color:#ff6b35;text-decoration:none;font-weight:500}
        .mksb9-more:hover{text-decoration:underline}
        .mksb9-cta.loading{opacity:.7;pointer-events:none}
        .mksb9-cta.success{background:linear-gradient(135deg,#10b981,#059669)!important}
        @keyframes mksb9spin{100%{transform:rotate(360deg)}}
        @media(max-width:768px){
          .mksb9-box{padding:14px;border-radius:12px}
          .mksb9-header{gap:10px;margin-bottom:12px;padding-bottom:12px}
          .mksb9-logo{width:38px;height:38px;font-size:11px}
          .mksb9-name{font-size:14px}
          .mksb9-badges{gap:10px;margin-bottom:12px;font-size:11px}
          .mksb9-price{font-size:22px}
          .mksb9-cta{padding:12px 20px;font-size:14px;border-radius:8px}
        }
      `}</style>

      <div className="mksb9">
        <div className="mksb9-box">
          <div className="mksb9-header">
            <div className="mksb9-logo">
              {bestOffer.vendor.logo_url ? (
                <img src={bestOffer.vendor.logo_url} alt="" style={{width:'100%',height:'100%',objectFit:'contain',borderRadius:8}} />
              ) : (
                bestOffer.vendor.company_name.substring(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <div className="mksb9-name">{bestOffer.vendor.company_name}</div>
              <div className="mksb9-rating">
                <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                {bestOffer.vendor.rating.toFixed(1)} ({bestOffer.vendor.review_count})
              </div>
            </div>
          </div>

          <div className="mksb9-badges">
            <span className="mksb9-badge stock">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {inStock ? 'Skladom' : 'Na objednávku'}
            </span>
            <span className="mksb9-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              {bestOffer.delivery_days} dní
            </span>
          </div>

          <div className="mksb9-price-row">
            <span className="mksb9-price">{formatPrice(price)}</span>
            <span className={`mksb9-shipping ${shippingCost > 0 ? 'paid' : ''}`}>
              {freeShipping ? '✓ Doprava zdarma' : `+ ${formatPrice(shippingCost)} doprava`}
            </span>
          </div>

          <button 
            className={`mksb9-cta ${isLoading ? 'loading' : ''} ${isSuccess ? 'success' : ''}`}
            onClick={handleClick}
          >
            {isLoading ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{animation:'mksb9spin .8s linear infinite'}}>
                  <circle cx="12" cy="12" r="10" strokeDasharray="30 70"/>
                </svg>
                <span>Pridávam...</span>
              </>
            ) : isSuccess ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Pridané!</span>
              </>
            ) : bestOffer.is_megabuy && bestOffer.can_add_to_cart ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <span>Do košíka</span>
              </>
            ) : (
              <>
                <span>Do obchodu</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </>
            )}
          </button>
          
          {bestOffer.is_megabuy && <div className="mksb9-label">Predaj cez MegaBuy</div>}

          <a href="#mkod-offers" className="mksb9-more">Zobraziť všetky ponuky →</a>
        </div>
      </div>
    </>
  )
}
