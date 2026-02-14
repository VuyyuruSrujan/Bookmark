# Atlas Marks - Bookmark Studio

A cinematic bookmark manager with Google OAuth authentication and Supabase database integration.

## Features

-  **Google OAuth Only** - Sign in securely with Google, no passwords
-  **Save Bookmarks** - Add URL and title to your personal collection
-  **Auto-Organized** - Bookmarks tagged and sorted by date
-  **Private** - Only you can see your bookmarks (RLS enabled)
-  **Copy URLs** - Quick copy button for saved links
-  **Delete** - Remove bookmarks anytime
-  **Responsive UI** - Works flawlessly on mobile and desktop

## Setup Instructions

### 1. Create .env file

Create a .env file in the root directory with these environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Get these from your Supabase project dashboard (Settings  API).

### 2. Setup Supabase Database

Run this SQL in Supabase SQL Editor to create the bookmarks table:

```sql
CREATE TABLE public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  tag TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX bookmarks_user_id_idx ON public.bookmarks(user_id);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bookmarks" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 Web Client credentials
3. Add authorized redirect URI: https://your-supabase-url/auth/v1/callback
4. In Supabase Auth  Providers  Google, add your Client ID and Client Secret
5. Save

### 4. Install Dependencies & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Problems Encountered During Development

**Hydration Mismatch Error** - Using Math.random() in useMemo caused the server and client to render different content. Fixed by initializing the state with a default value and using useEffect to set the random value only on the client side.

## Tech Stack

- **Next.js** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Authentication & Database
- **Google OAuth** - Secure login
