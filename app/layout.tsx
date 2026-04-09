import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Chek & Recheck Turnitin — By Arwani D\'Gabriel',
  description: 'Cek plagiasi dokumenmu 100% No Repository, proses cepat 24 jam. Teliti, aman, terpercaya.',
  openGraph: {
    title: 'Chek & Recheck Turnitin',
    description: 'Layanan cek plagiasi profesional 24 jam. 100% No Repository.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
