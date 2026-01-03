'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProductImage } from '@/lib/types'

interface ProductGalleryProps {
  images: ProductImage[]
  productTitle: string
}

export function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  
  // Sort images - main first
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_main) return -1
    if (b.is_main) return 1
    return a.position - b.position
  })
  
  const currentImage = sortedImages[currentIndex]
  
  const goToPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + sortedImages.length) % sortedImages.length)
  }, [sortedImages.length])
  
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % sortedImages.length)
  }, [sortedImages.length])
  
  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return
    if (e.key === 'Escape') setLightboxOpen(false)
    if (e.key === 'ArrowLeft') goToPrev()
    if (e.key === 'ArrowRight') goToNext()
  }, [lightboxOpen, goToPrev, goToNext])
  
  // Add keyboard listener
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useState(() => {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    })
  }

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
        <span className="text-6xl">📦</span>
      </div>
    )
  }

  return (
    <>
      <div className="flex gap-3">
        {/* Thumbnails */}
        {sortedImages.length > 1 && (
          <div className="flex flex-col gap-2 flex-shrink-0">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-14 h-14 rounded-lg border-2 overflow-hidden transition-all bg-white p-1",
                  index === currentIndex 
                    ? "border-brand-orange shadow-md shadow-brand-orange/20" 
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <Image
                  src={image.url}
                  alt={image.alt || `${productTitle} ${index + 1}`}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        )}
        
        {/* Main image */}
        <div className="relative flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden group">
          <div 
            className="aspect-square flex items-center justify-center p-4 cursor-zoom-in"
            onClick={() => setLightboxOpen(true)}
          >
            <Image
              src={currentImage.url}
              alt={currentImage.alt || productTitle}
              width={500}
              height={500}
              className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </div>
          
          {/* Zoom hint */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 text-white text-xs rounded-full">
              <ZoomIn className="h-3 w-3" />
              Zväčšiť
            </div>
          </div>
          
          {/* Navigation arrows */}
          {sortedImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrev() }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-brand-orange hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext() }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-brand-orange hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          
          {/* Image counter */}
          {sortedImages.length > 1 && (
            <div className="absolute bottom-4 left-4">
              <span className="px-2.5 py-1 bg-black/70 text-white text-xs rounded-full">
                {currentIndex + 1} / {sortedImages.length}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button 
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          
          {/* Image */}
          <div className="max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <Image
              src={currentImage.url}
              alt={currentImage.alt || productTitle}
              width={1200}
              height={1200}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
          
          {/* Navigation */}
          {sortedImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
          
          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <span className="px-4 py-2 bg-black/50 text-white text-sm rounded-full">
              {currentIndex + 1} / {sortedImages.length}
            </span>
          </div>
        </div>
      )}
    </>
  )
}
