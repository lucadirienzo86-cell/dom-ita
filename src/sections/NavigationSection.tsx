import { useState } from 'react';
import { AppData, NavigationEntry } from '../types';
import { generateId } from '../store';

interface Props {
  data: AppData;
  onChange: (data: AppData) => void;
}

const emptyForm = (): Omit<NavigationEntry, 'id'> => ({
  date: new Date().toISOString().slice(0, 10),
  hoursMotor: 0,
  hoursSail: 0,
  route: '',
  notes: '',
});

export default function NavigationSection({ data, onChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<NavigationEntry, 'id'>>(emptyForm());

  function openNew() { setForm(emptyForm()); setEditId(null); setShowForm(true); }
  function openEdit(entry: NavigationEntry) {
    setForm({ date: entry.date, hoursMotor: entry.hoursMotor, hoursSail: entry.hoursSail, route: entry.route, notes: entry.notes });
    setEditId(entry.id);
    setShowForm(true);
  }
  function handleSave() {
    if (!form.date) return;
    if (editId) {
      onChange({ ...data, navigation: data.navigation.map(n => n.id === editId ? { ...form, id: editId } : n) });
    } else {
      onChange({ ...data, navigation: [...data.navigation, { ...form, id: generateId() }] });
    }
    setShowForm(false);
  }
  function handleDelete(id: string) {
    if (confirm('Eliminare questa uscita?')) {
      onChange({ ...data, navigation: data.navigation.filter(n => n.id !== id) });
    }
  }

  const sorted = [...data.navigation].sort((a, b) => b.date.localeCompare(a.date));
  const totalMotor = data.navigation.reduce((s, n) => s + n.hoursMotor, 0);
  const totalSail = data.navigation.reduce((s, n) => s + n.hoursSail, 0);

  return (
    <div>
      <div className="section-header">
        <h2>🧭 Ore di Navigazione</h2>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Nuova Uscita</button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1rem' }}>
        <div className="stat-card">
          <div className="stat-label">Totale Ore Motore</div>
          <div className="stat-value accent">{totalMotor.toFixed(1)}h</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Totale Ore Vela</div>
          <div className="stat-value">{totalSail.toFixed(1)}h</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Uscite Totali</div>
          <div className="stat-value">{data.navigation.length}</div>
        </div>
      </div>

      {sorted.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">⚓</div>
          <p>Nessuna uscita registrata.<br />Clicca "Nuova Uscita" per iniziare.</p>
        </div>
      )}

      <div className="item-list">
        {sorted.map(n => (
          <div key={n.id} className="item-row">
            <div className="item-info">
              <div className="item-title">{n.date} — {n.route || 'Senza rotta'}</div>
              <div className="item-meta">
                <span>🔧 Motore: {n.hoursMotor}h</span>
                <span>⛵ Vela: {n.hoursSail}h</span>
                <span>📊 Totale: {(n.hoursMotor + n.hoursSail).toFixed(1)}h</span>
              </div>
              {n.notes && <div className="item-sub">{n.notes}</div>}
            </div>
            <div className="item-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(n)}>✏️</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(n.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editId ? 'Modifica Uscita' : 'Nuova Uscita'}</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Data</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Ore Motore</label>
                <input type="number" min="0" step="0.1" value={form.hoursMotor} onChange={e => setForm({ ...form, hoursMotor: +e.target.value })} />
              </div>
              <div className="form-group">
                <label>Ore Vela</label>
                <input type="number" min="0" step="0.1" value={form.hoursSail} onChange={e => setForm({ ...form, hoursSail: +e.target.value })} />
              </div>
              <div className="form-group">
                <label>Rotta / Destinazione</label>
                <input type="text" placeholder="es. Ponza - Gaeta" value={form.route} onChange={e => setForm({ ...form, route: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Note</label>
                <textarea placeholder="Condizioni meteo, avarie, osservazioni..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={handleSave}>{editId ? 'Salva Modifiche' : 'Aggiungi Uscita'}</button>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Annulla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
