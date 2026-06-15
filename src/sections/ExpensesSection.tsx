import { useState } from 'react';
import { AppData, ExpenseEntry } from '../types';
import { generateId } from '../store';

interface Props {
  data: AppData;
  onChange: (data: AppData) => void;
}

const CATEGORIES = ['Manutenzione', 'Ricambi', 'Attrezzatura', 'Ormeggio', 'Pulizia', 'Varie'];

const emptyForm = (): Omit<ExpenseEntry, 'id'> => ({
  date: new Date().toISOString().slice(0, 10),
  category: 'Manutenzione',
  description: '',
  amount: 0,
  notes: '',
});

export default function ExpensesSection({ data, onChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ExpenseEntry, 'id'>>(emptyForm());
  const [filterCat, setFilterCat] = useState('');

  function openNew() { setForm(emptyForm()); setEditId(null); setShowForm(true); }
  function openEdit(e: ExpenseEntry) { setForm({ ...e }); setEditId(e.id); setShowForm(true); }

  function handleSave() {
    if (!form.date || !form.description || form.amount <= 0) return;
    if (editId) {
      onChange({ ...data, expenses: data.expenses.map(e => e.id === editId ? { ...form, id: editId } : e) });
    } else {
      onChange({ ...data, expenses: [...data.expenses, { ...form, id: generateId() }] });
    }
    setShowForm(false);
  }

  function handleDelete(id: string) {
    if (confirm('Eliminare questa spesa?')) {
      onChange({ ...data, expenses: data.expenses.filter(e => e.id !== id) });
    }
  }

  const filtered = data.expenses
    .filter(e => !filterCat || e.category === filterCat)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalAll = data.expenses.reduce((s, e) => s + e.amount, 0);
  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

  const byCat: Record<string, number> = {};
  data.expenses.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + e.amount; });

  return (
    <div>
      <div className="section-header">
        <h2>💶 Spese Extra</h2>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Nuova Spesa</button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1rem' }}>
        <div className="stat-card">
          <div className="stat-label">Spesa Totale</div>
          <div className="stat-value accent">€{totalAll.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">N. Voci</div>
          <div className="stat-value">{data.expenses.length}</div>
        </div>
        {Object.entries(byCat).slice(0, 2).map(([cat, amt]) => (
          <div key={cat} className="stat-card">
            <div className="stat-label">{cat}</div>
            <div className="stat-value" style={{ fontSize: '1.2rem' }}>€{amt.toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.6rem', color: 'var(--text-primary)', fontSize: '0.8rem' }}
        >
          <option value="">Tutte le categorie</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {filterCat && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filtro: {filterCat} — €{totalFiltered.toFixed(2)}</span>}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p>Nessuna spesa registrata.</p>
        </div>
      )}

      <div className="item-list">
        {filtered.map(e => (
          <div key={e.id} className="item-row">
            <div className="item-info">
              <div className="item-title">{e.date} — {e.description}</div>
              <div className="item-meta">
                <span className={`badge badge-${e.category === 'Manutenzione' ? 'opz' : e.category === 'Ricambi' ? 'nice' : 'todo'}`}>{e.category}</span>
                <span>💰 €{e.amount.toFixed(2)}</span>
              </div>
              {e.notes && <div className="item-sub">{e.notes}</div>}
            </div>
            <div className="item-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(e)}>✏️</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editId ? 'Modifica Spesa' : 'Nuova Spesa'}</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Data *</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Categoria</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Descrizione *</label>
                <input type="text" placeholder="es. Cambio olio motore" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Importo (€) *</label>
                <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: +e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Note</label>
                <textarea placeholder="Fornitore, dettagli..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={handleSave}>{editId ? 'Salva' : 'Aggiungi'}</button>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
