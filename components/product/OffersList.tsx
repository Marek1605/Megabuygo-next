'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  Star, Check, Truck, Clock, ExternalLink, 
  ShoppingCart, ChevronDown, ChevronUp, Shield,
  BadgeCheck, Zap
} from 'lucide-react'
import { formatPrice, cn, getInitials } from '@/lib/utils'
import type { Offer } from '@/lib/types'

interface OffersListProps {
  offers: Offer[]
  productId: string
}

export function OffersList({ offers, productId }: OffersListProps) {
  const [showAll, setShowAll] = useState(false)
  const [filter, setFilter] = useState<'all' | 'instock'>('all')
  const [loadingOffer, setLoadingOffer] = useState<string | null>(null)
  
  const initialShow = 5
  
  const filteredOffers = offers.filter(offer => {
    if (filter === 'instock') return offer.availability === 'instock'
    return true
  })
  
  const visibleOffers = showAll ? filteredOffers : filteredOffers.slice(0, initialShow)
  const hasMore = filteredOffers.length > initialShow

  const handleClick = async (offer: Offer) => {
    setLoadingOffer(offer.id)
    
    // Track click via API
    try {
      const response = await fetch(`/api/go/${offer.id}`, { method: 'POST' })
      const data = await response.json()
      
      if (data.redirect_url) {
        window.open(data.redirect_url, '_blank', 'noopener,noreferrer')
      } else if (offer.affiliate_url || offer.url) {
        window.open(offer.affiliate_url || offer.url, '_blank', 'noopener,noreferrer')
      }
    } catch (error) {
      // Fallback - direct redirect
      window.open(offer.affiliate_url || offer.url, '_blank', 'noopener,noreferrer')
    }
    
    setTimeout(() => setLoadingOffer(null), 1000)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-orange/10 rounded-xl">
            <ShoppingCart className="h-5 w-5 text-brand-orange" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Porovnanie cien</h2>
            <p className="text-sm text-gray-500">
              {filteredOffers.length} {filteredOffers.length === 1 ? 'ponuka' : filteredOffers.length < 5 ? 'ponuky' : 'ponúk'}
            </p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              filter === 'all' 
                ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20" 
                : "bg-white border border-gray-200 text-gray-600 hover:border-brand-orange hover:text-brand-orange"
            )}
          >
            Všetky
          </button>
          <button
            onClick={() => setFilter('instock')}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              filter === 'instock' 
                ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20" 
                : "bg-white border border-gray-200 text-gray-600 hover:border-brand-orange hover:text-brand-orange"
            )}
          >
            Skladom
          </button>
        </div>
      </div>

      {/* Offers List */}
      <div className="divide-y divide-gray-100">
        {visibleOffers.map((offer, index) => (
          <div 
            key={offer.id}
            className={cn(
              "group relative px-5 py-4 hover:bg-gray-50/50 transition-colors",
              offer.is_best && "bg-gradient-to-r from-amber-50/50 to-transparent"
            )}
          >
            {/* Best offer badge */}
            {offer.is_best && index === 0 && (
              <div className="absolute -top-px left-5 right-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold rounded-b-lg shadow-md">
                  <Zap className="h-3 w-3" />
                  Najlepšia ponuka
                </div>
              </div>
            )}

            <div className="grid grid-cols-[1fr_100px_100px_120px_160px] gap-4 items-center">
              {/* Vendor */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  {offer.vendor.logo_url ? (
                    <Image
                      src={offer.vendor.logo_url}
                      alt={offer.vendor.company_name}
                      width={48}
                      height={48}
                      className="rounded-xl border border-gray-100 object-contain bg-white"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-orange to-brand-orange-dark flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {getInitials(offer.vendor.company_name)}
                    </div>
                  )}
                  {offer.vendor.verified && (
                    <div className="absolute -bottom-1 -right-1 p-0.5 bg-white rounded-full">
                      <BadgeCheck className="h-4 w-4 text-blue-500" />
                    </div>
                  )}
                </div>
                
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 truncate">
                      {offer.vendor.company_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm text-gray-600">{offer.vendor.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-gray-400">({offer.vendor.review_count})</span>
                  </div>
                </div>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-1.5">
                {offer.availability === 'instock' ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">Skladom</span>
                  </>
                ) : offer.availability === 'preorder' ? (
                  <>
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-600">Predpredaj</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Nedostupné</span>
                  </>
                )}
              </div>

              {/* Delivery */}
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Truck className="h-4 w-4" />
                <span>{offer.delivery_days} dní</span>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">
                  {formatPrice(offer.price)}
                </div>
                {offer.shipping_price > 0 ? (
                  <div className="text-xs text-gray-500">
                    + {formatPrice(offer.shipping_price)} doprava
                  </div>
                ) : (
                  <div className="text-xs text-green-600 font-medium">
                    Doprava zdarma
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={() => handleClick(offer)}
                  disabled={loadingOffer === offer.id}
                  className={cn(
                    "w-full px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2",
                    offer.is_best || index === 0
                      ? "bg-gradient-to-r from-brand-orange to-brand-orange-dark text-white shadow-lg shadow-brand-orange/25 hover:shadow-xl hover:shadow-brand-orange/30 hover:-translate-y-0.5"
                      : "bg-gray-900 text-white hover:bg-gray-800",
                    loadingOffer === offer.id && "opacity-70 cursor-wait"
                  )}
                >
                  {loadingOffer === offer.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Presmerovanie...
                    </>
                  ) : (
                    <>
                      Do obchodu
                      <ExternalLink className="h-4 w-4" />
                    </>
                  )}
                </button>
                <span className="text-[10px] text-gray-400">
                  Cez MegaBuy.sk
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show more button */}
      {hasMore && (
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-brand-orange hover:text-brand-orange transition-all"
          >
            {showAll ? (
              <>
                Zobraziť menej
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Zobraziť ďalších {filteredOffers.length - initialShow} ponúk
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Empty state */}
      {filteredOffers.length === 0 && (
        <div className="px-5 py-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-medium text-gray-900">Žiadne ponuky</p>
          <p className="text-sm text-gray-500 mt-1">
            {filter === 'instock' 
              ? 'Žiadny predajca nemá tento produkt skladom'
              : 'Pre tento produkt nie sú dostupné žiadne ponuky'
            }
          </p>
        </div>
      )}
    </div>
  )
}
