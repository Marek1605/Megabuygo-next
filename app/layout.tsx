import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin", "latin-ext"] })

export const metadata: Metadata = {
  title: "MegaBuy.sk - Porovnávač cien",
  description: "Nájdite najlepšie ceny elektroniky, počítačov a ďalších produktov na Slovensku",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sk">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
