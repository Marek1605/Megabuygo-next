export interface Product {
  id: string
  title: string
  slug: string
  description?: string
  short_description?: string
  ean?: string
  sku?: string
  mpn?: string
  brand_id?: string
  brand_name?: string
  category_id: string
  category_name?: string
  image_url?: string
  images?: ProductImage[]
  price_min: number
  price_max: number
  offer_count: number
  is_active: boolean
  stock_status: 'instock' | 'outofstock' | 'onbackorder'
  stock_quantity?: number
  attributes?: ProductAttribute[]
  rating?: number
  review_count?: number
  created_at: string
}

export interface ProductImage {
  id: string
  url: string
  alt?: string
  position: number
  is_main: boolean
}

export interface ProductAttribute {
  id: string
  name: string
  value: string
  filterable: boolean
  visible: boolean
}

export interface Offer {
  id: string
  product_id: string
  vendor_id: string
  vendor: Vendor
  price: number
  original_price?: number
  url: string
  affiliate_url?: string
  availability: 'instock' | 'outofstock' | 'preorder'
  stock_quantity?: number
  shipping_price: number
  delivery_days: string
  is_best: boolean
  is_megabuy: boolean
  can_add_to_cart: boolean
}

export interface Vendor {
  id: string
  company_name: string
  slug: string
  logo_url?: string
  rating: number
  review_count: number
  verified: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string
  image_url?: string
  emoji?: string
  product_count: number
  children?: Category[]
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}
