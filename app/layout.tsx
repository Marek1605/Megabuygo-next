import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MegaBuy.sk - Porovnávač cien',
  description: 'Nájdite najlepšie ceny elektroniky, počítačov a ďalších produktov na Slovensku.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <body style={{margin:0,fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"}}>
        {children}
      </body>
    </html>
  )
}
