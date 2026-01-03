'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  Star, Check, Truck, Shield, ExternalLink, 
  Heart, BarChart3, Bell, BadgeCheck, Zap
} from 'lucide-react'
import { formatPrice, cn, getInitials } from '@/lib/utils'
import type { Offer, Product } from '@/lib/types'

interface BuyBoxProps {
  product: Product
  bestOffer?: Offer
  totalOffers: number
}

export function BuyBox({ product, bestOffer, totalOffers }: BuyBoxProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isComparing, setIsComparing] = useState(false)

  const handleBuyClick = async () => {
    if (!bestOffer) return
    
    setIsLoading(true)
    
    try {
      // Track click
      const response = await fetch(`/api/go/${bestOffer.id}`, { method: 'POST' })
      const data = await response.json()
      
      if (data.redirect_url) {
        window.open(data.redirect_url, '_blank', 'noopener,noreferrer')
      } else {
        window.open(bestOffer.affiliate_url || bestOffer.url, '_blank', 'noopener,noreferrer')
      }
    } catch (error) {
      window.open(bestOffer.affiliate_url || bestOffer.url, '_blank', 'noopener,noreferrer')
    }
    
    setTimeout(() => setIsLoading(false), 1500)
  }

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    // TODO: Save to localStorage or API
  }

  const toggleCompare = () => {
    setIsComparing(!isComparing)
    // TODO: Save to localStorage
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden sticky top-20">
      {/* Best offer badge */}
      {bestOffer && (
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 flex items-center justify-center gap-2">
          <Zap className="h-4 w-4 text-white" />
          <span className="text-white text-sm font-bold">Najlepšia ponuka</span>
        </div>
      )}

      <div className="p-5">
        {bestOffer ? (
          <>
            {/* Vendor info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                {bestOffer.vendor.logo_url ? (
                  <Image
                    src={bestOffer.vendor.logo_url}
                    alt={bestOffer.vendor.company_name}
                    width={56}
                    height={56}
                    className="rounded-xl border border-gray-100 object-contain bg-white"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-orange to-brand-orange-dark flex items-center justify-center text-white font-bold shadow-lg shadow-brand-orange/25">
                    {getInitials(bestOffer.vendor.company_name)}
                  </div>
                )}
                {bestOffer.vendor.verified && (
                  <div className="absolute -bottom-1 -right-1 p-0.5 bg-white rounded-full shadow">
                    <BadgeCheck className="h-4 w-4 text-blue-500" />
                  </div>
                )}
              </div>
              
              <div>
                <div className="font-semibold text-gray-900">{bestOffer.vendor.company_name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">{bestOffer.vendor.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-gray-400">({bestOffer.vendor.review_count} hodnotení)</span>
                </div>
              </div>
            </div>

            {/* Stock & Delivery */}
            <div className="flex gap-4 mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm">
                {bestOffer.availability === 'instock' ? (
                  <>
                    <div className="p-1 bg-green-100 rounded-full">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <span className="font-medium text-green-600">Skladom</span>
                  </>
                ) : (
                  <>
                    <div className="p-1 bg-amber-100 rounded-full">
                      <Bell className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <span className="font-medium text-amber-600">Na objednávku</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="h-4 w-4" />
                <span>Doručenie {bestOffer.delivery_days} dní</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end justify-between mb-4">
              <div>
                {bestOffer.original_price && bestOffer.original_price > bestOffer.price && (
                  <div className="text-sm text-gray-400 line-through">
                    {formatPrice(bestOffer.original_price)}
                  </div>
                )}
                <div className="text-3xl font-extrabold text-gray-900">
                  {formatPrice(bestOffer.price)}
                </div>
              </div>
              <div className="text-right">
                {bestOffer.shipping_price === 0 ? (
                  <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <Check className="h-4 w-4" />
                    Doprava zdarma
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    + {formatPrice(bestOffer.shipping_price)} doprava
                  </div>
                )}
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleBuyClick}
              disabled={isLoading}
              className={cn(
                "w-full py-4 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3",
                "bg-gradient-to-r from-brand-orange to-brand-orange-dark text-white",
                "shadow-lg shadow-brand-orange/30 hover:shadow-xl hover:shadow-brand-orange/40",
                "hover:-translate-y-0.5 active:translate-y-0",
                isLoading && "opacity-70 cursor-wait"
              )}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Presmerovanie...
                </>
              ) : (
                <>
                  Kúpiť za {formatPrice(bestOffer.price)}
                  <ExternalLink className="h-5 w-5" />
                </>
              )}
            </button>
            
            <p className="text-center text-xs text-gray-400 mt-2">
              Budete presmerovaný na stránku predajcu
            </p>

            {/* More offers link */}
            {totalOffers > 1 && (
              <a 
                href="#ponuky" 
                className="block text-center mt-4 py-2 text-brand-orange font-medium text-sm hover:underline"
              >
                Zobraziť všetkých {totalOffers} ponúk →
              </a>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">😕</div>
            <p className="font-medium text-gray-900">Žiadne ponuky</p>
            <p className="text-sm text-gray-500 mt-1">
              Momentálne nie sú dostupné žiadne ponuky
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-5 pb-5">
        <div className="flex gap-2">
          <button
            onClick={toggleWishlist}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all border",
              isWishlisted 
                ? "bg-red-50 border-red-200 text-red-600" 
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            )}
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
            {isWishlisted ? 'V obľúbených' : 'Obľúbené'}
          </button>
          <button
            onClick={toggleCompare}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all border",
              isComparing 
                ? "bg-blue-50 border-blue-200 text-blue-600" 
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            )}
          >
            <BarChart3 className="h-4 w-4" />
            {isComparing ? 'V porovnaní' : 'Porovnať'}
          </button>
        </div>
      </div>

      {/* Trust badges */}
      <div className="px-5 pb-5 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4 text-green-500" />
            Bezpečný nákup
          </div>
          <div className="flex items-center gap-1">
            <BadgeCheck className="h-4 w-4 text-blue-500" />
            Overené obchody
          </div>
        </div>
      </div>
    </div>
  )
}
