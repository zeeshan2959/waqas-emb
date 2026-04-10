import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, FormGroup, SearchBar, EmptyState, ConfirmDialog } from '../components/UI';

function toPartyFormFields(initial) {
  if (!initial) return { name: '', phone: '', address: '' };
  return {
    name: initial.name ?? '',
    phone: initial.phone ?? '',
    address: initial.address ?? '',
  };
}

function PartyForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(() => toPartyFormFields(initial));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(toPartyFormFields(initial));
  }, [initial]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Party name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  return (
    <>
      <FormGroup label="Party Name *">
        <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Al-Hamra Textiles" />
        {errors.name && <span style={{ color: '#dc2626', fontSize: 11 }}>{errors.name}</span>}
      </FormGroup>
      <FormGroup label="Phone Number">
        <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="e.g. 0300-1234567" />
      </FormGroup>
      <FormGroup label="Address">
        <textarea className="form-textarea" rows={3} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address..." style={{ resize: 'vertical' }} />
      </FormGroup>
      <div className="modal-footer" style={{ padding: '16px 0 0', borderTop: '1px solid var(--border)', marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={() => { if (validate()) onSave(form); }}>Save Party</button>
      </div>
    </>
  );
}

export default function Parties() {
  const { parties, addParty, updateParty, deleteParty, ghausiaLots, getPartyName, partyEdits, payments } = useApp();
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [transactionParty, setTransactionParty] = useState(null);

  const filtered = parties.filter(p => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.phone?.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q);
  });

  const lotStatusKey = (l) => {
    const pe = partyEdits[l.id] || {};
    return String(pe.overrideStatus || l.status || '').toLowerCase();
  };

  const getLotStats = (partyId) => {
    const pid = String(partyId);
    const lots = ghausiaLots.filter(l => String(l.partyId) === pid);
    const partyName = getPartyName(partyId);
    const totalPayable = lots.reduce((s, l) => {
      const pe = partyEdits[l.id] || {};
      return s + Number(pe.partyBillAmount !== undefined ? pe.partyBillAmount : (l.billAmount || 0));
    }, 0);
    const totalPaid = payments.filter(p => {
      if (p.type !== 'Paid') return false;
      const payParty = String(p.party || '').trim();
      return payParty === String(partyName).trim();
    }).reduce((s, p) => s + Number(p.amount || 0), 0);
    const remaining = totalPayable - totalPaid;
    return {
      total: lots.length,
      active: lots.filter(l => lotStatusKey(l) !== 'completed').length,
      completed: lots.filter(l => lotStatusKey(l) === 'completed').length,
      totalValue: totalPayable,
      remaining,
    };
  };

  const handleSave = async (formData) => {
    const payload = {
      name: formData.name.trim(),
      phone: (formData.phone || '').trim(),
      address: (formData.address || '').trim(),
    };
    if (editing) {
      const pid = editing.id || editing._id;
      await updateParty(String(pid), payload);
    } else {
      await addParty(payload);
    }
    setModal(null); setEditing(null);
  };

  const handleDelete = async () => {
    const pid = deleteTarget.id || deleteTarget._id;
    await deleteParty(String(pid));
    setDeleteTarget(null);
  };

  const initials = (name) => name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const avatarColors = [
    ['#EFF6FF', '#1e40af'], ['#F0FDF4', '#15803d'], ['#FFF7ED', '#c2410c'],
    ['#F5F3FF', '#6d28d9'], ['#FEF2F2', '#991B1B'], ['#F0F9FF', '#075985'],
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Parties</div>
          <div className="page-subtitle">Manage all production parties and their contact details</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal('form'); }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Party
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Total Parties', value: parties.length, color: '#1e40af' },
          { label: 'Active Parties', value: parties.filter(p => ghausiaLots.some(l => String(l.partyId) === String(p.id) && String(l.status).toLowerCase() !== 'completed')).length, color: '#d97706' },
          { label: 'Total Lots Assigned', value: ghausiaLots.filter(l => String(l.partyId || '').trim()).length, color: '#7c3aed' },
          // { label: 'Total Bill Value', value: `₨${ghausiaLots.reduce((s, l) => s + Number(l.billAmount || 0), 0).toLocaleString()}`, color: '#0284c7' },
        ].map(c => (
          <div key={c.label} className="stat-card">
            <div className="stat-label">{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search party name, phone, address..." />
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <EmptyState message="No parties found" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map((party, idx) => {
            const stats = getLotStats(party.id);
            const [bg, text] = avatarColors[idx % avatarColors.length];
            return (
              <div key={party.id} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden', transition: 'box-shadow 0.15s' }}>
                {/* Header */}
                <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: '50%', background: bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700, color: text, flexShrink: 0,
                      border: `2px solid ${text}30`,
                    }}>
                      {initials(party.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 2 }}>{party.name}</div>
                      {party.phone && (
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                          {party.phone}
                        </div>
                      )}
                      {party.address && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginTop: 1, flexShrink: 0 }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          {party.address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', padding: '12px 16px', gap: 4 }}>
                  {[
                    { label: 'Lots', value: stats.total, color: '#1e40af' },
                    { label: 'Active', value: stats.active, color: '#d97706' },
                    { label: 'Done', value: stats.completed, color: '#15803d' },
                    { label: 'Total', value: stats.total > 0 ? `₨${(stats.totalValue / 1000).toFixed(0)}K` : '—', color: '#7c3aed' },
                    { label: 'Remaining', value: stats.remaining > 0 ? `₨${(stats.remaining / 1000).toFixed(0)}K` : '—', color: stats.remaining > 0 ? '#dc2626' : '#15803d' },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, padding: '10px 16px 14px' }}>
                  <button
                    onClick={() => setTransactionParty(party)}
                    style={{ flex: 1, padding: '7px', fontSize: 13, fontWeight: 500, borderRadius: 8, cursor: 'pointer', background: '#F0F9FF', color: '#0369a1', border: '1px solid #BAE6FD', fontFamily: 'Inter, sans-serif' }}
                  >
                    Transactions
                  </button>
                  <button
                    onClick={() => { setEditing(party); setModal('form'); }}
                    style={{ flex: 1, padding: '7px', fontSize: 13, fontWeight: 500, borderRadius: 8, cursor: 'pointer', background: '#EFF6FF', color: '#1e40af', border: '1px solid #BFDBFE', fontFamily: 'Inter, sans-serif' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(party)}
                    style={{ flex: 1, padding: '7px', fontSize: 13, fontWeight: 500, borderRadius: 8, cursor: 'pointer', background: '#FEF2F2', color: '#dc2626', border: '1px solid #FECACA', fontFamily: 'Inter, sans-serif' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal === 'form' && (
        <Modal title={editing ? 'Edit Party' : 'Add New Party'} onClose={() => { setModal(null); setEditing(null); }}>
          <PartyForm initial={editing} onSave={handleSave} onClose={() => { setModal(null); setEditing(null); }} />
        </Modal>
      )}

      {transactionParty && (
        <Modal title={`Transaction History — ${transactionParty.name}`} onClose={() => setTransactionParty(null)}>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {(() => {
              const partyPayments = payments.filter(p => String(p.party || '').trim() === String(transactionParty.name || '').trim());
              const partyLots = ghausiaLots.filter(l => String(l.partyId) === String(transactionParty.id));
              const transactions = [
                ...partyPayments.map(p => ({ ...p, rowKind: 'payment' })),
                ...partyLots.map(l => {
                  const pe = partyEdits[l.id] || {};
                  return {
                    id: l.id,
                    date: l.allotDate,
                    rowKind: 'lot',
                    lotNo: l.lotNo,
                    designNo: l.designNo,
                    amount: pe.partyBillAmount !== undefined ? pe.partyBillAmount : l.billAmount,
                    status: pe.overrideStatus || l.status,
                  };
                }),
              ].sort((a, b) => new Date(b.date) - new Date(a.date));

              if (transactions.length === 0) {
                return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No transactions found</div>;
              }

              return (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Date</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Type</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Details</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={`${t.rowKind}-${t.id}`} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '8px 12px', fontSize: 13 }}>{t.date}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{
                            background: t.rowKind === 'payment' ? '#F0FDF4' : '#EFF6FF',
                            color: t.rowKind === 'payment' ? '#166534' : '#1e40af',
                            border: `1px solid ${t.rowKind === 'payment' ? '#BBF7D0' : '#BFDBFE'}`,
                            borderRadius: 12, padding: '2px 8px', fontSize: 11, fontWeight: 600,
                          }}>
                            {t.rowKind === 'payment' ? 'Payment' : 'Lot'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: 13 }}>
                          {t.rowKind === 'payment' ? (
                            <div>
                              <div style={{ fontWeight: 500 }}>{t.note || 'Payment'}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.type || 'Paid'} • {t.linkedLot || 'No lot'}</div>
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontWeight: 500 }}>{t.lotNo} / {t.designNo}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Status: {t.status}</div>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: t.rowKind === 'payment' ? '#dc2626' : '#1e40af' }}>
                          {t.rowKind === 'payment' ? '-' : ''}₨{Number(t.amount || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete party "${deleteTarget.name}"? This will not remove assigned lots.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
