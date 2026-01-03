'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/theme/Header'
import { Footer } from '@/components/theme/Footer'

export default function VendorLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // This would integrate with WordPress/vendor portal
    // For now, show info message
    setTimeout(() => {
      setLoading(false)
      alert('Táto stránka je prepojená s WordPress vendor portalom. Po nasadení na WordPress bude prihlásenie fungovať cez shortcode [mkma_vendor_login].')
    }, 1000)
  }

  return (
    <>
      <style jsx global>{`
        .vendor-page {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #fff5f0 100%);
        }
        .vendor-card {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          max-width: 440px;
          width: 100%;
          padding: 48px;
        }
        .vendor-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .vendor-icon {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #ff6b35, #e55a2b);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 32px;
        }
        .vendor-title {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px;
        }
        .vendor-subtitle {
          color: #6b7280;
          font-size: 15px;
        }
        .vendor-form-group {
          margin-bottom: 20px;
        }
        .vendor-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 8px;
        }
        .vendor-input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
        }
        .vendor-input:focus {
          border-color: #ff6b35;
        }
        .vendor-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #ff6b35, #e55a2b);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .vendor-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255,107,53,0.3);
        }
        .vendor-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .vendor-error {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 20px;
        }
        .vendor-links {
          margin-top: 24px;
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }
        .vendor-links a {
          color: #ff6b35;
          font-weight: 500;
        }
        .vendor-links a:hover {
          text-decoration: underline;
        }
        .vendor-forgot {
          text-align: right;
          margin-bottom: 24px;
        }
        .vendor-forgot a {
          color: #6b7280;
          font-size: 14px;
        }
        .vendor-forgot a:hover {
          color: #ff6b35;
        }
        .vendor-benefits {
          margin-top: 40px;
          padding-top: 32px;
          border-top: 1px solid #e5e7eb;
        }
        .vendor-benefits-title {
          font-size: 13px;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 16px;
          text-align: center;
        }
        .vendor-benefit {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          font-size: 14px;
          color: #4b5563;
        }
        .vendor-benefit-icon {
          width: 24px;
          height: 24px;
          background: #dcfce7;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }
      `}</style>

      <Header categories={[]} />

      <main className="vendor-page">
        <div className="vendor-card">
          <div className="vendor-header">
            <div className="vendor-icon">🏪</div>
            <h1 className="vendor-title">Prihlásenie predajcu</h1>
            <p className="vendor-subtitle">Prihláste sa do svojho vendor dashboardu</p>
          </div>

          {error && <div className="vendor-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="vendor-form-group">
              <label className="vendor-label">E-mail</label>
              <input
                type="email"
                className="vendor-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vas@email.sk"
                required
              />
            </div>

            <div className="vendor-form-group">
              <label className="vendor-label">Heslo</label>
              <input
                type="password"
                className="vendor-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="vendor-forgot">
              <Link href="/zabudnute-heslo">Zabudli ste heslo?</Link>
            </div>

            <button type="submit" className="vendor-btn" disabled={loading}>
              {loading ? 'Prihlasujem...' : 'Prihlásiť sa'}
            </button>
          </form>

          <div className="vendor-links">
            Nemáte ešte účet? <Link href="/registracia-predajcu">Zaregistrujte sa</Link>
          </div>

          <div className="vendor-benefits">
            <div className="vendor-benefits-title">Výhody predajcu</div>
            <div className="vendor-benefit">
              <span className="vendor-benefit-icon">✓</span>
              Tisíce potenciálnych zákazníkov
            </div>
            <div className="vendor-benefit">
              <span className="vendor-benefit-icon">✓</span>
              Jednoduchý import produktov
            </div>
            <div className="vendor-benefit">
              <span className="vendor-benefit-icon">✓</span>
              Podrobné štatistiky predaja
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
