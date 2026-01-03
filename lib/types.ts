// Product types
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
  seo_title?: string
  seo_description?: string
  created_at: string
  updated_at?: string
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

// Offer types (vendors selling products)
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
  shipping_free_above?: number
  delivery_days: string
  is_best: boolean
  cpc_rate: number
  created_at: string
}

// Vendor types
export interface Vendor {
  id: string
  company_name: string
  slug: string
  email: string
  phone?: string
  website?: string
  logo_url?: string
  description?: string
  status: 'active' | 'pending' | 'suspended'
  credit_balance: number
  default_cpc: number
  rating: number
  review_count: number
  verified: boolean
  created_at: string
}

// Category types
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string
  image_url?: string
  product_count: number
  position: number
  is_active: boolean
  children?: Category[]
}

// Brand types
export interface Brand {
  id: string
  name: string
  slug: string
  logo_url?: string
  description?: string
  website?: string
  product_count: number
}

// Feed types
export interface Feed {
  id: string
  vendor_id: string
  vendor_name?: string
  name: string
  url: string
  type: 'xml' | 'csv' | 'json'
  mapping?: Record<string, string>
  is_active: boolean
  schedule: string
  last_run_at?: string
  last_run_status?: 'success' | 'error' | 'running'
  last_run_message?: string
  products_imported: number
  products_updated: number
  products_failed: number
  created_at: string
}

// Click tracking
export interface Click {
  id: string
  offer_id: string
  product_id: string
  vendor_id: string
  user_ip?: string
  user_agent?: string
  referer?: string
  cpc_charged: number
  created_at: string
}

// Dashboard stats
export interface DashboardStats {
  total_products: number
  active_products: number
  total_vendors: number
  active_vendors: number
  total_categories: number
  total_clicks_today: number
  total_clicks_month: number
  revenue_today: number
  revenue_month: number
  top_products: {
    id: string
    title: string
    clicks: number
    revenue: number
  }[]
  top_vendors: {
    id: string
    name: string
    clicks: number
    revenue: number
  }[]
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}
