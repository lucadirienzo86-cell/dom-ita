import { createClient } from './node_modules/@supabase/supabase-js/dist/index.mjs';
import { readFileSync } from 'fs';

const envContent = readFileSync('/home/di-rienzo-srl/zeus-control-tower/.env', 'utf8');
const anonKey = envContent.split('\n').find(l => l.startsWith('VITE_SUPABASE_ANON_KEY=')).split('=', 2)[1].trim();

const supabase = createClient('https://tcfpppuhbbygbvcteftk.supabase.co', anonKey);

const tables = ['navigation_log', 'insurances', 'fuel_logs', 'extra_expenses', 'mooring_payments', 'refit_budget', 'refit_payments', 'parts_list', 'users'];

console.log('Checking tables...');
for (const t of tables) {
  const { error } = await supabase.from(t).select('*').limit(1);
  if (error) {
    console.log('MISSING:', t, '-', error.code, error.message.substring(0, 100));
  } else {
    console.log('OK:', t);
  }
}
