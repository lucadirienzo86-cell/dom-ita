import { useState, useEffect, useRef } from 'react';
import { AppData } from './types';
import { loadData, saveData, exportDataJSON, importDataJSON, defaultData } from './store';
import Dashboard from './sections/Dashboard';
import NavigationSection from './sections/NavigationSection';
import InsurancesSection from './sections/InsurancesSection';
import FuelSection from './sections/FuelSection';
import ExpensesSection from './sections/ExpensesSection';
import MooringSection from './sections/MooringSection';
import RefitSection from './sections/RefitSection';
import './App.css';

type TabId = 'dashboard' | 'navigation' | 'insurances' | 'fuel' | 'expenses' | 'mooring' | 'refit';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: '⚓ Dashboard' },
  { id: 'navigation', label: '🧭 Navigazione' },
  { id: 'insurances', label: '🛡️ Assicurazioni' },
  { id: 'fuel', label: '⛽ Carburante' },
  { id: 'expenses', label: '💶 Spese' },
  { id: 'mooring', label: '🏗️ Pontile' },
  { id: 'refit', label: '🔧 Refit' },
];

export default function App() {
  const [data, setData] = useState<AppData>(loadData);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  // Save on every change
  useEffect(() => {
    saveData(data);
  }, [data]);

  function handleExport() {
    const json = exportDataJSON(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `domita_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importDataJSON(reader.result as string);
      if (result) {
        if (confirm('Questo sostituirà tutti i dati attuali. Continuare?')) {
          setData(result);
          setShowSettings(false);
        }
      } else {
        alert('File non valido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleReset() {
    if (confirm('Eliminare TUTTI i dati? Questa operazione è irreversibile.')) {
      setData({ ...defaultData });
      setShowSettings(false);
    }
  }

  // Import dati Excel (predefined JSON bundled in public/)
  async function handleImportExcel() {
    try {
      const resp = await fetch('/dati/imported_data.json');
      if (!resp.ok) { alert('File dati/excel non trovato.'); return; }
      const json = await resp.json();
      // This is the raw Excel data — we store it as refit items
      // The imported_data.json has a specific structure from the Excel files
      // We parse it and create refit items
      const items: AppData['refitItems'] = [];
      const categories: AppData['budgetCategories'] = [];
      let budgetTotal = 6000;

      // Parse WBS_Budget_DOMITA_items
      if (json['WBS_Budget_DOMITA_items.xlsx']) {
        const sheets = json['WBS_Budget_DOMITA_items.xlsx'];
        Object.values(sheets).forEach((rows: any) => {
          if (Array.isArray(rows)) {
            rows.forEach((row: any) => {
              const price = parseExcelNumber(row['Prezzo unit. (€)']);
              const total = parseExcelNumber(row['Totale riga (€)']);
              const qty = parseFloat(row['Q.tà']) || 1;
              if (row['Descrizione'] && (price > 0 || total > 0)) {
                items.push({
                  id: Math.random().toString(36).slice(2, 11),
                  wbs: String(row['WBS'] || ''),
                  category: String(row['Categoria'] || 'Altro'),
                  description: String(row['Descrizione'] || ''),
                  quantity: qty,
                  unitPrice: price,
                  totalPrice: total > 0 ? total : price * qty,
                  supplier: '',
                  status: 'ToDo',
                  notes: String(row['Note'] || ''),
                });
              }
            });
          }
        });
      }

      // Parse WBS_Sintesi for budget categories
      if (json['WBS_Sintesi_DOMITA.xlsx']) {
        const sheets = json['WBS_Sintesi_DOMITA.xlsx'];
        Object.values(sheets).forEach((rows: any) => {
          if (Array.isArray(rows)) {
            rows.forEach((row: any) => {
              if (row['Macro-categoria'] || row['Categoria']) {
                const budget = parseExcelNumber(row['Budget suggerito']) || parseExcelNumber(row['Budget']);
                const priority = row['Priorità'] || row['Priorita'];
                const contingency = parseFloat(row['Contingenza']) || 0;
                categories.push({
                  id: Math.random().toString(36).slice(2, 11),
                  name: String(row['Macro-categoria'] || row['Categoria'] || ''),
                  budgetSuggested: budget,
                  contingencyPercent: contingency,
                  priority: priority === 'MUST' ? 'MUST' : priority === 'NICE' ? 'NICE' : 'OPZ',
                  spent: 0,
                });
              }
            });
          }
        });
      }

      if (items.length === 0 && categories.length === 0) {
        alert('Nessun dato utile trovato nel file Excel importato.');
        return;
      }

      if (confirm(`Importare ${items.length} voci refit e ${categories.length} categorie budget? Verranno aggiunte ai dati esistenti.`)) {
        setData(prev => ({
          ...prev,
          refitItems: [...prev.refitItems, ...items],
          budgetCategories: categories.length > 0 ? [...prev.budgetCategories, ...categories] : prev.budgetCategories,
          budgetTotal: budgetTotal,
        }));
        setShowSettings(false);
        setActiveTab('refit');
      }
    } catch (err) {
      alert('Errore importazione: ' + (err as Error).message);
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header className="header">
        <div className="header-title">
          <span className="icon">⚓</span>
          <span>DOM.ITA</span>
        </div>
        <nav className="tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
          <button className="tab" onClick={() => setShowSettings(s => !s)}>⚙️</button>
        </nav>
      </header>

      {/* Settings dropdown */}
      {showSettings && (
        <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '1rem' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>Dati:</span>
            <button className="btn btn-ghost btn-sm" onClick={handleExport}>📤 Export JSON</button>
            <button className="btn btn-ghost btn-sm" onClick={() => importRef.current?.click()}>📥 Import JSON</button>
            <button className="btn btn-ghost btn-sm" onClick={handleImportExcel}>📊 Importa Excel Barca</button>
            <button className="btn btn-danger btn-sm" onClick={handleReset}>🗑️ Reset</button>
            <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
              v3.0 — Solo localStorage — Nessun server
            </span>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="main">
        {activeTab === 'dashboard' && <Dashboard data={data} />}
        {activeTab === 'navigation' && <NavigationSection data={data} onChange={setData} />}
        {activeTab === 'insurances' && <InsurancesSection data={data} onChange={setData} />}
        {activeTab === 'fuel' && <FuelSection data={data} onChange={setData} />}
        {activeTab === 'expenses' && <ExpensesSection data={data} onChange={setData} />}
        {activeTab === 'mooring' && <MooringSection data={data} onChange={setData} />}
        {activeTab === 'refit' && <RefitSection data={data} onChange={setData} />}
      </main>
    </div>
  );
}

// Parse Excel serial numbers or time-strings to actual numbers
function parseExcelNumber(val: any): number {
  if (typeof val === 'number') return isFinite(val) ? val : 0;
  if (!val) return 0;
  const s = String(val);
  // Handle "X days, HH:MM:SS" format (Excel serial dates stored as prices)
  if (s.includes('day') || s.includes('days')) {
    const daysMatch = s.match(/(\d+)\s*days?/);
    const timeMatch = s.match(/(\d{1,2}):(\d{2}):(\d{2})/);
    if (daysMatch && timeMatch) {
      const days = parseInt(daysMatch[1]);
      const h = parseInt(timeMatch[1]);
      const m = parseInt(timeMatch[2]);
      return days * 24 + h + m / 100;
    }
    return 0;
  }
  // Handle plain time "HH:MM:SS" — price encoded as HH.MM
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(s)) {
    const parts = s.split(':').map(Number);
    return parts[0] + parts[1] / 100;
  }
  const n = parseFloat(s.replace(',', '.').replace(/[^0-9.\-]/g, ''));
  return isFinite(n) ? n : 0;
}
