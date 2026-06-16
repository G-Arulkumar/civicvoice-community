// Custom Supabase client pointing at the user's own Supabase project.
// (Lovable Cloud is no longer used by this app, but remains attached at the platform level.)
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xzlthlhgapzsnztjonjk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_CDc7Koq32Fj1d4x4jRk1jw_EkOMLkns";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
