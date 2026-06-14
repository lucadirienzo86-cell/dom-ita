import { useState, useEffect } from 'react';
import * as sb from './supabase';
import './App.css';

interface DashboardData {
  year: number;
  navigation_hours: number;
  fuel_cost: number;
  fuel_liters: number;
  total_expenses: number;
  refit_budget: number;
  refit_spent: number;
  insurance_expiries: any[];
  mooring_due: any[];
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('domita_token') || '');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => { if (token) loadDashboard(); }, [token]);

  async function loadDashboard() {
    try { setLoading(true); const d = await sb.getDashboard(); setDashboard(d); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const u = (form.elements.namedItem('username') as HTMLInputElement).value;
    const p = (form.elements.namedItem('password') as HTMLInputElement).value;
    try { const r = await sb.login(u, p); localStorage.setItem('domita_token', r.token); setToken(r.token); }
    catch (e: any) { setError(e.message); }
  }

  if (!token) {
    return (
      <div className="login-page"><div className="login-box">
        <h1>⚓ DOM.ITA</h1><p>Gestione Barca</p>
        <form onSubmit={handleLogin}>
          <input name="username" placeholder="Username" required />
          <input name="password" type="password" placeholder="Password" required />
          <button type="submit">Accedi</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div></div>
    );
  }
  if (loading) return <div className="loading">Caricamento...</div>;

  return (
    <div className="app">
      <header>
        <h1>⚓ DOM.ITA</h1>
        <nav>
          {['dashboard','navigation','insurances','fuel','expenses','mooring','refit'].map(t => (
            <button key={t} className={activeTab===t?'active':''} onClick={()=>setActiveTab(t)}>{t}</button>
          ))}
          <button onClick={()=>{localStorage.removeItem('domita_token');setToken('');}}>Logout</button>
        </nav>
      </header>
      <main>
        {error && <div className="error-banner">{error}</div>}
        {activeTab==='dashboard' && dashboard && (
          <div className="dashboard">
            <h2>Dashboard {dashboard.year}</h2>
            <div className="stats-grid">
              <div className="stat-card"><h3>Ore Navigazione</h3><p className="big">{dashboard.navigation_hours.toFixed(1)}h</p></div>
              <div className="stat-card"><h3>Spesa Carburante</h3><p className="big">€{dashboard.fuel_cost.toFixed(2)}</p></div>
              <div className="stat-card"><h3>Spese Extra</h3><p className="big">€{dashboard.total_expenses.toFixed(2)}</p></div>
              <div className="stat-card"><h3>Refit Budget</h3><p className="big">€{dashboard.refit_spent.toFixed(0)} / €{dashboard.refit_budget.toFixed(0)}</p>
                <div className="progress-bar"><div className="progress" style={{width:`${dashboard.refit_budget?(dashboard.refit_spent/dashboard.refit_budget*100).toFixed(0):0}%`}}/></div>
              </div>
            </div>
            {dashboard.insurance_expiries.length>0 && (
              <div className="alerts"><h3>⚠️ Scadenze (30gg)</h3>
                {dashboard.insurance_expiries.map((i:any,n:number)=><div key={n} className="alert-item">{i.name} — {i.expiry_date}</div>)}
              </div>
            )}
          </div>
        )}
        {activeTab!=='dashboard' && <div className="section"><h2>{activeTab}</h2><p>Caricamento dati da Supabase...</p></div>}
      </main>
    </div>
  );
}
export default App;
