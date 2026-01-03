import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('sk-SK').format(num)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('sk-SK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('sk-SK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'práve teraz'
  if (diffMins < 60) return `pred ${diffMins} min`
  if (diffHours < 24) return `pred ${diffHours} hod`
  if (diffDays < 7) return `pred ${diffDays} dňami`
  return formatDate(date)
}

export function truncate(str: string, length: number): string {
  if (!str) return ''
  return str.length > length ? str.substring(0, length) + '...' : str
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export function calculateDiscount(originalPrice: number, currentPrice: number): number {
  if (originalPrice <= 0) return 0
  return Math.round((1 - currentPrice / originalPrice) * 100)
}

export function getStockStatusText(status: string, quantity?: number): string {
  switch (status) {
    case 'instock':
      return quantity && quantity > 0 ? `Skladom (${quantity} ks)` : 'Skladom'
    case 'outofstock':
      return 'Nedostupné'
    case 'onbackorder':
      return 'Na objednávku'
    case 'preorder':
      return 'Predpredaj'
    default:
      return 'Neznámy stav'
  }
}

export function getStockStatusColor(status: string): string {
  switch (status) {
    case 'instock':
      return 'text-green-600'
    case 'outofstock':
      return 'text-red-600'
    case 'onbackorder':
    case 'preorder':
      return 'text-amber-600'
    default:
      return 'text-gray-600'
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
