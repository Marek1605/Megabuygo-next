'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { 
  Save, X, Plus, Trash2, GripVertical, Upload, 
  Image as ImageIcon, AlertCircle, Check, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product, ProductImage, ProductAttribute, Category, Brand } from '@/lib/types'

interface ProductFormProps {
  product?: Product
  categories: Category[]
  brands: Brand[]
  onSave: (data: Partial<Product>) => Promise<void>
  onCancel: () => void
}

export function ProductForm({ product, categories, brands, onSave, onCancel }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'attributes' | 'seo'>('basic')
  
  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    title: product?.title || '',
    slug: product?.slug || '',
    description: product?.description || '',
    short_description: product?.short_description || '',
    ean: product?.ean || '',
    sku: product?.sku || '',
    mpn: product?.mpn || '',
    category_id: product?.category_id || '',
    brand_id: product?.brand_id || '',
    price_min: product?.price_min || 0,
    price_max: product?.price_max || 0,
    stock_status: product?.stock_status || 'instock',
    stock_quantity: product?.stock_quantity || 0,
    is_active: product?.is_active ?? true,
    seo_title: product?.seo_title || '',
    seo_description: product?.seo_description || '',
  })
  
  const [images, setImages] = useState<ProductImage[]>(product?.images || [])
  const [attributes, setAttributes] = useState<ProductAttribute[]>(product?.attributes || [])
  const [uploadingImages, setUploadingImages] = useState<string[]>([])

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }))
  }

  // Image upload
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const tempId = `temp-${Date.now()}-${Math.random()}`
      setUploadingImages(prev => [...prev, tempId])
      
      // Create preview
      const preview = URL.createObjectURL(file)
      const tempImage: ProductImage = {
        id: tempId,
        url: preview,
        position: images.length,
        is_main: images.length === 0
      }
      setImages(prev => [...prev, tempImage])
      
      // TODO: Upload to server
      // const response = await api.uploadProductImage(product?.id || 'new', file, images.length === 0)
      
      // Simulate upload
      await new Promise(r => setTimeout(r, 1500))
      
      setUploadingImages(prev => prev.filter(id => id !== tempId))
      // Update with real URL from server
      // setImages(prev => prev.map(img => img.id === tempId ? { ...img, id: response.id, url: response.url } : img))
    }
  }, [images.length])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: 5 * 1024 * 1024
  })

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id)
      // Ensure there's always a main image
      if (filtered.length > 0 && !filtered.some(img => img.is_main)) {
        filtered[0].is_main = true
      }
      return filtered
    })
  }

  const setMainImage = (id: string) => {
    setImages(prev => prev.map(img => ({
      ...img,
      is_main: img.id === id
    })))
  }

  // Attributes
  const addAttribute = () => {
    setAttributes(prev => [...prev, {
      id: `attr-${Date.now()}`,
      name: '',
      value: '',
      filterable: false,
      visible: true
    }])
  }

  const updateAttribute = (id: string, field: keyof ProductAttribute, value: any) => {
    setAttributes(prev => prev.map(attr => 
      attr.id === id ? { ...attr, [field]: value } : attr
    ))
  }

  const removeAttribute = (id: string) => {
    setAttributes(prev => prev.filter(attr => attr.id !== id))
  }

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await onSave({
        ...formData,
        images,
        attributes
      })
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'basic', label: 'Základné info' },
    { id: 'media', label: 'Obrázky' },
    { id: 'attributes', label: 'Atribúty' },
    { id: 'seo', label: 'SEO' },
  ] as const

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-900">
          {product ? 'Upraviť produkt' : 'Nový produkt'}
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Zrušiť
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-brand-orange text-white rounded-lg font-medium hover:bg-brand-orange-dark transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Uložiť
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === tab.id
                ? "border-brand-orange text-brand-orange"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* BASIC TAB */}
        {activeTab === 'basic' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Názov produktu *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                  placeholder="iPhone 15 Pro Max 256GB"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  URL slug
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
                    /produkt/
                  </span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                    placeholder="iphone-15-pro-max-256gb"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kategória *
                </label>
                <select
                  value={formData.category_id}
                  onChange={e => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                  required
                >
                  <option value="">Vyberte kategóriu</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Značka
                </label>
                <select
                  value={formData.brand_id}
                  onChange={e => setFormData(prev => ({ ...prev, brand_id: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                >
                  <option value="">Bez značky</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              {/* Short description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Krátky popis
                </label>
                <textarea
                  value={formData.short_description}
                  onChange={e => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none resize-none"
                  placeholder="Krátky popis produktu pre náhľad..."
                />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {/* IDs row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    EAN
                  </label>
                  <input
                    type="text"
                    value={formData.ean}
                    onChange={e => setFormData(prev => ({ ...prev, ean: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                    placeholder="5901234123457"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                    placeholder="APL-IP15PM-256"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    MPN
                  </label>
                  <input
                    type="text"
                    value={formData.mpn}
                    onChange={e => setFormData(prev => ({ ...prev, mpn: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                    placeholder="MU793"
                  />
                </div>
              </div>

              {/* Price range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Cena od (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_min}
                    onChange={e => setFormData(prev => ({ ...prev, price_min: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Cena do (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_max}
                    onChange={e => setFormData(prev => ({ ...prev, price_max: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                  />
                </div>
              </div>

              {/* Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Stav skladu
                  </label>
                  <select
                    value={formData.stock_status}
                    onChange={e => setFormData(prev => ({ ...prev, stock_status: e.target.value as any }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                  >
                    <option value="instock">Skladom</option>
                    <option value="outofstock">Nedostupné</option>
                    <option value="onbackorder">Na objednávku</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Počet kusov
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={e => setFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                  />
                  <span className="text-sm font-medium text-gray-700">Produkt je aktívny</span>
                </label>
              </div>

              {/* Full description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Plný popis
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none resize-none"
                  placeholder="Detailný popis produktu..."
                />
              </div>
            </div>
          </div>
        )}

        {/* MEDIA TAB */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                isDragActive 
                  ? "border-brand-orange bg-brand-orange/5" 
                  : "border-gray-300 hover:border-gray-400"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium">
                {isDragActive ? 'Pustite súbory sem...' : 'Pretiahnite obrázky sem alebo kliknite'}
              </p>
              <p className="text-sm text-gray-400 mt-1">PNG, JPG, WEBP do 5MB</p>
            </div>

            {/* Images grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div 
                    key={image.id}
                    className={cn(
                      "relative group rounded-xl border-2 overflow-hidden bg-gray-50",
                      image.is_main ? "border-brand-orange" : "border-gray-200"
                    )}
                  >
                    <div className="aspect-square relative">
                      <Image
                        src={image.url}
                        alt={image.alt || `Image ${index + 1}`}
                        fill
                        className="object-contain p-2"
                      />
                      
                      {/* Loading overlay */}
                      {uploadingImages.includes(image.id) && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-brand-orange animate-spin" />
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setMainImage(image.id)}
                        className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          image.is_main 
                            ? "bg-brand-orange text-white" 
                            : "bg-white/90 text-gray-600 hover:bg-white"
                        )}
                        title="Nastaviť ako hlavný"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="p-1.5 bg-white/90 text-red-500 rounded-lg hover:bg-white transition-colors"
                        title="Odstrániť"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Main badge */}
                    {image.is_main && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-brand-orange text-white text-xs font-medium rounded">
                        Hlavný
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ATTRIBUTES TAB */}
        {activeTab === 'attributes' && (
          <div className="space-y-4">
            {attributes.map((attr, index) => (
              <div key={attr.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={attr.name}
                    onChange={e => updateAttribute(attr.id, 'name', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                    placeholder="Názov (napr. Farba)"
                  />
                  <input
                    type="text"
                    value={attr.value}
                    onChange={e => updateAttribute(attr.id, 'value', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                    placeholder="Hodnota (napr. Čierna)"
                  />
                </div>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attr.filterable}
                    onChange={e => updateAttribute(attr.id, 'filterable', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                  />
                  <span className="text-sm text-gray-600">Filter</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attr.visible}
                    onChange={e => updateAttribute(attr.id, 'visible', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                  />
                  <span className="text-sm text-gray-600">Viditeľný</span>
                </label>
                
                <button
                  type="button"
                  onClick={() => removeAttribute(attr.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addAttribute}
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-brand-orange hover:text-brand-orange transition-colors"
            >
              <Plus className="h-4 w-4" />
              Pridať atribút
            </button>
          </div>
        )}

        {/* SEO TAB */}
        {activeTab === 'seo' && (
          <div className="space-y-5 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                SEO Titulok
              </label>
              <input
                type="text"
                value={formData.seo_title}
                onChange={e => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                placeholder="Titulok pre vyhľadávače"
              />
              <p className="text-xs text-gray-400 mt-1">
                {(formData.seo_title || formData.title || '').length}/60 znakov
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                SEO Popis
              </label>
              <textarea
                value={formData.seo_description}
                onChange={e => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none resize-none"
                placeholder="Meta popis pre vyhľadávače"
              />
              <p className="text-xs text-gray-400 mt-1">
                {(formData.seo_description || '').length}/160 znakov
              </p>
            </div>

            {/* Preview */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400 mb-2">Náhľad vo vyhľadávači:</p>
              <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                {formData.seo_title || formData.title || 'Titulok produktu'}
              </div>
              <div className="text-green-700 text-sm">
                megabuy.sk › produkt › {formData.slug || 'url-produktu'}
              </div>
              <div className="text-gray-600 text-sm mt-1">
                {formData.seo_description || formData.short_description || 'Popis produktu bude zobrazený tu...'}
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
