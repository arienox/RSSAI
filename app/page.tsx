import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <div className="container max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <span className="text-primary">RSSAI</span> - Modern RSS Feed Aggregator
          </h1>
          <p className="text-xl text-muted-foreground max-w-prose mx-auto">
            Stay updated with the latest content from your favorite sources, enhanced with AI-powered insights.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href="/feeds"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              Get Started
            </Link>
            <Link 
              href="/about"
              className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
            >
              Learn More
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
          <div className="rounded-lg border bg-card text-card-foreground shadow p-6">
            <h3 className="text-xl font-semibold mb-2">Aggregate</h3>
            <p className="text-muted-foreground">Collect and organize content from all your favorite websites in one place.</p>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow p-6">
            <h3 className="text-xl font-semibold mb-2">Analyze</h3>
            <p className="text-muted-foreground">AI-powered analysis to extract key insights and summaries from articles.</p>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow p-6">
            <h3 className="text-xl font-semibold mb-2">Automate</h3>
            <p className="text-muted-foreground">Set up customized filters and notifications for content that matters to you.</p>
          </div>
        </div>
      </div>
    </main>
  )
} 