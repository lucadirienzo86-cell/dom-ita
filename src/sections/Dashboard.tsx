import { AppData } from '../types';

interface Props {
  data: AppData;
}

export default function Dashboard({ data }: Props) {
  const now = new Date();
  const year = now.getFullYear();
  const yearStart = `${year}-01-01`;

  // Navigation
  const navThisYear = data.navigation.filter(n => n.date >= yearStart);
  const totalMotorHours = navThisYear.reduce((s, n) => s + n.hoursMotor, 0);
  const totalSailHours = navThisYear.reduce((s, n) => s + n.hoursSail, 0);

  // Fuel
  const fuelThisYear = data.fuel.filter(f => f.date >= yearStart);
  const totalFuelCost = fuelThisYear.reduce((s, f) => s + f.totalCost, 0);
  const totalLiters = fuelThisYear.reduce((s, f) => s + f.liters, 0);

  // Expenses
  const expensesThisYear = data.expenses.filter(e => e.date >= yearStart);
  const totalExpenses = expensesThisYear.reduce((s, e) => s + e.amount, 0);

  // Refit
  const refitBudget = data.budgetTotal;
  const refitSpent = data.refitPayments.reduce((s, p) => s + p.amount, 0);
  const refitPct = refitBudget > 0 ? (refitSpent / refitBudget) * 100 : 0;

  // Insurances expiring within 30 days
  const soon = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const expiringInsurances = data.insurances.filter(i => i.expiryDate <= soon && i.expiryDate >= now.toISOString().slice(0, 10));
  const expiredInsurances = data.insurances.filter(i => i.expiryDate < now.toISOString().slice(0, 10));

  // Mooring due within 30 days
  const dueMooring = data.mooring.filter(m => !m.paid && m.dueDate <= soon);
  const overdueMooring = data.mooring.filter(m => !m.paid && m.dueDate < now.toISOString().slice(0, 10));

  // Refit status counts
  const refitTodo = data.refitItems.filter(i => i.status === 'ToDo').length;
  const refitInProgress = data.refitItems.filter(i => i.status === 'InCorso').length;
  const refitDone = data.refitItems.filter(i => i.status === 'Fatto').length;

  return (
    <div>
      <div className="section-header">
        <h2>⚓ Dashboard — {year}</h2>
      </div>

      {/* Alerts */}
      {expiredInsurances.length > 0 && (
        <div className="alert-box alert-danger">
          ❌ <strong>{expiredInsurances.length} assicurazione/i scaduta/e:</strong> {expiredInsurances.map(i => i.name).join(', ')}
        </div>
      )}
      {expiringInsurances.length > 0 && (
        <div className="alert-box alert-warn">
          🔔 <strong>{expiringInsurances.length} scadenza/e assicurazione entro 30gg:</strong> {expiringInsurances.map(i => `${i.name} (${i.expiryDate})`).join(', ')}
        </div>
      )}
      {overdueMooring.length > 0 && (
        <div className="alert-box alert-danger">
          ⚠️ <strong>{overdueMooring.length} pagamento/i pontile scaduto/i!</strong> {overdueMooring.map(m => `${m.port} €${m.amount}`).join(', ')}
        </div>
      )}
      {dueMooring.length > 0 && (
        <div className="alert-box alert-warn">
          📅 <strong>{dueMooring.length} pagamento/i pontile entro 30gg:</strong> {dueMooring.map(m => `${m.port} €${m.amount} (${m.dueDate})`).join(', ')}
        </div>
      )}

      {/* Main stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Ore Motore {year}</div>
          <div className="stat-value accent">{totalMotorHours.toFixed(1)}h</div>
          <div className="stat-sub">{navThisYear.length} uscite</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ore Vela {year}</div>
          <div className="stat-value">{totalSailHours.toFixed(1)}h</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Carburante {year}</div>
          <div className="stat-value">€{totalFuelCost.toFixed(0)}</div>
          <div className="stat-sub">{totalLiters.toFixed(0)} litri</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Spese Extra {year}</div>
          <div className="stat-value">€{totalExpenses.toFixed(0)}</div>
          <div className="stat-sub">{expensesThisYear.length} voci</div>
        </div>
      </div>

      {/* Refit budget card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">🔧 Refit Budget — Obiettivo €{refitBudget.toLocaleString('it')}</div>
          <span className={`badge ${refitPct > 90 ? 'badge-todo' : refitPct > 50 ? 'badge-nice' : 'badge-fatto'}`}>
            {refitPct.toFixed(0)}%
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Speso: <strong style={{ color: 'var(--text-primary)' }}>€{refitSpent.toLocaleString('it', { maximumFractionDigits: 0 })}</strong></span>
          <span style={{ color: 'var(--text-secondary)' }}>Residuo: <strong style={{ color: 'var(--green)' }}>€{(refitBudget - refitSpent).toLocaleString('it', { maximumFractionDigits: 0 })}</strong></span>
        </div>
        <div className="progress-bar-bg">
          <div className={`progress-bar-fill ${refitPct > 90 ? 'danger' : refitPct > 70 ? 'warn' : ''}`} style={{ width: `${Math.min(refitPct, 100)}%` }} />
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>📋 ToDo: {refitTodo}</span>
          <span>🔄 In Corso: {refitInProgress}</span>
          <span>✅ Fatto: {refitDone}</span>
        </div>
      </div>

      {/* Quick summary */}
      <div className="card">
        <div className="card-header"><div className="card-title">📊 Riepilogo Generale</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Polizze attive:</div><div style={{ textAlign: 'right' }}>{data.insurances.length}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Rifornimenti:</div><div style={{ textAlign: 'right' }}>{data.fuel.length}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Spese totali:</div><div style={{ textAlign: 'right' }}>{data.expenses.length}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Canoni pontile:</div><div style={{ textAlign: 'right' }}>{data.mooring.length} ({data.mooring.filter(m => m.paid).length} pagati)</div>
          <div style={{ color: 'var(--text-secondary)' }}>Voci refit:</div><div style={{ textAlign: 'right' }}>{data.refitItems.length}</div>
          <div style={{ color: 'var(--text-secondary)' }}>Pagamenti refit:</div><div style={{ textAlign: 'right' }}>{data.refitPayments.length}</div>
        </div>
      </div>
    </div>
  );
}
