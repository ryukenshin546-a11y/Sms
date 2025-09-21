import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in environment variables.");
}

// Standard client for auth and database operations (SAFE FOR BROWSER)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// ❌ Remove service client from browser - SECURITY RISK!
// const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || 'sb_secret_QZOyKOuNRIndQKMItJVD1Q_OSyctXNf';
// export const supabaseService = createClient<Database>(supabaseUrl, supabaseServiceKey);

export default supabase;
