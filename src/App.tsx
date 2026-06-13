import { useState, useEffect } from 'react';
import { AppData, NavigationEntry, Insurance, FuelEntry, ExpenseEntry, MooringPayment } from './types';
import { initialData } from './data';
import { useLocalStorage } from './useLocalStorage';
import './App.css';

export default function App() {
  const [data, setData] = useLocalStorage<AppData>('dom-ita-data', initialData);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'navigation' | 'insurance' | 'fuel' | 'expenses' | 'mooring' | 'refit'>('dashboard');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'danger' } | null>(null);

  // Toast autoclose after 2s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'warning' | 'danger' = 'success') => {
    setToast({ message, type });
  };

  const exportData = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dom-ita-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('📥 Backup esportato', 'success');
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        setData(json);
        showToast('📤 Backup importato', 'success');
      } catch (err) {
        showToast('Errore nell\'importazione', 'danger');
      }
    };
    reader.readAsText(file);
  };

  // Dashboard stats
  const totalNavHours = data.navigation.reduce((sum, e) => sum + e.hours, 0);
  const totalFuelCost = data.fuel.reduce((sum, e) => sum + e.totalPrice, 0);
  const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRefitSpent = data.budgetCategories.reduce((sum, c) => sum + c.spent, 0);
  const budgetPercent = (totalRefitSpent / data.budgetTotal) * 100;
  const nextInsurances = data.insurances
    .map(ins => ({ ...ins, daysLeft: Math.ceil((new Date(ins.expiryDate).getTime() - Date.now()) / 86400000) }))
    .filter(ins => ins.daysLeft > 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3);

  return (
    <div className="app">
      <header>
        <img src="/logo.jpeg" alt="DOMITA" />
        <div>
          <h1>DOMITA</h1>
          <p>Motoscafo | 2026</p>
        </div>
      </header>

      <nav className="top-tabs">
        <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        <button className={activeTab === 'navigation' ? 'active' : ''} onClick={() => setActiveTab('navigation')}>Navigazione</button>
        <button className={activeTab === 'insurance' ? 'active' : ''} onClick={() => setActiveTab('insurance')}>Assicurazioni</button>
        <button className={activeTab === 'fuel' ? 'active' : ''} onClick={() => setActiveTab('fuel')}>Carburante</button>
        <button className={activeTab === 'expenses' ? 'active' : ''} onClick={() => setActiveTab('expenses')}>Spese</button>
        <button className={activeTab === 'mooring' ? 'active' : ''} onClick={() => setActiveTab('mooring')}>Ormeggio</button>
        <button className={activeTab === 'refit' ? 'active' : ''} onClick={() => setActiveTab('refit')}>Refit</button>
      </nav>

      <main>
        {activeTab === 'dashboard' && (
          <section className="dashboard">
            <h2>Dashboard {new Date().getFullYear()}</h2>
            <div className="stats-grid">
              <div className="stat">
                <label>⚓ Ore Navigazione</label>
                <span className="value">{totalNavHours.toFixed(1)}h</span>
              </div>
              <div className="stat">
                <label>⛽ Carburante</label>
                <span className="value">€{totalFuelCost.toFixed(0)}</span>
              </div>
              <div className="stat">
                <label>💳 Spese Extra</label>
                <span className="value">€{totalExpenses.toFixed(0)}</span>
              </div>
              <div className="stat">
                <label>🔧 Refit Speso</label>
                <span className="value">€{totalRefitSpent.toFixed(0)}</span>
              </div>
            </div>

            <div className="budget-header">
              <div className="progress-section">
                <div className="progress-label">Budget Refit 2026</div>
                <div className="progress-bar">
                  <div className={`progress-fill ${budgetPercent > 100 ? 'danger' : budgetPercent > 80 ? 'warning' : ''}`}
                    style={{ width: `${Math.min(budgetPercent, 100)}%` }}></div>
                </div>
                <div className="progress-value">€{totalRefitSpent.toFixed(0)} / €{data.budgetTotal}</div>
              </div>
              <div className="progress-section">
                <div className="progress-label">Rimanente</div>
                <div className="progress-value" style={{ color: data.budgetTotal - totalRefitSpent < 0 ? 'var(--danger)' : 'var(--success)' }}>
                  €{(data.budgetTotal - totalRefitSpent).toFixed(0)}
                </div>
              </div>
            </div>

            {nextInsurances.length > 0 && (
              <div className="alert danger">
                <strong>🚨 Prossime Scadenze Assicurazioni</strong>
                <ul>
                  {nextInsurances.map(ins => (
                    <li key={ins.id}>{ins.name} scade tra {ins.daysLeft}gg</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="backup">
              <button onClick={exportData}>📥 Esporta</button>
              <label>
                📤 Importa
                <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
              </label>
            </div>
          </section>
        )}

        {activeTab === 'navigation' && <NavigationTab data={data} setData={setData} showToast={showToast} />}
        {activeTab === 'insurance' && <InsuranceTab data={data} setData={setData} showToast={showToast} />}
        {activeTab === 'fuel' && <FuelTab data={data} setData={setData} showToast={showToast} />}
        {activeTab === 'expenses' && <ExpensesTab data={data} setData={setData} showToast={showToast} />}
        {activeTab === 'mooring' && <MooringTab data={data} setData={setData} showToast={showToast} />}
        {activeTab === 'refit' && <RefitTab data={data} setData={setData} showToast={showToast} />}
      </main>

      <nav className="bottom-nav">
        <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
          <span>🏠</span><span>Dashboard</span>
        </button>
        <button className={activeTab === 'navigation' ? 'active' : ''} onClick={() => setActiveTab('navigation')}>
          <span>⚓</span><span>Nav</span>
        </button>
        <button className={activeTab === 'insurance' ? 'active' : ''} onClick={() => setActiveTab('insurance')}>
          <span>🛡️</span><span>Ass</span>
        </button>
        <button className={activeTab === 'fuel' ? 'active' : ''} onClick={() => setActiveTab('fuel')}>
          <span>⛽</span><span>Carb</span>
        </button>
        <button className={activeTab === 'expenses' ? 'active' : ''} onClick={() => setActiveTab('expenses')}>
          <span>💳</span><span>Spese</span>
        </button>
        <button className={activeTab === 'mooring' ? 'active' : ''} onClick={() => setActiveTab('mooring')}>
          <span>⚓</span><span>Orm</span>
        </button>
        <button className={activeTab === 'refit' ? 'active' : ''} onClick={() => setActiveTab('refit')}>
          <span>🔧</span><span>Refit</span>
        </button>
      </nav>

      {toast && (
        <div className={`toast ${toast.type} ${!toast ? 'hidden' : ''}`}>
          {toast.message}
        </div>
      )}

      <footer>DOMITA v2.0 • dati locali • navy + cream</footer>
    </div>
  );
}

// Navigation Tab
function NavigationTab({ data, setData, showToast }: { data: AppData; setData: (data: AppData) => void; showToast: (msg: string, type?: string) => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const add = () => {
    if (!hours || parseFloat(hours) <= 0) {
      setError('Ore richieste');
      return;
    }
    const entry: NavigationEntry = {
      id: Date.now().toString(),
      date,
      hours: parseFloat(hours),
      notes,
    };
    setData({ ...data, navigation: [...data.navigation, entry] });
    setHours('');
    setNotes('');
    setError('');
    showToast('⚓ Uscita aggiunta', 'success');
  };

  return (
    <section>
      <h2>⚓ Ore di Navigazione</h2>
      <div className="form">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input type="number" placeholder="Ore" value={hours} onChange={e => setHours(e.target.value)} />
        <input type="text" placeholder="Note" value={notes} onChange={e => setNotes(e.target.value)} />
        <button onClick={add}>Aggiungi</button>
        {error && <div className="form-error">⚠ {error}</div>}
      </div>

      {data.navigation.map(e => (
        <div key={e.id} className="card-row active">
          <div className="card-row-header">{e.date}<span>{e.hours.toFixed(1)}h</span></div>
          <div className="card-row-content">{e.notes}</div>
          <div className="card-row-actions">
            <button className="btn-delete" onClick={() => {
              if (!window.confirm('Eliminare?')) return;
              setData({ ...data, navigation: data.navigation.filter(x => x.id !== e.id) });
              showToast('Eliminato', 'warning');
            }}>Cancella</button>
          </div>
        </div>
      ))}

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Data</th><th>Ore</th><th>Note</th><th>Azioni</th></tr></thead>
          <tbody>
            {data.navigation.map(e => (
              <tr key={e.id}>
                <td>{e.date}</td>
                <td>{e.hours.toFixed(1)}</td>
                <td>{e.notes}</td>
                <td>
                  <button className="btn-delete" onClick={() => {
                    if (!window.confirm('Eliminare?')) return;
                    setData({ ...data, navigation: data.navigation.filter(x => x.id !== e.id) });
                    showToast('Eliminato', 'warning');
                  }} style={{ padding: '4px 8px', fontSize: '12px' }}>X</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Insurance Tab
function InsuranceTab({ data, setData, showToast }: { data: AppData; setData: (data: AppData) => void; showToast: (msg: string, type?: string) => void }) {
  const [name, setName] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date().toISOString().slice(0, 10));
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');

  const add = () => {
    if (!name || !company) {
      setError('Nome e compagnia richiesti');
      return;
    }
    const entry: Insurance = {
      id: Date.now().toString(),
      name,
      expiryDate,
      company,
      amount: 0,
      notes: '',
    };
    setData({ ...data, insurances: [...data.insurances, entry] });
    setName('');
    setCompany('');
    setError('');
    showToast('🛡️ Assicurazione aggiunta', 'success');
  };

  return (
    <section>
      <h2>🛡️ Assicurazioni</h2>
      <div className="form">
        <input type="text" placeholder="Nome polizza" value={name} onChange={e => setName(e.target.value)} />
        <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
        <input type="text" placeholder="Compagnia" value={company} onChange={e => setCompany(e.target.value)} />
        <button onClick={add}>Aggiungi</button>
        {error && <div className="form-error">⚠ {error}</div>}
      </div>

      {data.insurances.map(ins => {
        const daysLeft = Math.ceil((new Date(ins.expiryDate).getTime() - Date.now()) / 86400000);
        return (
          <div key={ins.id} className={`card-row active ${daysLeft < 30 ? 'warning' : ''}`}>
            <div className="card-row-header">{ins.name}<span className={daysLeft < 30 ? '🔴' : '🟢'}></span></div>
            <div className="card-row-content">
              <div>{ins.company}</div>
              <div>Scade: {ins.expiryDate} ({daysLeft}gg)</div>
            </div>
            <div className="card-row-actions">
              <button className="btn-delete" onClick={() => {
                if (!window.confirm('Eliminare?')) return;
                setData({ ...data, insurances: data.insurances.filter(x => x.id !== ins.id) });
                showToast('Eliminato', 'warning');
              }}>Cancella</button>
            </div>
          </div>
        );
      })}

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Nome</th><th>Scadenza</th><th>Compagnia</th><th>Azioni</th></tr></thead>
          <tbody>
            {data.insurances.map(ins => {
              const daysLeft = Math.ceil((new Date(ins.expiryDate).getTime() - Date.now()) / 86400000);
              return (
                <tr key={ins.id} className={daysLeft < 30 ? 'warning' : ''}>
                  <td>{ins.name}</td>
                  <td>{ins.expiryDate} ({daysLeft}gg)</td>
                  <td>{ins.company}</td>
                  <td><button className="btn-delete" onClick={() => {
                    if (!window.confirm('Eliminare?')) return;
                    setData({ ...data, insurances: data.insurances.filter(x => x.id !== ins.id) });
                    showToast('Eliminato', 'warning');
                  }} style={{ padding: '4px 8px', fontSize: '12px' }}>X</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Fuel Tab (with motorHours fix)
function FuelTab({ data, setData, showToast }: { data: AppData; setData: (data: AppData) => void; showToast: (msg: string, type?: string) => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [liters, setLiters] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [motorHours, setMotorHours] = useState('');
  const [error, setError] = useState('');

  const add = () => {
    if (!liters || !pricePerLiter || !motorHours) {
      setError('Tutti i campi richiesti');
      return;
    }
    const entry: FuelEntry = {
      id: Date.now().toString(),
      date,
      liters: parseFloat(liters),
      pricePerLiter: parseFloat(pricePerLiter),
      totalPrice: parseFloat(liters) * parseFloat(pricePerLiter),
      motorHours: parseFloat(motorHours),
      notes: '',
    };
    setData({ ...data, fuel: [...data.fuel, entry] });
    setLiters('');
    setPricePerLiter('');
    setMotorHours('');
    setError('');
    showToast('⛽ Rifornimento aggiunto', 'success');
  };

  const avgConsumption = data.fuel.length > 0
    ? data.fuel.reduce((sum, f) => sum + f.liters, 0) / Math.max(1, data.fuel.reduce((sum, f) => sum + f.motorHours, 0))
    : 0;

  return (
    <section>
      <h2>⛽ Carburante</h2>
      <div style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '12px' }}>
        Consumo medio: {avgConsumption.toFixed(2)} L/h
      </div>
      <div className="form">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input type="number" placeholder="Litri" value={liters} onChange={e => setLiters(e.target.value)} />
        <input type="number" placeholder="€/L" value={pricePerLiter} onChange={e => setPricePerLiter(e.target.value)} />
        <input type="number" placeholder="Ore motore" value={motorHours} onChange={e => setMotorHours(e.target.value)} />
        <button onClick={add}>Aggiungi</button>
        {error && <div className="form-error">⚠ {error}</div>}
      </div>

      {data.fuel.map(f => (
        <div key={f.id} className="card-row active">
          <div className="card-row-header">{f.date}<span>€{f.totalPrice.toFixed(2)}</span></div>
          <div className="card-row-content">
            <div>{f.liters}L @ €{f.pricePerLiter.toFixed(2)}/L</div>
            <div>Ore motore: {f.motorHours}</div>
          </div>
          <div className="card-row-actions">
            <button className="btn-delete" onClick={() => {
              if (!window.confirm('Eliminare?')) return;
              setData({ ...data, fuel: data.fuel.filter(x => x.id !== f.id) });
              showToast('Eliminato', 'warning');
            }}>Cancella</button>
          </div>
        </div>
      ))}

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Data</th><th>L</th><th>€/L</th><th>Totale</th><th>Ore Mot.</th><th>Azioni</th></tr></thead>
          <tbody>
            {data.fuel.map(f => (
              <tr key={f.id}>
                <td>{f.date}</td>
                <td>{f.liters.toFixed(1)}</td>
                <td>€{f.pricePerLiter.toFixed(2)}</td>
                <td>€{f.totalPrice.toFixed(2)}</td>
                <td>{f.motorHours}</td>
                <td><button className="btn-delete" onClick={() => {
                  if (!window.confirm('Eliminare?')) return;
                  setData({ ...data, fuel: data.fuel.filter(x => x.id !== f.id) });
                  showToast('Eliminato', 'warning');
                }} style={{ padding: '4px 8px', fontSize: '12px' }}>X</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Expenses Tab
function ExpensesTab({ data, setData, showToast }: { data: AppData; setData: (data: AppData) => void; showToast: (msg: string, type?: string) => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState('Manutenzione');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const add = () => {
    if (!description || !amount) {
      setError('Descrizione e importo richiesti');
      return;
    }
    const entry: ExpenseEntry = {
      id: Date.now().toString(),
      date,
      category,
      description,
      amount: parseFloat(amount),
      notes: '',
    };
    setData({ ...data, expenses: [...data.expenses, entry] });
    setDescription('');
    setAmount('');
    setError('');
    showToast('💳 Spesa aggiunta', 'success');
  };

  return (
    <section>
      <h2>💳 Spese Extra</h2>
      <div className="form">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option>Manutenzione</option>
          <option>Ricambi</option>
          <option>Attrezzatura</option>
          <option>Manodopera</option>
          <option>Altro</option>
        </select>
        <input type="text" placeholder="Descrizione" value={description} onChange={e => setDescription(e.target.value)} />
        <input type="number" placeholder="€" value={amount} onChange={e => setAmount(e.target.value)} />
        <button onClick={add}>Aggiungi</button>
        {error && <div className="form-error">⚠ {error}</div>}
      </div>

      {data.expenses.map(e => (
        <div key={e.id} className="card-row active">
          <div className="card-row-header">{e.date}<span>€{e.amount.toFixed(2)}</span></div>
          <div className="card-row-content">
            <div><strong>{e.category}</strong></div>
            <div>{e.description}</div>
          </div>
          <div className="card-row-actions">
            <button className="btn-delete" onClick={() => {
              if (!window.confirm('Eliminare?')) return;
              setData({ ...data, expenses: data.expenses.filter(x => x.id !== e.id) });
              showToast('Eliminato', 'warning');
            }}>Cancella</button>
          </div>
        </div>
      ))}

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Data</th><th>Categoria</th><th>Descrizione</th><th>€</th><th>Azioni</th></tr></thead>
          <tbody>
            {data.expenses.map(e => (
              <tr key={e.id}>
                <td>{e.date}</td>
                <td>{e.category}</td>
                <td>{e.description}</td>
                <td>€{e.amount.toFixed(2)}</td>
                <td><button className="btn-delete" onClick={() => {
                  if (!window.confirm('Eliminare?')) return;
                  setData({ ...data, expenses: data.expenses.filter(x => x.id !== e.id) });
                  showToast('Eliminato', 'warning');
                }} style={{ padding: '4px 8px', fontSize: '12px' }}>X</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Mooring Tab (with immutable array fix)
function MooringTab({ data, setData, showToast }: { data: AppData; setData: (data: AppData) => void; showToast: (msg: string, type?: string) => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [port, setPort] = useState('');
  const [period, setPeriod] = useState('');
  const [amount, setAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');

  const add = () => {
    if (!port || !period || !amount) {
      setError('Porto, periodo e importo richiesti');
      return;
    }
    const entry: MooringPayment = {
      id: Date.now().toString(),
      date,
      port,
      period,
      amount: parseFloat(amount),
      expiryDate,
      paid: false,
    };
    setData({ ...data, mooring: [...data.mooring, entry] });
    setPort('');
    setPeriod('');
    setAmount('');
    setError('');
    showToast('⚓ Ormeggio aggiunto', 'success');
  };

  return (
    <section>
      <h2>⚓ Ormeggio & Pontile</h2>
      <div className="form">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input type="text" placeholder="Porto" value={port} onChange={e => setPort(e.target.value)} />
        <input type="text" placeholder="Periodo" value={period} onChange={e => setPeriod(e.target.value)} />
        <input type="number" placeholder="€" value={amount} onChange={e => setAmount(e.target.value)} />
        <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
        <button onClick={add}>Aggiungi</button>
        {error && <div className="form-error">⚠ {error}</div>}
      </div>

      {data.mooring.map(m => (
        <div key={m.id} className="card-row active">
          <div className="card-row-header">{m.port}<span>€{m.amount.toFixed(2)}</span></div>
          <div className="card-row-content">
            <div>{m.period}</div>
            <div>Scade: {m.expiryDate}</div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                <input type="checkbox" checked={m.paid} onChange={e => {
                  setData({ ...data, mooring: data.mooring.map(x => x.id === m.id ? { ...x, paid: e.target.checked } : x) });
                  showToast(e.target.checked ? '✓ Pagato' : '☐ Non pagato', 'success');
                }} />
                {m.paid ? 'Pagato ✓' : 'Non pagato'}
              </label>
            </div>
          </div>
          <div className="card-row-actions">
            <button className="btn-delete" onClick={() => {
              if (!window.confirm('Eliminare?')) return;
              setData({ ...data, mooring: data.mooring.filter(x => x.id !== m.id) });
              showToast('Eliminato', 'warning');
            }}>Cancella</button>
          </div>
        </div>
      ))}

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Porto</th><th>Periodo</th><th>€</th><th>Scadenza</th><th>Pagato</th><th>Azioni</th></tr></thead>
          <tbody>
            {data.mooring.map(m => (
              <tr key={m.id}>
                <td>{m.port}</td>
                <td>{m.period}</td>
                <td>€{m.amount.toFixed(2)}</td>
                <td>{m.expiryDate}</td>
                <td><input type="checkbox" checked={m.paid} onChange={e => {
                  setData({ ...data, mooring: data.mooring.map(x => x.id === m.id ? { ...x, paid: e.target.checked } : x) });
                }} /></td>
                <td><button className="btn-delete" onClick={() => {
                  if (!window.confirm('Eliminare?')) return;
                  setData({ ...data, mooring: data.mooring.filter(x => x.id !== m.id) });
                  showToast('Eliminato', 'warning');
                }} style={{ padding: '4px 8px', fontSize: '12px' }}>X</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Refit Tab (with spent update form)
function RefitTab({ data, setData, showToast }: { data: AppData; setData: (data: AppData) => void; showToast: (msg: string, type?: string) => void }) {
  const totalBudget = data.budgetCategories.reduce((sum, c) => sum + c.budgetPlusContingency, 0);
  const totalSpent = data.budgetCategories.reduce((sum, c) => sum + c.spent, 0);
  const remaining = totalBudget - totalSpent;

  return (
    <section>
      <h2>🔧 Refit & Budget 2026</h2>

      <div className="budget-header">
        <div className="progress-section">
          <div className="progress-label">Budget Totale</div>
          <div className="progress-value">€{totalBudget.toFixed(0)}</div>
        </div>
        <div className="progress-section">
          <div className="progress-label">Speso</div>
          <div className="progress-value">€{totalSpent.toFixed(0)}</div>
        </div>
        <div className="progress-section">
          <div className="progress-label">Rimanente</div>
          <div className="progress-value" style={{ color: remaining < 0 ? 'var(--danger)' : 'var(--success)' }}>€{remaining.toFixed(0)}</div>
        </div>
      </div>

      <h3>Categorie Budget</h3>
      <div className="table-wrapper">
        <table>
          <thead><tr><th>Categoria</th><th>Budget+Cont</th><th>Speso</th><th>%</th><th>Aggiorna Speso</th></tr></thead>
          <tbody>
            {data.budgetCategories.map(cat => {
              const pct = cat.budgetPlusContingency > 0 ? (cat.spent / cat.budgetPlusContingency * 100) : 0;
              return (
                <tr key={cat.id} className={pct > 100 ? 'danger' : ''}>
                  <td>{cat.name}</td>
                  <td>€{cat.budgetPlusContingency.toFixed(0)}</td>
                  <td>€{cat.spent.toFixed(0)}</td>
                  <td>{pct.toFixed(0)}%</td>
                  <td>
                    <input type="number" defaultValue={cat.spent} style={{ width: '60px', fontSize: '12px', padding: '4px' }}
                      onBlur={e => {
                        const newSpent = parseFloat(e.currentTarget.value) || 0;
                        if (newSpent !== cat.spent) {
                          const updated = data.budgetCategories.map(c => c.id === cat.id ? { ...c, spent: newSpent } : c);
                          setData({ ...data, budgetCategories: updated });
                          showToast(`${cat.name.split(' ')[1]}: €${newSpent.toFixed(0)}`, 'success');
                        }
                      }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h3>Distinta Ricambi/Lavori</h3>
      <div className="table-wrapper">
        <table>
          <thead><tr><th>WBS</th><th>Cat</th><th>Descrizione</th><th>Qtà</th><th>€/u</th><th>Tot</th><th>Stato</th></tr></thead>
          <tbody>
            {data.refitItems.map(item => (
              <tr key={item.id}>
                <td>{item.wbs}</td>
                <td>{item.category}</td>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>€{item.unitPrice.toFixed(2)}</td>
                <td>€{item.totalPrice.toFixed(2)}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
