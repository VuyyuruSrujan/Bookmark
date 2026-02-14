"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/Auth/AuthProvider";
import { supabase } from "@/lib/supabase";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  tag: string;
  created_at: string;
};

const sampleTags = ["Design", "Product", "Inspiration", "Tools", "Reading"];

export default function Home() {
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heroTag, setHeroTag] = useState("Design");

  // Set random hero tag after hydration
  useEffect(() => {
    setHeroTag(sampleTags[Math.floor(Math.random() * sampleTags.length)]);
  }, []);

  // Load bookmarks when user logs in
  useEffect(() => {
    if (user) {
      loadBookmarks();
    } else {
      setBookmarks([]);
    }
  }, [user]);

  const loadBookmarks = async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setBookmarks(data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!title.trim() || !url.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: insertError } = await supabase
        .from("bookmarks")
        .insert([
          {
            user_id: user?.id,
            title: title.trim(),
            url: url.trim(),
            tag: heroTag,
          },
        ])
        .select();

      if (insertError) throw insertError;

      setTitle("");
      setUrl("");
      await loadBookmarks();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSignOut = async () => {
    try {
      setError(null);
      await signOut();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const truncateUrl = (url: string, maxLength: number = 40) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", bookmarkId)
        .eq("user_id", user?.id);

      if (deleteError) throw deleteError;

      await loadBookmarks();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink text-cream">
      <div className="pointer-events-none absolute inset-0">
        <div className="aurora"></div>
        <div className="grain"></div>
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 pb-6 pt-10 md:px-10">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-neon text-ink">
            <span className="text-lg font-semibold">BM</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-cream/60">
              bookmark studio
            </p>
            <p className="text-lg font-semibold">Atlas Marks</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-cream/70">
                {user.user_metadata?.name || user.email}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={authLoading}
                className="rounded-full border border-cream/30 px-5 py-2 text-sm font-medium transition hover:border-cream/60 disabled:opacity-50"
              >
                Log out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              disabled={authLoading}
              className="flex items-center gap-2 rounded-full bg-cream px-5 py-2 text-sm font-semibold text-ink transition hover:translate-y-[-1px] disabled:opacity-50"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink text-cream">
                G
              </span>
              Sign in with Google
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24 md:px-10">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-cream/20 bg-ink/40 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cream/70">
              Google-only access
              <span className="h-1.5 w-1.5 rounded-full bg-neon"></span>
              {heroTag} flow
            </div>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              A cinematic place to
              <span className="block text-neon">capture the web.</span>
            </h1>
            <p className="max-w-xl text-lg text-cream/70">
              Save inspiration in seconds. Log in with Google, add a title and URL,
              and keep the best pieces of the internet in one glowing library.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleSignIn}
                disabled={authLoading || !!user}
                className="rounded-full bg-neon px-6 py-3 text-sm font-semibold text-ink transition hover:translate-y-[-1px] disabled:opacity-50"
              >
                Start with Google
              </button>
              <button
                type="button"
                className="rounded-full border border-cream/30 px-6 py-3 text-sm font-semibold text-cream transition hover:border-cream/60"
              >
                View showcase
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "One-tap capture",
                  desc: "Add a URL and title, no clutter.",
                },
                {
                  title: "Google only",
                  desc: "No passwords. No email forms.",
                },
                {
                  title: "Curated feel",
                  desc: "Organize a clean, premium stack.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-cream/10 bg-ink/60 p-4"
                >
                  <p className="text-sm font-semibold text-cream">
                    {item.title}
                  </p>
                  <p className="mt-2 text-xs text-cream/60">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-cream/15 bg-glass p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cream/60">
                    add bookmark
                  </p>
                  <p className="text-lg font-semibold">Drop a new link</p>
                </div>
                <span className="rounded-full bg-cream/10 px-3 py-1 text-xs text-cream/70">
                  {user ? "Signed in" : "Guest"}
                </span>
              </div>

              {error && (
                <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.3em] text-cream/50">
                    Title
                  </span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Bookmark title"
                    className="mt-2 w-full rounded-2xl border border-cream/15 bg-ink/40 px-4 py-3 text-sm text-cream placeholder:text-cream/40 focus:border-neon focus:outline-none"
                    disabled={!user || isLoading}
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-[0.3em] text-cream/50">
                    URL
                  </span>
                  <input
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://"
                    className="mt-2 w-full rounded-2xl border border-cream/15 bg-ink/40 px-4 py-3 text-sm text-cream placeholder:text-cream/40 focus:border-neon focus:outline-none"
                    disabled={!user || isLoading}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!user || isLoading}
                  className="w-full rounded-2xl bg-neon px-4 py-3 text-sm font-semibold text-ink transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:bg-cream/20 disabled:text-cream/60"
                >
                  {isLoading ? "Adding..." : "Add bookmark"}
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-cream/15 bg-ink/70 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-cream/60">
                    your library
                  </p>
                  <p className="text-lg font-semibold">Recent captures</p>
                </div>
                <span className="rounded-full border border-cream/20 px-3 py-1 text-xs text-cream/60">
                  {bookmarks.length} items
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {!user ? (
                  <div className="rounded-2xl border border-dashed border-cream/20 p-6 text-center text-sm text-cream/60">
                    Sign in with Google to start saving bookmarks.
                  </div>
                ) : isLoading ? (
                  <div className="rounded-2xl border border-dashed border-cream/20 p-6 text-center text-sm text-cream/60">
                    Loading your bookmarks...
                  </div>
                ) : bookmarks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-cream/20 p-6 text-center text-sm text-cream/60">
                    Add your first bookmark to get started.
                  </div>
                ) : (
                  bookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="rounded-2xl border border-cream/10 bg-ink/50 p-4 transition hover:border-neon/60"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-cream break-words">
                            {bookmark.title}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <p className="text-xs text-cream/50 truncate" title={bookmark.url}>
                              {truncateUrl(bookmark.url, 35)}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleCopyUrl(bookmark.url)}
                              className="flex-shrink-0 rounded-lg bg-cream/10 p-1.5 text-xs text-cream/60 transition hover:bg-neon/20 hover:text-neon"
                              title="Copy URL"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBookmark(bookmark.id)}
                              disabled={isLoading}
                              className="flex-shrink-0 rounded-lg bg-red-500/10 p-1.5 text-xs text-red-400/60 transition hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50"
                              title="Delete bookmark"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <span className="inline-block flex-shrink-0 rounded-full bg-cream/10 px-3 py-1 text-xs text-cream/70">
                          {bookmark.tag}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
