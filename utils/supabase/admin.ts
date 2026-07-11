import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseConfigError";
  }
}

export function createAdminClient(): SupabaseClient {
  if (!supabaseUrl) {
    throw new SupabaseConfigError(
      "NEXT_PUBLIC_SUPABASE_URL belum dikonfigurasi.",
    );
  }

  if (!supabaseServiceRoleKey) {
    throw new SupabaseConfigError(
      "SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi. Upload server-side membutuhkan service role key dari Supabase Dashboard → Settings → API.",
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
