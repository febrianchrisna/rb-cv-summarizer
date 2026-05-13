import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';
import path from 'path';

dotenv.config({ path: path.resolve(import.meta.dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('.env belum diisi/api key salah');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { transport: ws },
});
