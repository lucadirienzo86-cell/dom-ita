import { createClient } from './node_modules/@supabase/supabase-js/dist/index.mjs';
import { readFileSync } from 'fs';

const envContent = readFileSync('/home/di-rienzo-srl/zeus-control-tower/.env', 'utf8');
const anonKey = envContent.split('\n').find(l => l.startsWith('VITE_SUPABASE_ANON_KEY=')).split('=', 2)[1].trim();

const supabase = createClient('https://tcfpppuhbbygbvcteftk.supabase.co', anonKey);

// Try to call a raw SQL RPC
const { data, error } = await supabase.rpc('query', { query: 'SELECT 1 as test' });
console.log('RPC result:', data, error);
