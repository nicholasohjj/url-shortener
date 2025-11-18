"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShortUrl(null);

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          slug: customSlug || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create short URL");
      }

      setShortUrl(data.shortUrl);
      setUrl("");
      setCustomSlug("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-16 px-8">
        <div className="w-full max-w-2xl">
          <h1 className="mb-2 text-4xl font-bold text-black dark:text-zinc-50">
            URL Shortener
          </h1>
          <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
            Create short URLs and track clicks
          </p>

          <form onSubmit={handleSubmit} className="mb-8 space-y-4">
            <div>
              <label
                htmlFor="url"
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Original URL
              </label>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                suppressHydrationWarning
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Custom Slug (optional)
              </label>
              <input
                id="slug"
                type="text"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="my-custom-slug"
                pattern="[a-zA-Z0-9-_]+"
                suppressHydrationWarning
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Only letters, numbers, hyphens, and underscores allowed
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              {loading ? "Creating..." : "Create Short URL"}
            </button>
          </form>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {shortUrl && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
              <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Your short URL:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={shortUrl}
                  readOnly
                  className="flex-1 rounded border border-zinc-300 bg-zinc-50 px-4 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
                />
                <button
                  onClick={copyToClipboard}
                  className="rounded bg-zinc-200 px-4 py-2 font-medium text-zinc-900 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-600"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
