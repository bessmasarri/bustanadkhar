import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fallback client (will error if used without env vars, which is expected/good for now)
// We use a dummy URL if missing to avoid immediate crash on import, but auth/db calls will fail.
export const supabase = createClient(
    supabaseUrl || 'https://xyzcompany.supabase.co',
    supabaseKey || 'public-anon-key'
);
