import type { Product, Offer, Vendor, Category } from './types'

// Go Backend API URL - nastav v .env.local
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    })
    if (!res.ok) {
      console.error('API Error:', res.status, res.statusText)
      return null
    }
    const json = await res.json()
    if (json.success === false) {
      console.error('API Error:', json.error)
      return null
    }
    return json.data !== undefined ? json.data : json
  } catch (error) {
    console.error('API Error:', error)
    return null
  }
}

export const api = {
  // ============ PUBLIC API ============
  
  getProducts: async (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return fetchApi<PaginatedResponse<Product>>(`/api/v1/products${query}`)
  },
  
  getProductBySlug: async (slug: string) => {
    return fetchApi<Product>(`/api/v1/products/${slug}`)
  },
  
  getFeaturedProducts: async (limit?: number) => {
    const query = limit ? `?limit=${limit}` : ''
    return fetchApi<Product[]>(`/api/v1/products/featured${query}`)
  },
  
  getProductsByCategory: async (categorySlug: string) => {
    return fetchApi<Product[]>(`/api/v1/categories/${categorySlug}/products`)
  },
  
  getProductOffers: async (productId: string) => {
    return fetchApi<Offer[]>(`/api/v1/products/${productId}/offers`)
  },
  
  getCategories: async () => {
    return fetchApi<Category[]>(`/api/v1/categories`)
  },
  
  getCategoriesTree: async () => {
    return fetchApi<(Category & { children: Category[] })[]>(`/api/v1/categories?tree=true`)
  },
  
  getCategoryBySlug: async (slug: string) => {
    return fetchApi<Category>(`/api/v1/categories/${slug}`)
  },
  
  getStats: async () => {
    return fetchApi<{ products: number; vendors: number; categories: number; offers: number }>(`/api/v1/stats`)
  },
  
  trackClick: async (offerId: string) => {
    return fetchApi<{ redirect_url: string }>(`/api/v1/go/${offerId}`, { method: 'POST' })
  },

  // ============ ADMIN API ============
  
  getAdminDashboard: async () => {
    return fetchApi<{ products: number; vendors: number; categories: number; offers: number }>(`/api/v1/admin/dashboard`)
  },
  
  getAdminProducts: async (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return fetchApi<PaginatedResponse<Product>>(`/api/v1/admin/products${query}`)
  },
  
  getProduct: async (id: string) => {
    return fetchApi<Product>(`/api/v1/admin/products/${id}`)
  },
  
  createProduct: async (data: Partial<Product>) => {
    return fetchApi<{ id: string; slug: string }>('/api/v1/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  
  updateProduct: async (id: string, data: Partial<Product>) => {
    return fetchApi<{ message: string }>(`/api/v1/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
  
  deleteProduct: async (id: string) => {
    return fetchApi<{ message: string }>(`/api/v1/admin/products/${id}`, {
      method: 'DELETE',
    })
  },
  
  getCategoriesFlat: async () => {
    return fetchApi<(Category & { depth: number; path: string })[]>(`/api/v1/admin/categories?flat=true`)
  },
  
  getCategoryById: async (id: string) => {
    return fetchApi<Category>(`/api/v1/admin/categories/${id}`)
  },
  
  createCategory: async (data: Partial<Category>) => {
    return fetchApi<{ id: string; slug: string }>('/api/v1/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  
  updateCategory: async (id: string, data: Partial<Category>) => {
    return fetchApi<{ message: string }>(`/api/v1/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
  
  deleteCategory: async (id: string) => {
    return fetchApi<{ message: string }>(`/api/v1/admin/categories/${id}`, {
      method: 'DELETE',
    })
  },
  
  getVendors: async () => {
    return fetchApi<Vendor[]>(`/api/v1/admin/vendors`)
  },
  
  // ============ UPLOAD ============
  
  uploadImage: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/upload`, {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (json.success) {
        return json.data
      }
      return null
    } catch (error) {
      console.error('Upload error:', error)
      return null
    }
  },
  
  uploadImages: async (files: FileList) => {
    const results = []
    for (let i = 0; i < files.length; i++) {
      const result = await api.uploadImage(files[i])
      if (result) {
        results.push({
          id: result.filename,
          url: result.url,
          is_main: i === 0,
        })
      }
    }
    return results
  },
}

export function formatPrice(price: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}
