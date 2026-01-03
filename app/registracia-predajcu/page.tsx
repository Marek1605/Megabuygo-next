'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/theme/Header'
import { Footer } from '@/components/theme/Footer'

export default function VendorRegistrationPage() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    shop_name: '',
    shop_url: '',
    password: '',
    password_confirm: '',
    terms: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (form.password !== form.password_confirm) {
      setError('Heslá sa nezhodujú')
      setLoading(false)
      return
    }
    
    // This would integrate with WordPress/vendor portal
    setTimeout(() => {
      setLoading(false)
      alert('Táto stránka je prepojená s WordPress vendor portalom. Po nasadení na WordPress bude registrácia fungovať cez shortcode [mkma_vendor_registration].')
    }, 1000)
  }

  const updateForm = (field: string, value: any) => {
    setForm(f => ({ ...f, [field]: value }))
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
        .vendor-container {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 60px;
          max-width: 1000px;
          width: 100%;
        }
        .vendor-card {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          padding: 48px;
        }
        .vendor-header {
          margin-bottom: 32px;
        }
        .vendor-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #ff6b35, #e55a2b);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          font-size: 28px;
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
        .vendor-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
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
        .vendor-label .required {
          color: #dc2626;
        }
        .vendor-input {
          width: 100%;
          padding: 12px 14px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
        }
        .vendor-input:focus {
          border-color: #ff6b35;
        }
        .vendor-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
        }
        .vendor-checkbox input {
          width: 18px;
          height: 18px;
          margin-top: 2px;
        }
        .vendor-checkbox span {
          font-size: 14px;
          color: #4b5563;
        }
        .vendor-checkbox a {
          color: #ff6b35;
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
        .vendor-sidebar {
          padding-top: 20px;
        }
        .sidebar-title {
          font-size: 22px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 24px;
        }
        .sidebar-step {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }
        .sidebar-step-num {
          width: 36px;
          height: 36px;
          background: #ff6b35;
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          flex-shrink: 0;
        }
        .sidebar-step-content h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px;
        }
        .sidebar-step-content p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
        }
        .sidebar-benefits {
          background: #f9fafb;
          border-radius: 16px;
          padding: 24px;
          margin-top: 32px;
        }
        .sidebar-benefits-title {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 16px;
        }
        .sidebar-benefit {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          font-size: 14px;
          color: #4b5563;
        }
        .sidebar-benefit:last-child {
          margin-bottom: 0;
        }
        .sidebar-benefit-icon {
          color: #16a34a;
        }
        @media (max-width: 900px) {
          .vendor-container {
            grid-template-columns: 1fr;
          }
          .vendor-sidebar {
            order: -1;
          }
        }
        @media (max-width: 500px) {
          .vendor-form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Header categories={[]} />

      <main className="vendor-page">
        <div className="vendor-container">
          <div className="vendor-card">
            <div className="vendor-header">
              <div className="vendor-icon">📝</div>
              <h1 className="vendor-title">Staňte sa predajcom</h1>
              <p className="vendor-subtitle">Začnite predávať na našom marketplace už dnes</p>
            </div>

            {error && <div className="vendor-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="vendor-form-row">
                <div className="vendor-form-group">
                  <label className="vendor-label">Meno <span className="required">*</span></label>
                  <input
                    type="text"
                    className="vendor-input"
                    value={form.first_name}
                    onChange={e => updateForm('first_name', e.target.value)}
                    required
                  />
                </div>
                <div className="vendor-form-group">
                  <label className="vendor-label">Priezvisko <span className="required">*</span></label>
                  <input
                    type="text"
                    className="vendor-input"
                    value={form.last_name}
                    onChange={e => updateForm('last_name', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="vendor-form-group">
                <label className="vendor-label">E-mail <span className="required">*</span></label>
                <input
                  type="email"
                  className="vendor-input"
                  value={form.email}
                  onChange={e => updateForm('email', e.target.value)}
                  required
                />
              </div>

              <div className="vendor-form-group">
                <label className="vendor-label">Názov obchodu <span className="required">*</span></label>
                <input
                  type="text"
                  className="vendor-input"
                  value={form.shop_name}
                  onChange={e => updateForm('shop_name', e.target.value)}
                  placeholder="Tento názov sa zobrazí zákazníkom"
                  required
                />
              </div>

              <div className="vendor-form-group">
                <label className="vendor-label">URL vášho e-shopu <span className="required">*</span></label>
                <input
                  type="url"
                  className="vendor-input"
                  value={form.shop_url}
                  onChange={e => updateForm('shop_url', e.target.value)}
                  placeholder="https://vaseshop.sk"
                  required
                />
              </div>

              <div className="vendor-form-row">
                <div className="vendor-form-group">
                  <label className="vendor-label">Heslo <span className="required">*</span></label>
                  <input
                    type="password"
                    className="vendor-input"
                    value={form.password}
                    onChange={e => updateForm('password', e.target.value)}
                    required
                  />
                </div>
                <div className="vendor-form-group">
                  <label className="vendor-label">Potvrdenie hesla <span className="required">*</span></label>
                  <input
                    type="password"
                    className="vendor-input"
                    value={form.password_confirm}
                    onChange={e => updateForm('password_confirm', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="vendor-form-group">
                <label className="vendor-checkbox">
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={e => updateForm('terms', e.target.checked)}
                    required
                  />
                  <span>
                    Súhlasím s <Link href="/obchodne-podmienky" target="_blank">obchodnými podmienkami</Link> a <Link href="/ochrana-osobnych-udajov" target="_blank">spracovaním osobných údajov</Link>
                  </span>
                </label>
              </div>

              <button type="submit" className="vendor-btn" disabled={loading}>
                {loading ? 'Registrujem...' : 'Zaregistrovať sa'}
              </button>
            </form>

            <div className="vendor-links">
              Už máte účet? <Link href="/prihlasenie-predajcu">Prihláste sa</Link>
            </div>
          </div>

          <div className="vendor-sidebar">
            <h2 className="sidebar-title">Ako to funguje?</h2>
            
            <div className="sidebar-step">
              <div className="sidebar-step-num">1</div>
              <div className="sidebar-step-content">
                <h4>Zaregistrujte sa</h4>
                <p>Vyplňte registračný formulár a vytvorte si účet predajcu.</p>
              </div>
            </div>

            <div className="sidebar-step">
              <div className="sidebar-step-num">2</div>
              <div className="sidebar-step-content">
                <h4>Nahrajte produkty</h4>
                <p>Importujte produkty cez XML feed alebo ich pridajte manuálne.</p>
              </div>
            </div>

            <div className="sidebar-step">
              <div className="sidebar-step-num">3</div>
              <div className="sidebar-step-content">
                <h4>Začnite predávať</h4>
                <p>Vaše produkty sa zobrazia tisícom zákazníkov hľadajúcim najlepšie ceny.</p>
              </div>
            </div>

            <div className="sidebar-benefits">
              <div className="sidebar-benefits-title">Výhody pre predajcov</div>
              <div className="sidebar-benefit">
                <span className="sidebar-benefit-icon">✓</span>
                Tisíce potenciálnych zákazníkov
              </div>
              <div className="sidebar-benefit">
                <span className="sidebar-benefit-icon">✓</span>
                Jednoduchý import z Heureka feedu
              </div>
              <div className="sidebar-benefit">
                <span className="sidebar-benefit-icon">✓</span>
                Podrobné štatistiky a analytics
              </div>
              <div className="sidebar-benefit">
                <span className="sidebar-benefit-icon">✓</span>
                PPC reklama na kľúčové produkty
              </div>
              <div className="sidebar-benefit">
                <span className="sidebar-benefit-icon">✓</span>
                Férový CPC model platenia
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
