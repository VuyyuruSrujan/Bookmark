import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const isBrowser = typeof window !== "undefined";

export const supabase = isBrowser
	? createClient(supabaseUrl, supabaseAnonKey, {
			auth: {
				flowType: "pkce",
			},
		})
	: (null as unknown as ReturnType<typeof createClient>);
