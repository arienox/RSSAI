import { Metadata } from "next";
import FeedsList from "./components/feeds-list";
import AddFeedForm from "./components/add-feed-form";

export const metadata: Metadata = {
  title: "Feeds | RSSAI",
  description: "Manage your RSS feeds",
};

export default function FeedsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Feeds</h1>
      <div className="grid gap-6">
        <AddFeedForm />
        <FeedsList />
      </div>
    </div>
  );
} 