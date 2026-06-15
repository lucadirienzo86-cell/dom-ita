import { useState } from 'react';
import { AppData, RefitItem, RefitPayment } from '../types';
import { generateId } from '../store';

interface Props {
  data: AppData;
  onChange: (data: AppData) => void;
}

const STATUS_OPTIONS: RefitItem['status'][] = ['ToDo', 'InCorso', 'Sospeso', 'Fatto'];

export default function RefitSection({ data, onChange }: Props) {
  const [tab, setTab] = useState<'items' | 'payments'>('items');
  const [showForm, setShowForm] = useState(false);
  const [showPayForm, setShowPayForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editPayId, setEditPayId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');

  const emptyItem = (): Omit<RefitItem, 'id'> => ({
    wbs: '', category: '', description: '', quantity: 1, unitPrice: 0, totalPrice: 0, supplier: '', status: 'ToDo', notes: '',
  });
  const emptyPayment = (): Omit<RefitPayment, 'id'> => ({
    date: new Date().toISOString().slice(0, 10), recipient: '', description: '', amount: 0, category: '', notes: '',
  });

  const [form, setForm] = useState<Omit<RefitItem, 'id'>>(emptyItem());
  const [payForm, setPayForm] = useState<Omit<RefitPayment, 'id'>>(emptyPayment());

  // Budget calculations
  const totalBudget = data.budgetCategories.reduce((s, c) => s + c.budgetSuggested + c.budgetSuggested * c.contingencyPercent / 100, 0);
  const totalSpent = data.refitPayments.reduce((s, p) => s + p.amount, 0);
  const pct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const categories = [...new Set(data.refitItems.map(i => i.category))];

  const filteredItems = data.refitItems
    .filter(i => !statusFilter || i.status === statusFilter)
    .filter(i => !catFilter || i.category === catFilter)
    .sort((a, b) => a.wbs.localeCompare(b.wbs));

  // Save item
  function handleSaveItem() {
    if (!form.description) return;
    const item = { ...form, totalPrice: form.quantity * form.unitPrice };
    if (editId) {
      onChange({ ...data, refitItems: data.refitItems.map(i => i.id === editId ? { ...item, id: editId } : i) });
    } else {
      onChange({ ...data, refitItems: [...data.refitItems, { ...item, id: generateId() }] });
    }
    setShowForm(false);
  }

  // Save payment
  function handleSavePayment() {
    if (!payForm.recipient || payForm.amount <= 0) return;
    if (editPayId) {
      onChange({ ...data, refitPayments: data.refitPayments.map(p => p.id === editPayId ? { ...payForm, id: editPayId } : p) });
    } else {
      onChange({ ...data, refitPayments: [...data.refitPayments, { ...payForm, id: generateId() }] });
    }
    setShowPayForm(false);
  }

  function deleteItem(id: string) {
    if (confirm('Eliminare questa voce?')) onChange({ ...data, refitItems: data.refitItems.filter(i => i.id !== id) });
  }
  function deletePayment(id: string) {
    if (confirm('Eliminare questo pagamento?')) onChange({ ...data, refitPayments: data.refitPayments.filter(p => p.id !== id) });
  }

  const sortedPayments = [...data.refitPayments].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="section-header">
        <h2>🔧 Refit & Budget</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary btn-sm" onClick={() => { setForm(emptyItem()); setEditId(null); setShowForm(true); }}>+ Voce</button>
          <button className="btn btn-success btn-sm" onClick={() => { setPayForm(emptyPayment()); setEditPayId(null); setShowPayForm(true); }}>+ Pagamento</button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1rem' }}>
        <div className="stat-card">
          <div className="stat-label">Budget Totale</div>
          <div className="stat-value">€{totalBudget.toLocaleString('it', { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Speso</div>
          <div className="stat-value accent">€{totalSpent.toLocaleString('it', { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Residuo</div>
          <div className="stat-value green">€{(totalBudget - totalSpent).toLocaleString('it', { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avanzamento</div>
          <div className="stat-value">{pct.toFixed(0)}%</div>
          <div className="progress-bar-bg"><div className={`progress-bar-fill ${pct > 90 ? 'danger' : pct > 70 ? 'warn' : ''}`} style={{ width: `${Math.min(pct, 100)}%` }} /></div>
        </div>
      </div>

      {/* Tab switch */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
        <button className={`btn btn-sm ${tab === 'items' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('items')}>
          Distinta Ricambi/Spese ({data.refitItems.length})
        </button>
        <button className={`btn btn-sm ${tab === 'payments' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('payments')}>
          Registro Pagamenti ({data.refitPayments.length})
        </button>
      </div>

      {tab === 'items' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.6rem', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
              <option value="">Tutti stati</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.6rem', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
              <option value="">Tutte categorie</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {filteredItems.length === 0 && <div className="empty-state"><p>Nessuna voce.</p></div>}

          <div className="item-list">
            {filteredItems.map(item => (
              <div key={item.id} className="item-row">
                <div className="item-info">
                  <div className="item-title">
                    {item.wbs && <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>{item.wbs}</span>}
                    {item.description}
                    <span className={`badge badge-${item.status === 'Fatto' ? 'fatto' : item.status === 'InCorso' ? 'incorso' : item.status === 'Sospeso' ? 'sospeso' : 'todo'}`} style={{ marginLeft: '0.5rem' }}>
                      {item.status === 'InCorso' ? '🔄' : item.status === 'Fatto' ? '✅' : item.status === 'Sospeso' ? '⏸️' : '📋'} {item.status}
                    </span>
                  </div>
                  <div className="item-meta">
                    <span>{item.category}</span>
                    <span>Q.tà: {item.quantity}</span>
                    <span>€{item.unitPrice.toFixed(2)} / €{item.totalPrice.toFixed(2)}</span>
                    {item.supplier && <span>🏢 {item.supplier}</span>}
                  </div>
                  {item.notes && <div className="item-sub">{item.notes}</div>}
                </div>
                <div className="item-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => { setForm({ ...item }); setEditId(item.id); setShowForm(true); }}>✏️</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteItem(item.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'payments' && (
        <>
          {sortedPayments.length === 0 && <div className="empty-state"><p>Nessun pagamento registrato.</p></div>}
          <div className="item-list">
            {sortedPayments.map(p => (
              <div key={p.id} className="item-row">
                <div className="item-info">
                  <div className="item-title">{p.date} — {p.recipient}: {p.description}</div>
                  <div className="item-meta">
                    <span>💰 €{p.amount.toFixed(2)}</span>
                    {p.category && <span className="badge badge-opz">{p.category}</span>}
                  </div>
                  {p.notes && <div className="item-sub">{p.notes}</div>}
                </div>
                <div className="item-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => { setPayForm({ ...p }); setEditPayId(p.id); setShowPayForm(true); }}>✏️</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deletePayment(p.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editId ? 'Modifica Voce' : 'Nuova Voce Refit'}</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Codice WBS</label>
                <input type="text" placeholder="01:01:01" value={form.wbs} onChange={e => setForm({ ...form, wbs: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Categoria</label>
                <input type="text" placeholder="Motori, Elettrica..." value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Descrizione *</label>
                <input type="text" placeholder="Filtro olio, cinghia..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Quantità</label>
                <input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: +e.target.value })} />
              </div>
              <div className="form-group">
                <label>Prezzo Unit. (€)</label>
                <input type="number" min="0" step="0.01" value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: +e.target.value })} />
              </div>
              <div className="form-group">
                <label>Totale</label>
                <input type="number" value={(form.quantity * form.unitPrice).toFixed(2)} readOnly style={{ opacity: 0.7 }} />
              </div>
              <div className="form-group">
                <label>Fornitore</label>
                <input type="text" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Stato</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as RefitItem['status'] })}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Note</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={handleSaveItem}>{editId ? 'Salva' : 'Aggiungi'}</button>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Annulla</button>
            </div>
          </div>
        </div>
      )}

      {showPayForm && (
        <div className="modal-overlay" onClick={() => setShowPayForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editPayId ? 'Modifica Pagamento' : 'Nuovo Pagamento'}</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Data</label>
                <input type="date" value={payForm.date} onChange={e => setPayForm({ ...payForm, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Beneficiario *</label>
                <input type="text" placeholder="Massimo C., Fornitore..." value={payForm.recipient} onChange={e => setPayForm({ ...payForm, recipient: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Descrizione *</label>
                <input type="text" placeholder="Tagliando motori, acquisto ricambi..." value={payForm.description} onChange={e => setPayForm({ ...payForm, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Importo (€) *</label>
                <input type="number" min="0" step="0.01" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: +e.target.value })} />
              </div>
              <div className="form-group">
                <label>Categoria WBS</label>
                <input type="text" placeholder="Motori, Elettrica..." value={payForm.category} onChange={e => setPayForm({ ...payForm, category: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Note</label>
                <textarea value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} />
              </div>
            </div>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={handleSavePayment}>{editPayId ? 'Salva' : 'Aggiungi Pagamento'}</button>
              <button className="btn btn-ghost" onClick={() => setShowPayForm(false)}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
