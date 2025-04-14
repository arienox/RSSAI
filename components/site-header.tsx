import Link from "next/link"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">RSSAI</span>
          </Link>
          <nav className="hidden md:flex md:ml-6 md:gap-6">
            <Link 
              href="/feeds" 
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Feeds
            </Link>
            <Link 
              href="/articles" 
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Articles
            </Link>
            <Link 
              href="/about" 
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              About
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </div>
      </div>
    </header>
  )
} 