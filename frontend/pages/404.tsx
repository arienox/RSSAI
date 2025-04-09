import Link from 'next/link'
import { useEffect } from 'react'

export default function Custom404() {
  useEffect(() => {
    // Log the 404 error
    console.error('404 page not found')
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="mb-8 text-lg">The page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Return Home
      </Link>
    </div>
  )
} 