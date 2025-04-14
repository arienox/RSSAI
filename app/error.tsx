'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-6xl font-bold mb-4">500</h1>
      <h2 className="text-2xl font-semibold mb-6">Something went wrong</h2>
      <p className="mb-8 text-lg">We&apos;re sorry, but we couldn&apos;t process your request at this time.</p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
        <Link href="/" className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
          Return Home
        </Link>
      </div>
    </div>
  );
} 