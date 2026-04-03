import React from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/UI';

export default function Dashboard() {
  const { ghausiaLots, partyEdits, payments, getPartyName, parties } = useApp();

  const byStatus = (s) => ghausiaLots.filter(l => l.status === s).length;
  const billable = ghausiaLots.filter(l => l.status === 'Received Back');
  const billableTotal = billable.reduce((s, l) => s + Number(l.billAmount || 0), 0);
  const completedTotal = ghausiaLots.filter(l => l.status === 'Completed').reduce((s, l) => s + Number(l.billAmount || 0), 0);
  const totalLotValue = ghausiaLots.reduce((s, l) => s + Number(l.billAmount || 0), 0);

  const ownerIn = payments.filter(p => p.type === 'Received').reduce((s, p) => s + p.amount, 0);
  const partyOut = payments.filter(p => p.type === 'Paid').reduce((s, p) => s + p.amount, 0);
  const balance = ownerIn - partyOut;

  const recentLots = [...ghausiaLots].reverse().slice(0, 6);

  const partyStats = parties.map(p => {
    const lots = ghausiaLots.filter(l => l.partyId === p.id);
    return {
      name: p.name,
      total: lots.length,
      value: lots.reduce((s, l) => s + Number(l.billAmount || 0), 0),
      completed: lots.filter(l => l.status === 'Completed').length,
      pending: lots.filter(l => l.status === 'Pending').length,
    };
  }).filter(p => p.total > 0);

  const maxVal = Math.max(...partyStats.map(p => p.value), 1);

  const statCards = [
    { label: 'Total Lots', value: ghausiaLots.length, color: '#1e40af', sub: 'All assigned lots' },
    { label: 'Pending', value: byStatus('Pending'), color: '#d97706', sub: 'Awaiting dispatch' },
    { label: 'Dispatched', value: byStatus('Dispatched'), color: '#0284c7', sub: 'Currently with party' },
    { label: 'Received Back', value: byStatus('Received Back'), color: '#dc2626', sub: 'Ready to bill owner' },
    { label: 'Completed', value: byStatus('Completed'), color: '#15803d', sub: 'Fully done' },
    { label: 'Active Parties', value: partyStats.length, color: '#7c3aed', sub: 'With assigned lots' },
  ];

  const finCards = [
    { label: 'Total Lot Value', value: totalLotValue, color: '#1e40af' },
    { label: 'Billable to Owner', value: billableTotal, color: '#dc2626', note: `${billable.length} lots` },
    { label: 'Completed Revenue', value: completedTotal, color: '#15803d' },
    { label: 'Received from Owner', value: ownerIn, color: '#0284c7' },
    { label: 'Paid to Parties', value: partyOut, color: '#7c3aed' },
    { label: 'Owner Balance', value: balance, color: balance >= 0 ? '#15803d' : '#dc2626', note: balance >= 0 ? 'Credit' : 'Debit' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Overview of all production and financial activity</div>
        </div>
      </div>

      {/* Lot Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
        {statCards.map(c => (
          <div key={c.label} className="stat-card">
            <div className="stat-label">{c.label}</div>
            <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
            <div className="stat-sub">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Financial Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {finCards.map(c => (
          <div key={c.label} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', boxShadow: 'var(--shadow)' }}>
            <div className="stat-label">{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: c.color, marginBottom: 2 }}>
              ₨{Math.abs(c.value).toLocaleString()}
            </div>
            {c.note && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.note}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>
        {/* Status Breakdown */}
        <div className="card">
          <div className="card-header"><span className="card-title">Lot Status Breakdown</span></div>
          <div className="card-body">
            {[
              { label: 'Pending', count: byStatus('Pending'), color: '#d97706' },
              { label: 'Dispatched', count: byStatus('Dispatched'), color: '#0284c7' },
              { label: 'Received Back', count: byStatus('Received Back'), color: '#dc2626' },
              { label: 'Completed', count: byStatus('Completed'), color: '#15803d' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 100, fontSize: 13, color: 'var(--text-secondary)', flexShrink: 0 }}>{s.label}</div>
                <div style={{ flex: 1, background: '#F3F4F6', borderRadius: 6, height: 14, overflow: 'hidden' }}>
                  <div style={{
                    width: `${ghausiaLots.length ? (s.count / ghausiaLots.length) * 100 : 0}%`,
                    background: s.color, height: '100%', borderRadius: 6,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <div style={{ width: 28, fontSize: 13, fontWeight: 700, color: s.color, textAlign: 'right' }}>{s.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Billable Lots */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Billable to Owner</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>₨{billableTotal.toLocaleString()}</span>
          </div>
          <div className="card-body" style={{ padding: billable.length ? 0 : 22 }}>
            {billable.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                No lots received back yet
              </p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Lot / Design</th>
                    <th>Party</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {billable.map(l => (
                    <tr key={l.id}>
                      <td><span style={{ fontWeight: 600 }}>{l.lotNo}</span> / {l.designNo}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{getPartyName(l.partyId)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>
                        ₨{Number(l.billAmount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>
        {/* Party Performance */}
        <div className="card">
          <div className="card-header"><span className="card-title">Party Performance</span></div>
          <div className="card-body">
            {partyStats.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No data yet</p>
            ) : partyStats.map(p => (
              <div key={p.name} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{p.total} lots · ₨{p.value.toLocaleString()}</span>
                </div>
                <div style={{ background: '#F3F4F6', borderRadius: 5, height: 10, overflow: 'hidden' }}>
                  <div style={{
                    width: `${(p.value / maxVal) * 100}%`,
                    background: 'linear-gradient(90deg, #3b82f6, #1e40af)',
                    height: '100%', borderRadius: 5,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header"><span className="card-title">Recent Lots</span></div>
          <div className="card-body" style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Lot</th>
                  <th>Design</th>
                  <th>Party</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLots.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600 }}>{l.lotNo}</td>
                    <td>{l.designNo}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{getPartyName(l.partyId)}</td>
                    <td><StatusBadge status={l.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="card">
        <div className="card-header"><span className="card-title">Recent Payments</span></div>
        <div className="card-body" style={{ padding: 0 }}>
          {payments.length === 0 ? (
            <p style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No payments recorded</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Party / From</th>
                  <th>Linked Lot</th>
                  <th>Note</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {[...payments].reverse().slice(0, 8).map(p => (
                  <tr key={p.id}>
                    <td>{p.date}</td>
                    <td>
                      <span style={{
                        background: p.type === 'Received' ? '#F0FDF4' : '#FEF2F2',
                        color: p.type === 'Received' ? '#166534' : '#991B1B',
                        border: `1px solid ${p.type === 'Received' ? '#BBF7D0' : '#FECACA'}`,
                        borderRadius: 20, padding: '2px 10px', fontSize: 11.5, fontWeight: 600,
                      }}>{p.type}</span>
                    </td>
                    <td>{p.party}</td>
                    <td>{p.linkedLot || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{p.note}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: p.type === 'Received' ? '#15803d' : '#dc2626' }}>
                      ₨{p.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
