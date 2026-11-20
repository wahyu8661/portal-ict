import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://bbmpmmujnszstjpxvpbp.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_YDmNybep16vqi_vBHDyrAQ_EmDPGedq';

function normalizeBaseUrl(rawUrl: string): string {
  return rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
}

export const SUPABASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
);

export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
