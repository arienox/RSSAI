import './globals.css'

export const metadata = {
  title: 'RSSAI - RSS Feed Aggregator',
  description: 'A modern RSS feed aggregator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 