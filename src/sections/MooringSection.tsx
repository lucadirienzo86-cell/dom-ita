import { useState } from 'react';
import { AppData, MooringPayment } from '../types';
import { generateId } from '../store';

interface Props {
  data: AppData;
  onChange: (data: AppData) => void;
}

const emptyForm = (): Omit<MooringPayment, 'id'> => ({
  port: '',
  period: '',
  amount: 0,
  dueDate: '',
  paid: false,
  notes: '',
});

export default function MooringSection({ data, onChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<MooringPayment, 'id'>>(emptyForm());

  function openNew() { setForm(emptyForm()); setEditId(null); setShowForm(true); }
  function openEdit(m: MooringPayment) { setForm({ ...m }); setEditId(m.id); setShowForm(true); }

  function handleSave() {
    if (!form.port || !form.dueDate) return;
    if (editId) {
      onChange({ ...data, mooring: data.mooring.map(m => m.id === editId ? { ...form, id: editId } : m) });
    } else {
      onChange({ ...data, mooring: [...data.mooring, { ...form, id: generateId() }] });
    }
    setShowForm(false);
  }

  function handleDelete(id: string) {
    if (confirm('Eliminare questo pagamento?')) {
      onChange({ ...data, mooring: data.mooring.filter(m => m.id !== id) });
    }
  }

  function togglePaid(m: MooringPayment) {
    onChange({ ...data, mooring: data.mooring.map(x => x.id === m.id ? { ...x, paid: !x.paid } : x) });
  }

  const sorted = [...data.mooring].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const total = data.mooring.reduce((s, m) => s + m.amount, 0);
  const paid = data.mooring.filter(m => m.paid).reduce((s, m) => s + m.amount, 0);
  const unpaid = data.mooring.filter(m => !m.paid);
  const overdue = unpaid.filter(m => new Date(m.dueDate) < new Date());

  return (
    <div>
      <div className="section-header">
        <h2>🏗️ Pagamenti Pontile / Ormeggio</h2>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Nuovo Pagamento</button>
      </div>

      {overdue.length > 0 && (
        <div className="alert-box alert-danger">
          ⚠️ <strong>{overdue.length} pagamento/i scaduto/i!</strong> — {overdue.map(o => `${o.port} (€${o.amount})`).join(', ')}
        </div>
      )}

      <div className="stats-grid" style={{ marginBottom: '1rem' }}>
        <div className="stat-card">
          <div className="stat-label">Totale Canoni</div>
          <div className="stat-value">€{total.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pagati</div>
          <div className="stat-value green">€{paid.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Da Pagare</div>
          <div className="stat-value red">€{(total - paid).toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Voci</div>
          <div className="stat-value">{data.mooring.length}</div>
        </div>
      </div>

      {sorted.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">⚓</div>
          <p>Nessun pagamento registrato.</p>
        </div>
      )}

      <div className="item-list">
        {sorted.map(m => {
          const isOverdue = !m.paid && new Date(m.dueDate) < new Date();
          return (
            <div key={m.id} className="item-row" style={{ borderColor: isOverdue ? 'var(--red)' : undefined }}>
              <div className="item-info">
                <div className="item-title">
                  {m.port} — {m.period}
                  <span className={`badge ${m.paid ? 'badge-paid' : 'badge-unpaid'}`} style={{ marginLeft: '0.5rem' }}>{m.paid ? 'Pagato' : 'Da pagare'}</span>
                </div>
                <div className="item-meta">
                  <span>💰 €{m.amount.toFixed(2)}</span>
                  <span>📅 Scadenza: {m.dueDate}</span>
                  {isOverdue && <span style={{ color: 'var(--red)' }}>⚠️ SCADUTO</span>}
                </div>
                {m.notes && <div className="item-sub">{m.notes}</div>}
              </div>
              <div className="item-actions">
                <button className={`btn btn-sm ${m.paid ? 'btn-ghost' : 'btn-success'}`} onClick={() => togglePaid(m)}>
                  {m.paid ? '↩️' : '✅'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}>✏️</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>🗑️</button>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editId ? 'Modifica Pagamento' : 'Nuovo Pagamento'}</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Porto / Pontile *</label>
                <input type="text" placeholder="es. Marina di Ponza" value={form.port} onChange={e => setForm({ ...form, port: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Periodo</label>
                <input type="text" placeholder="es. Estate 2026, Annuale..." value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Importo (€)</label>
                <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: +e.target.value })} />
              </div>
              <div className="form-group">
                <label>Scadenza *</label>
                <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>
                  <input type="checkbox" checked={form.paid} onChange={e => setForm({ ...form, paid: e.target.checked })} style={{ marginRight: '0.5rem' }} />
                  Pagato
                </label>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Note</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
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
