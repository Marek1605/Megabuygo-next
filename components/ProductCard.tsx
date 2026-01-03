"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, ExternalLink, TrendingDown, Star } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/lib/api"

interface ProductCardProps {
  product: Product
  featured?: boolean
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const hasDiscount = product.price_max > product.price_min
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.price_min / product.price_max) * 100)
    : 0

  return (
    <Link 
      href={`/produkt/${product.slug}`}
      className={`group relative bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 ${featured ? 'md:col-span-2 md:row-span-2' : ''}`}
    >
      {/* Discount badge */}
      {discountPercent > 5 && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
          <TrendingDown className="h-3 w-3" />
          -{discountPercent}%
        </div>
      )}

      {/* Wishlist button */}
      <button 
        className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-red-500"
        onClick={(e) => {
          e.preventDefault()
          // TODO: Add to wishlist
        }}
      >
        <Heart className="h-4 w-4" />
      </button>

      {/* Image */}
      <div className={`relative bg-gradient-to-br from-gray-50 to-gray-100 ${featured ? 'aspect-square md:aspect-[4/3]' : 'aspect-square'}`}>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl text-gray-300">
            📦
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {product.category_name && (
          <span className="text-xs font-medium text-brand-orange uppercase tracking-wide">
            {product.category_name}
          </span>
        )}

        {/* Title */}
        <h3 className={`font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-brand-orange transition-colors ${featured ? 'text-lg md:text-xl' : 'text-sm'}`}>
          {product.title}
        </h3>

        {/* Brand */}
        {product.brand_name && (
          <p className="text-xs text-gray-500 mt-0.5">{product.brand_name}</p>
        )}

        {/* Rating placeholder */}
        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-3.5 w-3.5 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">(24)</span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-end justify-between">
          <div>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.price_max)}
              </span>
            )}
            <div className={`font-bold text-brand-navy ${featured ? 'text-2xl' : 'text-lg'}`}>
              {formatPrice(product.price_min)}
            </div>
          </div>
          
          {/* Offers count */}
          {product.offer_count > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <ExternalLink className="h-3 w-3" />
              <span>{product.offer_count} ponúk</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
