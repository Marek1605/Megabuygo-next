import type { 
  Product, Offer, Vendor, Category, Brand, Feed, 
  DashboardStats, ApiResponse, PaginatedResponse 
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

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
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        return { success: false, error: data.error || 'Request failed' }
      }
      
      return { success: true, data: data.data || data }
    } catch (error) {
      console.error('API Error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  // ============ PRODUCTS ============
  async getProducts(params?: {
    page?: number
    limit?: number
    search?: string
    category_id?: string
    brand_id?: string
    status?: string
    sort?: string
    order?: string
    price_min?: number
    price_max?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.set(key, String(value))
        }
      })
    }
    return this.request<PaginatedResponse<Product>>(
      `/api/v1/admin/products?${searchParams}`
    )
  }

  async getProduct(id: string) {
    return this.request<Product>(`/api/v1/admin/products/${id}`)
  }

  async getProductBySlug(slug: string) {
    return this.request<Product>(`/api/v1/products/${slug}`)
  }

  async createProduct(product: Partial<Product>) {
    return this.request<{ id: string }>('/api/v1/admin/products', {
      method: 'POST',
      body: JSON.stringify(product),
    })
  }

  async updateProduct(id: string, product: Partial<Product>) {
    return this.request<void>(`/api/v1/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    })
  }

  async deleteProduct(id: string) {
    return this.request<void>(`/api/v1/admin/products/${id}`, {
      method: 'DELETE',
    })
  }

  async uploadProductImage(productId: string, file: File, isMain: boolean = false) {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('is_main', String(isMain))
    
    return this.request<{ url: string }>(`/api/v1/admin/products/${productId}/images`, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData as any,
    })
  }

  async deleteProductImage(productId: string, imageId: string) {
    return this.request<void>(`/api/v1/admin/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
    })
  }

  // ============ OFFERS ============
  async getProductOffers(productId: string) {
    return this.request<Offer[]>(`/api/v1/products/${productId}/offers`)
  }

  async createOffer(offer: Partial<Offer>) {
    return this.request<{ id: string }>('/api/v1/admin/offers', {
      method: 'POST',
      body: JSON.stringify(offer),
    })
  }

  async updateOffer(id: string, offer: Partial<Offer>) {
    return this.request<void>(`/api/v1/admin/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(offer),
    })
  }

  async deleteOffer(id: string) {
    return this.request<void>(`/api/v1/admin/offers/${id}`, {
      method: 'DELETE',
    })
  }

  // ============ CLICK TRACKING ============
  async trackClick(offerId: string) {
    return this.request<{ redirect_url: string }>(`/api/v1/go/${offerId}`, {
      method: 'POST',
    })
  }

  // ============ VENDORS ============
  async getVendors(params?: { page?: number; limit?: number; status?: string }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value))
      })
    }
    return this.request<PaginatedResponse<Vendor>>(
      `/api/v1/admin/vendors?${searchParams}`
    )
  }

  async getVendor(id: string) {
    return this.request<Vendor>(`/api/v1/admin/vendors/${id}`)
  }

  async createVendor(vendor: Partial<Vendor>) {
    return this.request<{ id: string }>('/api/v1/admin/vendors', {
      method: 'POST',
      body: JSON.stringify(vendor),
    })
  }

  async updateVendor(id: string, vendor: Partial<Vendor>) {
    return this.request<void>(`/api/v1/admin/vendors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vendor),
    })
  }

  async addVendorCredit(id: string, amount: number, note?: string) {
    return this.request<void>(`/api/v1/admin/vendors/${id}/credit`, {
      method: 'POST',
      body: JSON.stringify({ amount, note }),
    })
  }

  // ============ CATEGORIES ============
  async getCategories(params?: { parent_id?: string; flat?: boolean }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value))
      })
    }
    return this.request<Category[]>(`/api/v1/categories?${searchParams}`)
  }

  async getCategoryTree() {
    return this.request<Category[]>('/api/v1/categories/tree')
  }

  async getCategory(id: string) {
    return this.request<Category>(`/api/v1/admin/categories/${id}`)
  }

  async createCategory(category: Partial<Category>) {
    return this.request<{ id: string }>('/api/v1/admin/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    })
  }

  async updateCategory(id: string, category: Partial<Category>) {
    return this.request<void>(`/api/v1/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    })
  }

  async deleteCategory(id: string) {
    return this.request<void>(`/api/v1/admin/categories/${id}`, {
      method: 'DELETE',
    })
  }

  // ============ BRANDS ============
  async getBrands(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value))
      })
    }
    return this.request<PaginatedResponse<Brand>>(`/api/v1/brands?${searchParams}`)
  }

  async createBrand(brand: Partial<Brand>) {
    return this.request<{ id: string }>('/api/v1/admin/brands', {
      method: 'POST',
      body: JSON.stringify(brand),
    })
  }

  // ============ FEEDS ============
  async getFeeds(params?: { page?: number; limit?: number; vendor_id?: string }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value))
      })
    }
    return this.request<PaginatedResponse<Feed>>(`/api/v1/admin/feeds?${searchParams}`)
  }

  async getFeed(id: string) {
    return this.request<Feed>(`/api/v1/admin/feeds/${id}`)
  }

  async createFeed(feed: Partial<Feed>) {
    return this.request<{ id: string }>('/api/v1/admin/feeds', {
      method: 'POST',
      body: JSON.stringify(feed),
    })
  }

  async updateFeed(id: string, feed: Partial<Feed>) {
    return this.request<void>(`/api/v1/admin/feeds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(feed),
    })
  }

  async runFeed(id: string) {
    return this.request<void>(`/api/v1/admin/feeds/${id}/run`, {
      method: 'POST',
    })
  }

  async deleteFeed(id: string) {
    return this.request<void>(`/api/v1/admin/feeds/${id}`, {
      method: 'DELETE',
    })
  }

  // ============ DASHBOARD ============
  async getDashboardStats() {
    return this.request<DashboardStats>('/api/v1/admin/dashboard')
  }

  async getClickStats(params?: { 
    start_date?: string
    end_date?: string
    vendor_id?: string 
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value))
      })
    }
    return this.request<any>(`/api/v1/admin/clicks/stats?${searchParams}`)
  }
}

export const api = new ApiClient()
