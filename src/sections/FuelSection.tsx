import { useState } from 'react';
import { AppData, FuelEntry } from '../types';
import { generateId } from '../store';

interface Props {
  data: AppData;
  onChange: (data: AppData) => void;
}

const emptyForm = (): Omit<FuelEntry, 'id'> => ({
  date: new Date().toISOString().slice(0, 10),
  liters: 0,
  pricePerLiter: 0,
  totalCost: 0,
  motorHours: 0,
  notes: '',
});

export default function FuelSection({ data, onChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<FuelEntry, 'id'>>(emptyForm());

  function openNew() { setForm(emptyForm()); setEditId(null); setShowForm(true); }
  function openEdit(e: FuelEntry) { setForm({ ...e }); setEditId(e.id); setShowForm(true); }

  function updateTotal() {
    setForm(f => ({ ...f, totalCost: +(f.liters * f.pricePerLiter).toFixed(2) }));
  }

  function handleSave() {
    if (!form.date || form.liters <= 0) return;
    const entry = { ...form, totalCost: form.liters * form.pricePerLiter };
    if (editId) {
      onChange({ ...data, fuel: data.fuel.map(f => f.id === editId ? { ...entry, id: editId } : f) });
    } else {
      onChange({ ...data, fuel: [...data.fuel, { ...entry, id: generateId() }] });
    }
    setShowForm(false);
  }

  function handleDelete(id: string) {
    if (confirm('Eliminare questo rifornimento?')) {
      onChange({ ...data, fuel: data.fuel.filter(f => f.id !== id) });
    }
  }

  const sorted = [...data.fuel].sort((a, b) => b.date.localeCompare(a.date));
  const totalLiters = data.fuel.reduce((s, f) => s + f.liters, 0);
  const totalCost = data.fuel.reduce((s, f) => s + f.totalCost, 0);
  const avgPrice = totalLiters > 0 ? totalCost / totalLiters : 0;

  // Consumo medio: differenza ore motore tra rifornimenti consecutivi
  const byHours = [...data.fuel].sort((a, b) => a.motorHours - b.motorHours);
  let avgConsumption = 0;
  if (byHours.length >= 2) {
    let totalCons = 0;
    let count = 0;
    for (let i = 1; i < byHours.length; i++) {
      const dH = byHours[i].motorHours - byHours[i - 1].motorHours;
      if (dH > 0) {
        totalCons += byHours[i].liters / dH;
        count++;
      }
    }
    avgConsumption = count > 0 ? totalCons / count : 0;
  }

  return (
    <div>
      <div className="section-header">
        <h2>⛽ Carburante</h2>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Nuovo Rifornimento</button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1rem' }}>
        <div className="stat-card">
          <div className="stat-label">Totale Litri</div>
          <div className="stat-value">{totalLiters.toFixed(1)} L</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Totale Spesa</div>
          <div className="stat-value accent">€{totalCost.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Prezzo Medio</div>
          <div className="stat-value">€{avgPrice.toFixed(2)}/L</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Consumo Medio</div>
          <div className="stat-value green">{avgConsumption > 0 ? `${avgConsumption.toFixed(1)} L/h` : '—'}</div>
        </div>
      </div>

      {sorted.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">⛽</div>
          <p>Nessun rifornimento registrato.</p>
        </div>
      )}

      <div className="item-list">
        {sorted.map(f => (
          <div key={f.id} className="item-row">
            <div className="item-info">
              <div className="item-title">{f.date} — {f.liters}L × €{f.pricePerLiter.toFixed(2)}/L</div>
              <div className="item-meta">
                <span>💰 Totale: €{f.totalCost.toFixed(2)}</span>
                <span>🔧 Ore motore: {f.motorHours}h</span>
              </div>
              {f.notes && <div className="item-sub">{f.notes}</div>}
            </div>
            <div className="item-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(f)}>✏️</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(f.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editId ? 'Modifica Rifornimento' : 'Nuovo Rifornimento'}</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Data *</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Litri *</label>
                <input type="number" min="0" step="0.1" value={form.liters} onChange={e => { setForm({ ...form, liters: +e.target.value }); setTimeout(updateTotal, 0); }} />
              </div>
              <div className="form-group">
                <label>Prezzo/Litro (€)</label>
                <input type="number" min="0" step="0.01" value={form.pricePerLiter} onChange={e => { setForm({ ...form, pricePerLiter: +e.target.value }); setTimeout(updateTotal, 0); }} />
              </div>
              <div className="form-group">
                <label>Totale (€)</label>
                <input type="number" min="0" step="0.01" value={form.totalCost} onChange={e => setForm({ ...form, totalCost: +e.target.value })} />
              </div>
              <div className="form-group">
                <label>Ore Motore al Rifornimento</label>
                <input type="number" min="0" step="0.1" value={form.motorHours} onChange={e => setForm({ ...form, motorHours: +e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Note</label>
                <textarea placeholder="Stazione, tipo carburante..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
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
