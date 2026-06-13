import { useState } from 'react';
import { AppData, NavigationEntry, Insurance, FuelEntry, ExpenseEntry, MooringPayment } from './types';
import { initialData } from './data';
import { useLocalStorage } from './useLocalStorage';
import './App.css';

export default function App() {
  const [data, setData] = useLocalStorage<AppData>('dom-ita-data', initialData);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'navigation' | 'insurance' | 'fuel' | 'expenses' | 'mooring' | 'refit'>('dashboard');

  const exportData = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dom-ita-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        setData(json);
        alert('Dati importati con successo');
      } catch (err) {
        alert('Errore nell\'importazione: ' + err);
      }
    };
    reader.readAsText(file);
  };

  // Dashboard stats
  const totalNavHours = data.navigation.reduce((sum, e) => sum + e.hours, 0);
  const totalFuelCost = data.fuel.reduce((sum, e) => sum + e.totalPrice, 0);
  const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRefitSpent = data.budgetCategories.reduce((sum, c) => sum + c.spent, 0);
  const nextInsurances = data.insurances
    .map(ins => ({ ...ins, daysLeft: Math.ceil((new Date(ins.expiryDate).getTime() - Date.now()) / 86400000) }))
    .filter(ins => ins.daysLeft > 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3);

  return (
    <div className="app">
      <header>
        <h1>⛵ DOM.ITA — Gestione Barca</h1>
        <p>Motoscafo | Refit 2026 | Budget €6.000</p>
      </header>

      <nav className="tabs">
        <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        <button className={activeTab === 'navigation' ? 'active' : ''} onClick={() => setActiveTab('navigation')}>Navigazione</button>
        <button className={activeTab === 'insurance' ? 'active' : ''} onClick={() => setActiveTab('insurance')}>Assicurazioni</button>
        <button className={activeTab === 'fuel' ? 'active' : ''} onClick={() => setActiveTab('fuel')}>Carburante</button>
        <button className={activeTab === 'expenses' ? 'active' : ''} onClick={() => setActiveTab('expenses')}>Spese</button>
        <button className={activeTab === 'mooring' ? 'active' : ''} onClick={() => setActiveTab('mooring')}>Ormeggio</button>
        <button className={activeTab === 'refit' ? 'active' : ''} onClick={() => setActiveTab('refit')}>Refit/Budget</button>
      </nav>

      <main>
        {activeTab === 'dashboard' && (
          <section className="dashboard">
            <h2>Riepilogo {new Date().getFullYear()}</h2>
            <div className="stats-grid">
              <div className="stat">
                <label>Ore Navigazione</label>
                <span className="value">{totalNavHours.toFixed(1)}</span>
              </div>
              <div className="stat">
                <label>Spesa Carburante</label>
                <span className="value">€ {totalFuelCost.toFixed(2)}</span>
              </div>
              <div className="stat">
                <label>Spese Extra</label>
                <span className="value">€ {totalExpenses.toFixed(2)}</span>
              </div>
              <div className="stat">
                <label>Refit Speso</label>
                <span className="value">€ {totalRefitSpent.toFixed(2)} / €{data.budgetTotal}</span>
              </div>
            </div>

            {nextInsurances.length > 0 && (
              <div className="upcoming">
                <h3>🚨 Prossime Scadenze Assicurazioni</h3>
                <ul>
                  {nextInsurances.map(ins => (
                    <li key={ins.id}><strong>{ins.name}</strong> scade tra {ins.daysLeft} giorni ({ins.expiryDate})</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="backup">
              <button onClick={exportData}>📥 Esporta Backup (JSON)</button>
              <label>
                📤 Importa Backup
                <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
              </label>
            </div>
          </section>
        )}

        {activeTab === 'navigation' && <NavigationTab data={data} setData={setData} />}
        {activeTab === 'insurance' && <InsuranceTab data={data} setData={setData} />}
        {activeTab === 'fuel' && <FuelTab data={data} setData={setData} />}
        {activeTab === 'expenses' && <ExpensesTab data={data} setData={setData} />}
        {activeTab === 'mooring' && <MooringTab data={data} setData={setData} />}
        {activeTab === 'refit' && <RefitTab data={data} setData={setData} />}
      </main>

      <footer>
        <p>DOM.ITA v1.0 • Dati locali (localStorage) • <code>npm run dev</code></p>
      </footer>
    </div>
  );
}

// Components for each section (simplified)
function NavigationTab({ data, setData }: { data: AppData; setData: (data: AppData) => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState(0);
  const [notes, setNotes] = useState('');

  const add = () => {
    const entry: NavigationEntry = {
      id: Date.now().toString(),
      date,
      hours: parseFloat(hours.toString()),
      notes,
    };
    setData({ ...data, navigation: [...data.navigation, entry] });
    setHours(0);
    setNotes('');
  };

  return (
    <section>
      <h2>Ore di Navigazione</h2>
      <div className="form">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input type="number" placeholder="Ore" value={hours} onChange={e => setHours(parseFloat(e.target.value) || 0)} />
        <input type="text" placeholder="Note" value={notes} onChange={e => setNotes(e.target.value)} />
        <button onClick={add}>Aggiungi</button>
      </div>
      <table>
        <thead><tr><th>Data</th><th>Ore</th><th>Note</th><th>Azioni</th></tr></thead>
        <tbody>
          {data.navigation.map(e => (
            <tr key={e.id}>
              <td>{e.date}</td>
              <td>{e.hours.toFixed(1)}</td>
              <td>{e.notes}</td>
              <td><button onClick={() => setData({ ...data, navigation: data.navigation.filter(x => x.id !== e.id) })}>Cancella</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function InsuranceTab({ data, setData }: { data: AppData; setData: (data: AppData) => void }) {
  const [name, setName] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date().toISOString().slice(0, 10));
  const [company, setCompany] = useState('');
  const [amount, setAmount] = useState(0);

  const add = () => {
    const entry: Insurance = {
      id: Date.now().toString(),
      name,
      expiryDate,
      company,
      amount,
      notes: '',
    };
    setData({ ...data, insurances: [...data.insurances, entry] });
    setName('');
    setCompany('');
  };

  return (
    <section>
      <h2>Assicurazioni</h2>
      <div className="form">
        <input type="text" placeholder="Nome polizza" value={name} onChange={e => setName(e.target.value)} />
        <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
        <input type="text" placeholder="Compagnia" value={company} onChange={e => setCompany(e.target.value)} />
        <input type="number" placeholder="Premio" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} />
        <button onClick={add}>Aggiungi</button>
      </div>
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
                <td><button onClick={() => setData({ ...data, insurances: data.insurances.filter(x => x.id !== ins.id) })}>Cancella</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function FuelTab({ data, setData }: { data: AppData; setData: (data: AppData) => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [liters, setLiters] = useState(0);
  const [pricePerLiter, setPricePerLiter] = useState(0);

  const add = () => {
    const entry: FuelEntry = {
      id: Date.now().toString(),
      date,
      liters: parseFloat(liters.toString()),
      pricePerLiter: parseFloat(pricePerLiter.toString()),
      totalPrice: parseFloat(liters.toString()) * parseFloat(pricePerLiter.toString()),
      motorHours: 0,
      notes: '',
    };
    setData({ ...data, fuel: [...data.fuel, entry] });
    setLiters(0);
    setPricePerLiter(0);
  };

  const avgConsumption = data.fuel.length > 0
    ? data.fuel.reduce((sum, f) => sum + f.liters, 0) / Math.max(1, data.fuel.reduce((sum, f) => sum + f.motorHours, 1))
    : 0;

  return (
    <section>
      <h2>Carburante</h2>
      <p>Consumo medio: {avgConsumption.toFixed(2)} L/h</p>
      <div className="form">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input type="number" placeholder="Litri" value={liters} onChange={e => setLiters(parseFloat(e.target.value) || 0)} />
        <input type="number" placeholder="€/L" value={pricePerLiter} onChange={e => setPricePerLiter(parseFloat(e.target.value) || 0)} />
        <button onClick={add}>Aggiungi</button>
      </div>
      <table>
        <thead><tr><th>Data</th><th>L</th><th>€/L</th><th>Totale</th><th>Azioni</th></tr></thead>
        <tbody>
          {data.fuel.map(f => (
            <tr key={f.id}>
              <td>{f.date}</td>
              <td>{f.liters.toFixed(1)}</td>
              <td>€{f.pricePerLiter.toFixed(2)}</td>
              <td>€{f.totalPrice.toFixed(2)}</td>
              <td><button onClick={() => setData({ ...data, fuel: data.fuel.filter(x => x.id !== f.id) })}>Cancella</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ExpensesTab({ data, setData }: { data: AppData; setData: (data: AppData) => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState('Manutenzione');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);

  const add = () => {
    const entry: ExpenseEntry = {
      id: Date.now().toString(),
      date,
      category,
      description,
      amount: parseFloat(amount.toString()),
      notes: '',
    };
    setData({ ...data, expenses: [...data.expenses, entry] });
    setDescription('');
    setAmount(0);
  };

  return (
    <section>
      <h2>Spese Extra</h2>
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
        <input type="number" placeholder="Importo €" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} />
        <button onClick={add}>Aggiungi</button>
      </div>
      <table>
        <thead><tr><th>Data</th><th>Categoria</th><th>Descrizione</th><th>Importo</th><th>Azioni</th></tr></thead>
        <tbody>
          {data.expenses.map(e => (
            <tr key={e.id}>
              <td>{e.date}</td>
              <td>{e.category}</td>
              <td>{e.description}</td>
              <td>€{e.amount.toFixed(2)}</td>
              <td><button onClick={() => setData({ ...data, expenses: data.expenses.filter(x => x.id !== e.id) })}>Cancella</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function MooringTab({ data, setData }: { data: AppData; setData: (data: AppData) => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [port, setPort] = useState('');
  const [period, setPeriod] = useState('');
  const [amount, setAmount] = useState(0);
  const [expiryDate, setExpiryDate] = useState(new Date().toISOString().slice(0, 10));

  const add = () => {
    const entry: MooringPayment = {
      id: Date.now().toString(),
      date,
      port,
      period,
      amount: parseFloat(amount.toString()),
      expiryDate,
      paid: false,
    };
    setData({ ...data, mooring: [...data.mooring, entry] });
    setPort('');
    setPeriod('');
    setAmount(0);
  };

  return (
    <section>
      <h2>Ormeggio & Pontile</h2>
      <div className="form">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <input type="text" placeholder="Porto" value={port} onChange={e => setPort(e.target.value)} />
        <input type="text" placeholder="Periodo" value={period} onChange={e => setPeriod(e.target.value)} />
        <input type="number" placeholder="Importo €" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} />
        <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
        <button onClick={add}>Aggiungi</button>
      </div>
      <table>
        <thead><tr><th>Data</th><th>Porto</th><th>Periodo</th><th>Importo</th><th>Scadenza</th><th>Pagato</th><th>Azioni</th></tr></thead>
        <tbody>
          {data.mooring.map(m => (
            <tr key={m.id}>
              <td>{m.date}</td>
              <td>{m.port}</td>
              <td>{m.period}</td>
              <td>€{m.amount.toFixed(2)}</td>
              <td>{m.expiryDate}</td>
              <td>
                <input type="checkbox" checked={m.paid} onChange={e => {
                  const updated = [...data.mooring];
                  updated.find(x => x.id === m.id)!.paid = e.target.checked;
                  setData({ ...data, mooring: updated });
                }} />
              </td>
              <td><button onClick={() => setData({ ...data, mooring: data.mooring.filter(x => x.id !== m.id) })}>Cancella</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function RefitTab({ data, setData }: { data: AppData; setData: (data: AppData) => void }) {
  const totalBudget = data.budgetCategories.reduce((sum, c) => sum + c.budgetPlusContingency, 0);
  const totalSpent = data.budgetCategories.reduce((sum, c) => sum + c.spent, 0);
  const remaining = totalBudget - totalSpent;

  return (
    <section>
      <h2>Refit & Budget 2026</h2>
      <div className="budget-summary">
        <div className="summary-item">
          <label>Budget Totale</label>
          <span>€ {totalBudget.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <label>Speso</label>
          <span>€ {totalSpent.toFixed(2)}</span>
        </div>
        <div className="summary-item" style={{ color: remaining < 0 ? 'red' : 'green' }}>
          <label>Rimane</label>
          <span>€ {remaining.toFixed(2)}</span>
        </div>
      </div>

      <h3>Categorie</h3>
      <table>
        <thead><tr><th>Categoria</th><th>Budget+Cont</th><th>Speso</th><th>Rimane</th><th>%</th></tr></thead>
        <tbody>
          {data.budgetCategories.map(cat => {
            const pct = cat.budgetPlusContingency > 0 ? (cat.spent / cat.budgetPlusContingency * 100) : 0;
            return (
              <tr key={cat.id} className={pct > 100 ? 'over-budget' : ''}>
                <td>{cat.name}</td>
                <td>€{cat.budgetPlusContingency.toFixed(0)}</td>
                <td>€{cat.spent.toFixed(0)}</td>
                <td>€{(cat.budgetPlusContingency - cat.spent).toFixed(0)}</td>
                <td>{pct.toFixed(0)}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3>Distinta Ricambi/Lavori</h3>
      <table>
        <thead><tr><th>WBS</th><th>Categoria</th><th>Descrizione</th><th>Qtà</th><th>Prezzo Unit.</th><th>Totale</th><th>Stato</th></tr></thead>
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
    </section>
  );
}
