'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/products', label: 'Produkty', icon: '📦' },
  { href: '/admin/categories', label: 'Kategórie', icon: '📁' },
  { href: '/admin/feeds', label: 'Feedy', icon: '📥' },
  { href: '/admin/filters', label: 'Filtre', icon: '🎛️' },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      <style jsx global>{`
        .admin-wrapper{display:flex;min-height:100vh;background:#f8fafc}
        .admin-sidebar{width:240px;background:#fff;border-right:1px solid #e5e7eb;padding:20px 0;flex-shrink:0;position:sticky;top:0;height:100vh}
        .admin-logo{padding:0 20px 20px;border-bottom:1px solid #e5e7eb;margin-bottom:20px}
        .admin-logo a{font-size:20px;font-weight:700;color:#c9a87c;text-decoration:none}
        .admin-nav{display:flex;flex-direction:column;gap:4px;padding:0 12px}
        .admin-nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;color:#4b5563;font-size:14px;font-weight:500;text-decoration:none;transition:all .15s}
        .admin-nav-item:hover{background:#f3f4f6;color:#1f2937}
        .admin-nav-item.active{background:#fef7ed;color:#c9a87c}
        .admin-nav-icon{font-size:18px}
        .admin-content{flex:1;padding:24px;overflow-x:hidden}
      `}</style>

      <div className="admin-wrapper">
        <aside className="admin-sidebar">
          <div className="admin-logo">
            <Link href="/admin">MegaBuy Admin</Link>
          </div>
          <nav className="admin-nav">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)) ? 'active' : ''}`}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="admin-content">
          {children}
        </main>
      </div>
    </>
  )
}
