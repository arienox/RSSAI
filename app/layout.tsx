import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RSSAI',
  description: 'RSS feed aggregator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">{children}</body>
    </html>
  )
} 