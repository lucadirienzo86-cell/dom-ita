import { useState } from 'react';
import { AppData, Insurance } from '../types';
import { generateId } from '../store';

interface Props {
  data: AppData;
  onChange: (data: AppData) => void;
}

const emptyForm = (): Omit<Insurance, 'id'> => ({
  name: '',
  company: '',
  policyNumber: '',
  startDate: '',
  expiryDate: '',
  premium: 0,
  notes: '',
});

export default function InsurancesSection({ data, onChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Insurance, 'id'>>(emptyForm());

  function openNew() { setForm(emptyForm()); setEditId(null); setShowForm(true); }
  function openEdit(ins: Insurance) { setForm({ ...ins }); setEditId(ins.id); setShowForm(true); }

  function handleSave() {
    if (!form.name || !form.expiryDate) return;
    if (editId) {
      onChange({ ...data, insurances: data.insurances.map(i => i.id === editId ? { ...form, id: editId } : i) });
    } else {
      onChange({ ...data, insurances: [...data.insurances, { ...form, id: generateId() }] });
    }
    setShowForm(false);
  }

  function handleDelete(id: string) {
    if (confirm('Eliminare questa assicurazione?')) {
      onChange({ ...data, insurances: data.insurances.filter(i => i.id !== id) });
    }
  }

  function daysUntil(dateStr: string): number {
    const d = new Date(dateStr);
    const now = new Date();
    return Math.ceil((d.getTime() - now.getTime()) / 86400000);
  }

  const sorted = [...data.insurances].sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
  const upcoming = sorted.filter(i => daysUntil(i.expiryDate) <= 30 && daysUntil(i.expiryDate) >= 0);
  const expired = sorted.filter(i => daysUntil(i.expiryDate) < 0);

  return (
    <div>
      <div className="section-header">
        <h2>🛡️ Assicurazioni</h2>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Nuova Polizza</button>
      </div>

      {expired.length > 0 && (
        <div className="alert-box alert-danger">
          ⚠️ <strong>{expired.length} polizza/e scaduta/e!</strong> — {expired.map(e => e.name).join(', ')}
        </div>
      )}
      {upcoming.length > 0 && (
        <div className="alert-box alert-warn">
          🔔 <strong>{upcoming.length} scadenza/e entro 30 giorni</strong> — {upcoming.map(u => `${u.name} (${daysUntil(u.expiryDate)}gg)`).join(', ')}
        </div>
      )}

      {sorted.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>Nessuna assicurazione registrata.</p>
        </div>
      )}

      <div className="item-list">
        {sorted.map(ins => {
          const d = daysUntil(ins.expiryDate);
          const isExpired = d < 0;
          const isWarning = d >= 0 && d <= 30;
          return (
            <div key={ins.id} className="item-row" style={{ borderColor: isExpired ? 'var(--red)' : isWarning ? 'var(--amber)' : undefined }}>
              <div className="item-info">
                <div className="item-title">{ins.name} {!isExpired && !isWarning ? '✅' : isWarning ? '🔴' : '❌ SCADUTA'}</div>
                <div className="item-meta">
                  <span>🏢 {ins.company}</span>
                  <span>📄 {ins.policyNumber}</span>
                  <span>💰 €{ins.premium.toFixed(2)}</span>
                  <span>📅 Scade: {ins.expiryDate}</span>
                  {!isExpired && <span style={{ color: isWarning ? 'var(--amber)' : 'var(--text-muted)' }}>{d} giorni</span>}
                </div>
                {ins.notes && <div className="item-sub">{ins.notes}</div>}
              </div>
              <div className="item-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(ins)}>✏️</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ins.id)}>🗑️</button>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editId ? 'Modifica Polizza' : 'Nuova Polizza'}</div>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Nome Polizza *</label>
                <input type="text" placeholder="es. RCA Barca, Polizza Nautica..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Compagnia</label>
                <input type="text" placeholder="es. AXA, Allianz..." value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
              </div>
              <div className="form-group">
                <label>N. Polizza</label>
                <input type="text" value={form.policyNumber} onChange={e => setForm({ ...form, policyNumber: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Data Inizio</label>
                <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Data Scadenza *</label>
                <input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Premio (€)</label>
                <input type="number" min="0" step="0.01" value={form.premium} onChange={e => setForm({ ...form, premium: +e.target.value })} />
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
