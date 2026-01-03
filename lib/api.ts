import { API_URL } from "./utils"

export interface Product {
  id: string
  title: string
  slug: string
  description?: string
  ean?: string
  sku?: string
  image_url?: string
  price_min: number
  price_max: number
  offer_count: number
  is_active: boolean
  category_id: string
  category_name?: string
  brand_id?: string
  brand_name?: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  parent_id?: string
  product_count?: number
  children?: Category[]
}

export interface Vendor {
  id: string
  company_name: string
  email: string
  website?: string
  logo_url?: string
  status: string
  credit_balance: number
  default_cpc: number
  created_at: string
}

export interface Offer {
  id: string
  product_id: string
  vendor_id: string
  vendor_name: string
  price: number
  original_price?: number
  url: string
  availability: string
  shipping_price?: number
  delivery_time?: string
}

export interface Feed {
  id: number
  name: string
  feed_url: string
  feed_type: string
  active: boolean
  last_import_at?: string
  last_import_status?: string
  products_imported: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        return { success: false, error: data.error || "Request failed" }
      }
      
      return data
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  // Products
  async getProducts(params?: {
    page?: number
    limit?: number
    search?: string
    category_id?: string
    status?: string
    sort?: string
    order?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value))
      })
    }
    return this.request<{ products: Product[]; total: number; page: number; limit: number }>(
      `/api/v1/admin/products?${searchParams}`
    )
  }

  async getProduct(id: string) {
    return this.request<Product>(`/api/v1/admin/products/${id}`)
  }

  async createProduct(product: Partial<Product>) {
    return this.request<{ id: string }>("/api/v1/admin/products", {
      method: "POST",
      body: JSON.stringify(product),
    })
  }

  async updateProduct(id: string, product: Partial<Product>) {
    return this.request<void>(`/api/v1/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    })
  }

  async deleteProduct(id: string) {
    return this.request<void>(`/api/v1/admin/products/${id}`, {
      method: "DELETE",
    })
  }

  // Categories
  async getCategories() {
    return this.request<{ categories: Category[] }>("/api/v1/categories")
  }

  // Vendors
  async getVendors(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value))
      })
    }
    return this.request<{ vendors: Vendor[]; total: number }>(
      `/api/v1/admin/vendors?${searchParams}`
    )
  }

  // Feeds
  async getFeeds(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value))
      })
    }
    return this.request<{ feeds: Feed[]; total: number }>(
      `/api/v1/admin/feeds?${searchParams}`
    )
  }

  // Dashboard stats
  async getDashboardStats() {
    return this.request<{
      total_products: number
      total_vendors: number
      total_categories: number
      total_clicks: number
      today_clicks: number
      total_revenue: number
    }>("/api/v1/admin/dashboard")
  }
}

export const api = new ApiClient()
