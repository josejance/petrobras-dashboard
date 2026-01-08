import { createClient } from '@supabase/supabase-js';

const EXTERNAL_SUPABASE_URL = 'https://qmjyohvvpiqnxgtlbsfh.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = import.meta.env.VITE_EXTERNAL_SUPABASE_ANON_KEY || '';

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY);
