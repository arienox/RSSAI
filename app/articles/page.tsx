import { Metadata } from "next";
import ArticlesList from "./components/articles-list";
import ArticlesFilters from "./components/articles-filters";

export const metadata: Metadata = {
  title: "Articles | RSSAI",
  description: "Browse and read articles from your RSS feeds",
};

export default function ArticlesPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Articles</h1>
      <div className="grid gap-6">
        <ArticlesFilters />
        <ArticlesList />
      </div>
    </div>
  );
} 