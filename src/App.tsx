import { useState, useEffect } from 'react';
import * as api from './api';
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
  expenses_by_category: any[];
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('domita_token') || '');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (token) loadDashboard();
  }, [token]);

  async function loadDashboard() {
    try {
      setLoading(true);
      const data = await api.getDashboard();
      setDashboard(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    try {
      const res = await api.login(username, password);
      localStorage.setItem('domita_token', res.token);
      setToken(res.token);
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-box">
          <h1>⚓ DOM.ITA</h1>
          <p>Gestione Barca</p>
          <form onSubmit={handleLogin}>
            <input name="username" placeholder="Username" required />
            <input name="password" type="password" placeholder="Password" required />
            <button type="submit">Accedi</button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading">Caricamento...</div>;

  return (
    <div className="app">
      <header>
        <h1>⚓ DOM.ITA</h1>
        <nav>
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={activeTab === 'navigation' ? 'active' : ''} onClick={() => setActiveTab('navigation')}>Navigazione</button>
          <button className={activeTab === 'insurances' ? 'active' : ''} onClick={() => setActiveTab('insurances')}>Assicurazioni</button>
          <button className={activeTab === 'fuel' ? 'active' : ''} onClick={() => setActiveTab('fuel')}>Carburante</button>
          <button className={activeTab === 'expenses' ? 'active' : ''} onClick={() => setActiveTab('expenses')}>Spese</button>
          <button className={activeTab === 'mooring' ? 'active' : ''} onClick={() => setActiveTab('mooring')}>Ormeggio</button>
          <button className={activeTab === 'refit' ? 'active' : ''} onClick={() => setActiveTab('refit')}>Refit</button>
          <button onClick={() => { localStorage.removeItem('domita_token'); setToken(''); }}>Logout</button>
        </nav>
      </header>

      <main>
        {error && <div className="error-banner">{error}</div>}

        {activeTab === 'dashboard' && dashboard && (
          <div className="dashboard">
            <h2>Dashboard {dashboard.year}</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Ore Navigazione</h3>
                <p className="big">{dashboard.navigation_hours.toFixed(1)}h</p>
              </div>
              <div className="stat-card">
                <h3>Spesa Carburante</h3>
                <p className="big">€{dashboard.fuel_cost.toFixed(2)}</p>
              </div>
              <div className="stat-card">
                <h3>Spese Extra</h3>
                <p className="big">€{dashboard.total_expenses.toFixed(2)}</p>
              </div>
              <div className="stat-card">
                <h3>Refit Budget</h3>
                <p className="big">€{dashboard.refit_spent.toFixed(0)} / €{dashboard.refit_budget.toFixed(0)}</p>
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${(dashboard.refit_spent / dashboard.refit_budget * 100).toFixed(0)}%` }} />
                </div>
              </div>
            </div>

            {dashboard.insurance_expiries.length > 0 && (
              <div className="alerts">
                <h3>⚠️ Scadenze Assicurazioni (30gg)</h3>
                {dashboard.insurance_expiries.map((ins: any, i: number) => (
                  <div key={i} className="alert-item">{ins.name} — {ins.expiry_date}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'navigation' && <div className="section"><h2>Ore Navigazione</h2><p>Caricamento dati da API...</p></div>}
        {activeTab === 'insurances' && <div className="section"><h2>Assicurazioni</h2><p>Caricamento dati da API...</p></div>}
        {activeTab === 'fuel' && <div className="section"><h2>Carburante</h2><p>Caricamento dati da API...</p></div>}
        {activeTab === 'expenses' && <div className="section"><h2>Spese Extra</h2><p>Caricamento dati da API...</p></div>}
        {activeTab === 'mooring' && <div className="section"><h2>Ormeggio & Pontile</h2><p>Caricamento dati da API...</p></div>}
        {activeTab === 'refit' && <div className="section"><h2>Refit & Budget</h2><p>Caricamento dati da API...</p></div>}
      </main>
    </div>
  );
}

export default App;
