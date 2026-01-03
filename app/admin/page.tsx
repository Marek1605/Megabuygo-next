import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-title">Dashboard</h1>
      </div>

      <div className="admin-grid admin-grid-4" style={{marginBottom: 24}}>
        <div className="admin-stat">
          <div className="admin-stat-label">Produktov</div>
          <div className="admin-stat-value">12,456</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Predajcov</div>
          <div className="admin-stat-value">234</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Kliky dnes</div>
          <div className="admin-stat-value">1,892</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Tržby CPC</div>
          <div className="admin-stat-value">189,20 €</div>
        </div>
      </div>

      <div className="admin-grid admin-grid-2">
        <div className="admin-card">
          <div className="admin-card-header">Rýchle akcie</div>
          <div className="admin-card-body">
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <Link href="/admin/products/new" className="admin-btn" style={{justifyContent:'center'}}>
                + Pridať produkt
              </Link>
              <Link href="/admin/vendors" className="admin-btn admin-btn-outline" style={{justifyContent:'center'}}>
                Spravovať predajcov
              </Link>
              <Link href="/admin/feeds" className="admin-btn admin-btn-outline" style={{justifyContent:'center'}}>
                Spustiť import feedov
              </Link>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">Posledná aktivita</div>
          <div className="admin-card-body">
            <div style={{color:'#6b7280',textAlign:'center',padding:20}}>
              <p>Žiadna nedávna aktivita</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
