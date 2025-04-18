import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | RSSAI",
  description: "Learn about RSSAI and how it can help you stay updated",
};

export default function AboutPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">About RSSAI</h1>
      
      <div className="space-y-6 max-w-3xl">
        <section>
          <h2 className="text-2xl font-semibold mb-3">What is RSSAI?</h2>
          <p className="text-muted-foreground leading-relaxed">
            RSSAI is a modern RSS reader enhanced with AI capabilities. It helps you stay updated 
            with your favorite websites, blogs, and news sources while using artificial intelligence 
            to provide summaries, highlights, and personalized recommendations.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">Features</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Subscribe to unlimited RSS feeds</li>
            <li>AI-powered article summaries</li>
            <li>Content categorization and tagging</li>
            <li>Personalized reading recommendations</li>
            <li>Responsive design for any device</li>
            <li>Dark and light mode support</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">
            RSSAI regularly checks your subscribed feeds for new content. When new articles are found, 
            our AI analyzes the content to extract key information, generate summaries, and categorize 
            the content based on topics. This allows you to quickly scan through new content and focus 
            on what matters most to you.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">Get Started</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Ready to enhance your reading experience? Adding your first feed is simple:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
            <li>Go to the Feeds page</li>
            <li>Enter the URL of an RSS feed</li>
            <li>Click "Add Feed"</li>
            <li>Start enjoying your personalized content!</li>
          </ol>
        </section>
      </div>
    </div>
  );
} 