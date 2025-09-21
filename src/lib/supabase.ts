import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Supabase project configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mnhdueclyzwtfkmwttkc.supabase.co';
const supabaseAnonKey = import.meta.env.SUPABASE_CLIENT_API_KEY || 'sb_publishable_yu9gJ7X8C7CjbpqVsvNgGg_LOLkI7mH';

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
