import type { Product, Offer, Vendor, Category, PaginatedResponse } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.data || data
  } catch (error) {
    console.error('API Error:', error)
    return null
  }
}

export const api = {
  // Products
  getProducts: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return fetchApi<PaginatedResponse<Product>>(`/api/v1/admin/products${query}`)
  },
  getProduct: (id: string) => fetchApi<Product>(`/api/v1/admin/products/${id}`),
  getProductBySlug: (slug: string) => fetchApi<Product>(`/api/v1/products/${slug}`),
  createProduct: (data: Partial<Product>) => fetchApi<{id: string}>('/api/v1/admin/products', {
    method: 'POST', body: JSON.stringify(data)
  }),
  updateProduct: (id: string, data: Partial<Product>) => fetchApi<void>(`/api/v1/admin/products/${id}`, {
    method: 'PUT', body: JSON.stringify(data)
  }),
  deleteProduct: (id: string) => fetchApi<void>(`/api/v1/admin/products/${id}`, { method: 'DELETE' }),

  // Offers
  getProductOffers: (productId: string) => fetchApi<Offer[]>(`/api/v1/products/${productId}/offers`),
  
  // Categories
  getCategories: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return fetchApi<Category[]>(`/api/v1/categories${query}`)
  },
  getCategoryBySlug: (slug: string) => fetchApi<Category>(`/api/v1/categories/${slug}`),

  // Vendors
  getVendors: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return fetchApi<PaginatedResponse<Vendor>>(`/api/v1/admin/vendors${query}`)
  },

  // Click tracking
  trackClick: (offerId: string) => fetchApi<{redirect_url: string}>(`/api/v1/go/${offerId}`, { method: 'POST' }),
}

export function formatPrice(price: number): string {
  return price.toFixed(2).replace('.', ',') + ' €'
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
