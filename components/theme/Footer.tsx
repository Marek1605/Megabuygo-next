import Link from 'next/link'

export function Footer() {
  return (
    <>
      <style jsx>{`
        .mp-footer{background:#1f2937;color:#fff;padding:60px 0 30px;margin-top:60px}
        .mp-footer__grid{display:grid;grid-template-columns:repeat(5,1fr);gap:40px;max-width:1400px;margin:0 auto 40px;padding:0 20px}
        .mp-footer__title{font-size:16px;font-weight:600;margin-bottom:20px}
        .mp-footer__links{list-style:none;margin:0;padding:0}
        .mp-footer__links li{margin-bottom:10px}
        .mp-footer__links a{color:rgba(255,255,255,0.7)}
        .mp-footer__links a:hover{color:#fff}
        .mp-footer__vendor-cta{background:rgba(255,107,53,0.15);border-radius:8px;padding:16px;margin-top:16px}
        .mp-footer__vendor-cta a{display:inline-flex;align-items:center;gap:8px;color:#ff6b35;font-weight:600}
        .mp-footer__vendor-cta a:hover{color:#fff}
        .mp-footer__bottom{border-top:1px solid rgba(255,255,255,0.1);padding-top:30px;text-align:center;color:rgba(255,255,255,0.6);font-size:14px;max-width:1400px;margin:0 auto;padding-left:20px;padding-right:20px}
        @media(max-width:992px){.mp-footer__grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:600px){.mp-footer__grid{grid-template-columns:1fr}}
      `}</style>

      <footer className="mp-footer">
        <div className="mp-footer__grid">
          <div>
            <h3 className="mp-footer__title">O nás</h3>
            <ul className="mp-footer__links">
              <li><Link href="/o-nas">O MegaBuy.sk</Link></li>
              <li><Link href="/kontakt">Kontakt</Link></li>
              <li><Link href="/kariera">Kariéra</Link></li>
              <li><Link href="/pre-obchody">Pre obchody</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mp-footer__title">Nakupovanie</h3>
            <ul className="mp-footer__links">
              <li><Link href="/ako-funguje">Ako to funguje</Link></li>
              <li><Link href="/caste-otazky">Časté otázky</Link></li>
              <li><Link href="/reklamacie">Reklamácie</Link></li>
              <li><Link href="/doprava">Doprava</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mp-footer__title">Pre predajcov</h3>
            <ul className="mp-footer__links">
              <li><Link href="/prihlasenie-predajcu">🔐 Prihlásenie predajcu</Link></li>
              <li><Link href="/registracia-predajcu">📝 Registrácia predajcu</Link></li>
              <li><Link href="/ako-to-funguje">📚 Ako to funguje</Link></li>
              <li><Link href="/cenik">💰 Cenník služieb</Link></li>
            </ul>
            <div className="mp-footer__vendor-cta">
              <Link href="/registracia-predajcu">
                🏪 Začnite predávať už dnes →
              </Link>
            </div>
          </div>
          <div>
            <h3 className="mp-footer__title">Právne info</h3>
            <ul className="mp-footer__links">
              <li><Link href="/obchodne-podmienky">Obchodné podmienky</Link></li>
              <li><Link href="/ochrana-osobnych-udajov">Ochrana osobných údajov</Link></li>
              <li><Link href="/cookies">Cookies</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mp-footer__title">Kontakt</h3>
            <ul className="mp-footer__links">
              <li>📧 info@megabuy.sk</li>
              <li>📞 +421 900 123 456</li>
              <li>🏢 Bratislava, SK</li>
            </ul>
          </div>
        </div>
        <div className="mp-footer__bottom">
          <p>© 2024 MegaBuy.sk. Všetky práva vyhradené.</p>
        </div>
      </footer>
    </>
  )
}
