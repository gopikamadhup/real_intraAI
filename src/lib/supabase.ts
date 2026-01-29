console.log("SUPABASE URL =", import.meta.env.VITE_SUPABASE_URL);
console.log("SUPABASE KEY =", import.meta.env.VITE_SUPABASE_ANON_KEY);

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
