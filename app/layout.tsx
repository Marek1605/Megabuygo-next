import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter"
})

export const metadata: Metadata = {
  title: "MegaBuy.sk - Porovnávač cien",
  description: "Nájdite najlepšie ceny elektroniky, počítačov a ďalších produktov na Slovensku. Porovnávame ceny z 500+ overených obchodov.",
  keywords: "porovnávač cien, najlacnejšie, slovensko, elektronika, počítače, mobily",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sk">
      <body className={`${inter.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
