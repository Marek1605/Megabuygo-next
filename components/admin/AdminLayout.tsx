'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/products', label: 'Produkty', icon: '📦' },
  { href: '/admin/vendors', label: 'Predajcovia', icon: '🏪' },
  { href: '/admin/categories', label: 'Kategórie', icon: '📁' },
  { href: '/admin/feeds', label: 'Importy', icon: '📥' },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      <style jsx global>{`
        .admin-wrapper{display:flex;min-height:100vh;background:#f8fafc}
        .admin-sidebar{width:240px;background:#fff;border-right:1px solid #e5e7eb;padding:20px 0;flex-shrink:0;position:sticky;top:0;height:100vh}
        .admin-logo{padding:0 20px 20px;border-bottom:1px solid #e5e7eb;margin-bottom:20px}
        .admin-logo a{font-size:20px;font-weight:700;color:#ff6b35;text-decoration:none}
        .admin-nav{display:flex;flex-direction:column;gap:4px;padding:0 12px}
        .admin-nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;color:#4b5563;font-size:14px;font-weight:500;text-decoration:none;transition:all .15s}
        .admin-nav-item:hover{background:#f3f4f6;color:#1f2937}
        .admin-nav-item.active{background:#fff5f0;color:#ff6b35}
        .admin-nav-icon{font-size:18px}
        .admin-content{flex:1;padding:24px;overflow-x:hidden}
        .admin-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
        .admin-title{font-size:24px;font-weight:700;color:#1f2937;margin:0}
        .admin-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;background:#ff6b35;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;transition:all .15s}
        .admin-btn:hover{background:#e55a2b}
        .admin-btn-outline{background:#fff;color:#374151;border:1px solid #d1d5db}
        .admin-btn-outline:hover{background:#f9fafb;border-color:#9ca3af}
        .admin-card{background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden}
        .admin-card-header{padding:16px 20px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#1f2937}
        .admin-card-body{padding:20px}
        .admin-table{width:100%;border-collapse:collapse}
        .admin-table th,.admin-table td{padding:12px 16px;text-align:left;border-bottom:1px solid #e5e7eb}
        .admin-table th{background:#f9fafb;font-weight:600;font-size:12px;color:#6b7280;text-transform:uppercase}
        .admin-table tr:hover{background:#f9fafb}
        .admin-form-group{margin-bottom:16px}
        .admin-label{display:block;font-size:14px;font-weight:500;color:#374151;margin-bottom:6px}
        .admin-input,.admin-select,.admin-textarea{width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;outline:none;transition:border-color .15s}
        .admin-input:focus,.admin-select:focus,.admin-textarea:focus{border-color:#ff6b35}
        .admin-textarea{resize:vertical;min-height:100px}
        .admin-grid{display:grid;gap:16px}
        .admin-grid-2{grid-template-columns:repeat(2,1fr)}
        .admin-grid-3{grid-template-columns:repeat(3,1fr)}
        .admin-grid-4{grid-template-columns:repeat(4,1fr)}
        .admin-stat{background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:20px}
        .admin-stat-label{font-size:13px;color:#6b7280;margin-bottom:4px}
        .admin-stat-value{font-size:28px;font-weight:700;color:#1f2937}
        .admin-badge{display:inline-flex;align-items:center;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:500}
        .admin-badge-success{background:#dcfce7;color:#16a34a}
        .admin-badge-warning{background:#fef3c7;color:#d97706}
        .admin-badge-danger{background:#fee2e2;color:#dc2626}
        .admin-tabs{display:flex;gap:4px;border-bottom:1px solid #e5e7eb;margin-bottom:20px}
        .admin-tab{padding:10px 16px;border:none;background:none;font-size:14px;font-weight:500;color:#6b7280;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px}
        .admin-tab:hover{color:#374151}
        .admin-tab.active{color:#ff6b35;border-bottom-color:#ff6b35}
        .admin-pagination{display:flex;justify-content:center;gap:8px;margin-top:20px}
        .admin-pagination button{padding:8px 14px;border:1px solid #d1d5db;border-radius:6px;background:#fff;cursor:pointer}
        .admin-pagination button:hover{border-color:#ff6b35;color:#ff6b35}
        .admin-pagination button.active{background:#ff6b35;border-color:#ff6b35;color:#fff}
        @media(max-width:768px){
          .admin-sidebar{display:none}
          .admin-grid-2,.admin-grid-3,.admin-grid-4{grid-template-columns:1fr}
        }
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
