"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Store,
  MousePointerClick,
  FileInput,
  History,
  Settings,
  ChevronLeft,
  Menu,
  LogOut,
  Bell,
  Search,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Produkty", href: "/admin/products", icon: Package },
  { name: "Kategórie", href: "/admin/categories", icon: FolderTree },
  { name: "Vendori", href: "/admin/vendors", icon: Store },
  { name: "Kliky & CPC", href: "/admin/clicks", icon: MousePointerClick },
  { name: "Feedy", href: "/admin/feeds", icon: FileInput },
  { name: "História importov", href: "/admin/imports", icon: History },
  { name: "Nastavenia", href: "/admin/settings", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-gray-900 text-white transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20",
          "hidden lg:flex"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          {sidebarOpen && (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-brand-orange flex items-center justify-center font-bold">
                MB
              </div>
              <span className="font-bold text-lg">MegaBuy</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", !sidebarOpen && "rotate-180")} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all",
                      isActive
                        ? "bg-brand-orange text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && <span>{item.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Späť na web</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-gray-900 text-white flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-white/10"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold">MegaBuy Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-white/10">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 h-full bg-gray-900 p-4" onClick={(e) => e.stopPropagation()}>
            <nav className="mt-8">
              <ul className="space-y-1">
                {sidebarItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium",
                          isActive
                            ? "bg-brand-orange text-white"
                            : "text-gray-400 hover:text-white hover:bg-white/10"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarOpen ? "lg:ml-64" : "lg:ml-20",
          "pt-16 lg:pt-0"
        )}
      >
        {/* Top bar */}
        <div className="hidden lg:flex h-16 items-center justify-between px-6 bg-white border-b border-gray-200">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Hľadať produkty, vendorov..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-9 h-9 rounded-full bg-brand-orange flex items-center justify-center text-white font-medium">
                M
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">Marek</p>
                <p className="text-gray-500">Admin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
