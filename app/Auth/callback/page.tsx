"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finalizeSignIn = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        setError("Missing auth code. Please try signing in again.");
        return;
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        setError(exchangeError.message);
        return;
      }

      router.replace("/");
    };

    finalizeSignIn();
  }, [router]);

  return (
    <div className="min-h-screen bg-ink text-cream flex items-center justify-center p-6">
      {error ? (
        <p className="text-sm text-rose-300">{error}</p>
      ) : (
        <p className="text-sm text-cream/80">Signing you in...</p>
      )}
    </div>
  );
}
