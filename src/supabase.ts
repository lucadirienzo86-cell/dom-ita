import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

export async function login(username: string, password: string) {
  const { data, error } = await supabase.from('users').select('*').eq('username', username).single();
  if (error || !data) throw new Error('Invalid credentials');
  if (password !== 'domita2026') throw new Error('Invalid credentials');
  const token = btoa(JSON.stringify({ id: data.id, username: data.username, role: data.role }));
  return { token, user: data };
}

export const getNavigation = () => supabase.from('navigation_log').select('*').order('created_at', { ascending: false });
export const createNavigation = (d: any) => supabase.from('navigation_log').insert(d).select();
export const updateNavigation = (id: string, d: any) => supabase.from('navigation_log').update(d).eq('id', id).select();
export const deleteNavigation = (id: string) => supabase.from('navigation_log').delete().eq('id', id).select();

export const getInsurances = () => supabase.from('insurances').select('*').order('expiry_date');
export const createInsurance = (d: any) => supabase.from('insurances').insert(d).select();
export const updateInsurance = (id: string, d: any) => supabase.from('insurances').update(d).eq('id', id).select();
export const deleteInsurance = (id: string) => supabase.from('insurances').delete().eq('id', id).select();

export const getFuel = () => supabase.from('fuel_logs').select('*').order('created_at', { ascending: false });
export const createFuel = (d: any) => supabase.from('fuel_logs').insert(d).select();
export const updateFuel = (id: string, d: any) => supabase.from('fuel_logs').update(d).eq('id', id).select();
export const deleteFuel = (id: string) => supabase.from('fuel_logs').delete().eq('id', id).select();

export const getExpenses = () => supabase.from('extra_expenses').select('*').order('created_at', { ascending: false });
export const createExpense = (d: any) => supabase.from('extra_expenses').insert(d).select();
export const updateExpense = (id: string, d: any) => supabase.from('extra_expenses').update(d).eq('id', id).select();
export const deleteExpense = (id: string) => supabase.from('extra_expenses').delete().eq('id', id).select();

export const getMooring = () => supabase.from('mooring_payments').select('*').order('due_date');
export const createMooring = (d: any) => supabase.from('mooring_payments').insert(d).select();
export const updateMooring = (id: string, d: any) => supabase.from('mooring_payments').update(d).eq('id', id).select();
export const deleteMooring = (id: string) => supabase.from('mooring_payments').delete().eq('id', id).select();

export const getRefitBudget = () => supabase.from('refit_budget').select('*').order('category');
export const updateRefitBudget = (id: string, d: any) => supabase.from('refit_budget').update(d).eq('id', id).select();

export const getRefitPayments = () => supabase.from('refit_payments').select('*').order('payment_date', { ascending: false });
export const createRefitPayment = (d: any) => supabase.from('refit_payments').insert(d).select();
export const updateRefitPayment = (id: string, d: any) => supabase.from('refit_payments').update(d).eq('id', id).select();
export const deleteRefitPayment = (id: string) => supabase.from('refit_payments').delete().eq('id', id).select();

export const getParts = () => supabase.from('parts_list').select('*').order('category');
export const createPart = (d: any) => supabase.from('parts_list').insert(d).select();
export const updatePart = (id: string, d: any) => supabase.from('parts_list').update(d).eq('id', id).select();
export const deletePart = (id: string) => supabase.from('parts_list').delete().eq('id', id).select();

export async function getDashboard() {
  const now = new Date();
  const yearStart = `${now.getFullYear()}-01-01`;
  const [nav, fuel, expenses, refit, insExp, mooringDue] = await Promise.all([
    supabase.from('navigation_log').select('hours_total').gte('date', yearStart),
    supabase.from('fuel_logs').select('total_cost,liters').gte('date', yearStart),
    supabase.from('extra_expenses').select('amount').gte('date', yearStart),
    supabase.from('refit_budget').select('budget_amount,spent_amount'),
    supabase.from('insurances').select('name,expiry_date').lte('expiry_date', new Date(Date.now()+30*86400000).toISOString()).order('expiry_date'),
    supabase.from('mooring_payments').select('port,amount,due_date').eq('paid', false).lte('due_date', new Date(Date.now()+30*86400000).toISOString()).order('due_date'),
  ]);
  return {
    year: now.getFullYear(),
    navigation_hours: nav.data?.reduce((s: number, r: any) => s + (r.hours_total||0), 0) || 0,
    fuel_cost: fuel.data?.reduce((s: number, r: any) => s + (r.total_cost||0), 0) || 0,
    fuel_liters: fuel.data?.reduce((s: number, r: any) => s + (r.liters||0), 0) || 0,
    total_expenses: expenses.data?.reduce((s: number, r: any) => s + (r.amount||0), 0) || 0,
    refit_budget: refit.data?.reduce((s: number, r: any) => s + (r.budget_amount||0), 0) || 0,
    refit_spent: refit.data?.reduce((s: number, r: any) => s + (r.spent_amount||0), 0) || 0,
    insurance_expiries: insExp.data || [],
    mooring_due: mooringDue.data || [],
  };
}
