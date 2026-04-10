import React, { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import { useApp } from '../context/AppContext';
import { Modal, FormGroup, EmptyState } from '../components/UI';
import Loader from '../components/Loader';

export default function Payments() {
  const { payments, addPayment, deletePayment, ghausiaLots, parties, initialDataLoading } = useApp();
  const [modal, setModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All');
  const [form, setForm] = useState({ type: 'Received', amount: '', party: 'Owner', date: '', note: '', linkedLot: '' });
  const [errors, setErrors] = useState({});
  const [paymentSaving, setPaymentSaving] = useState(false);

  const filtered = useMemo(() =>
    payments.filter(p => typeFilter === 'All' || p.type === typeFilter),
    [payments, typeFilter]
  );

  const ownerIn = payments.filter(p => p.type === 'Received').reduce((s, p) => s + p.amount, 0);
  const partyOut = payments.filter(p => p.type === 'Paid').reduce((s, p) => s + p.amount, 0);
  const balance = ownerIn - partyOut;

  const validateForm = () => {
    const newErrors = {};
    if (!form.amount) newErrors.amount = 'Amount is required';
    if (!form.date) newErrors.date = 'Date is required';
    if (form.type === 'Paid' && !form.party) newErrors.party = 'Please select a party';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setPaymentSaving(true);
    try {
      await addPayment(form);
      setForm({ type: 'Received', amount: '', party: 'Owner', date: '', note: '', linkedLot: '' });
      setErrors({});
      setModal(false);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save payment. Please try again.' });
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Payment?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
    });
    if (result.isConfirmed) {
      await deletePayment(id).catch(console.error);
    }
  };

  const handleClose = () => {
    setModal(false);
    setErrors({});
    setForm({ type: 'Received', amount: '', party: 'Owner', date: '', note: '', linkedLot: '' });
  };

  if (initialDataLoading) {
    return (
      <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Payments</div>
          <div className="page-subtitle">Track all money received from owner and paid to parties</div>
        </div>
        <button className="btn btn-success" onClick={() => setModal(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Record Payment
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Received from Owner', value: ownerIn, color: '#15803d', icon: '↓' },
          { label: 'Paid to Parties', value: partyOut, color: '#dc2626', icon: '↑' },
          { label: 'Net Balance', value: Math.abs(balance), color: balance >= 0 ? '#15803d' : '#dc2626', icon: balance >= 0 ? '+' : '-', note: balance >= 0 ? 'Credit' : 'Debit' },
          { label: 'Total Transactions', value: payments.length, color: '#1e40af', isCount: true },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', boxShadow: 'var(--shadow)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{c.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              {c.icon && !c.isCount && <span style={{ fontSize: 18, fontWeight: 700, color: c.color }}>{c.icon}</span>}
              <span style={{ fontSize: 22, fontWeight: 700, color: c.color }}>
                {c.isCount ? c.value : `₨${c.value.toLocaleString()}`}
              </span>
            </div>
            {c.note && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{c.note}</div>}
          </div>
        ))}
      </div>

      {/* Balance visual */}
      {payments.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 22px', marginBottom: 22, boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Cash Flow Overview</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 120, fontSize: 13, color: 'var(--text-secondary)' }}>Owner In</div>
            <div style={{ flex: 1, background: '#F3F4F6', borderRadius: 6, height: 16, overflow: 'hidden' }}>
              <div style={{ width: `${ownerIn > 0 ? 100 : 0}%`, background: '#15803d', height: '100%', borderRadius: 6 }} />
            </div>
            <div style={{ fontWeight: 700, color: '#15803d', minWidth: 80, textAlign: 'right' }}>₨{ownerIn.toLocaleString()}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 120, fontSize: 13, color: 'var(--text-secondary)' }}>Party Out</div>
            <div style={{ flex: 1, background: '#F3F4F6', borderRadius: 6, height: 16, overflow: 'hidden' }}>
              <div style={{ width: `${ownerIn > 0 ? Math.min((partyOut / ownerIn) * 100, 100) : 0}%`, background: '#dc2626', height: '100%', borderRadius: 6 }} />
            </div>
            <div style={{ fontWeight: 700, color: '#dc2626', minWidth: 80, textAlign: 'right' }}>₨{partyOut.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="toolbar">
        <select className="form-select" style={{ width: 160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="All">All Types</option>
          <option>Received</option>
          <option>Paid</option>
        </select>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{filtered.length} records</span>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Type</th>
                <th>Party / From</th>
                <th>Linked Lot</th>
                <th>Note</th>
                <th style={{ textAlign: 'right' }}>Amount (₨)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}><EmptyState message="No payment records found" /></td></tr>
              ) : [...filtered].reverse().map((p, i) => (
                <tr key={p.id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{filtered.length - i}</td>
                  <td>{p.date}</td>
                  <td>
                    <span style={{
                      background: p.type === 'Received' ? '#F0FDF4' : '#FEF2F2',
                      color: p.type === 'Received' ? '#166534' : '#991B1B',
                      border: `1px solid ${p.type === 'Received' ? '#BBF7D0' : '#FECACA'}`,
                      borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600,
                    }}>{p.type}</span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{p.party}</td>
                  <td>
                    {p.linkedLot
                      ? <span style={{ background: '#EFF6FF', color: '#1e40af', border: '1px solid #BFDBFE', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>{p.linkedLot}</span>
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>
                    }
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{p.note || '—'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 14, color: p.type === 'Received' ? '#15803d' : '#dc2626' }}>
                    {p.type === 'Paid' ? '-' : '+'}₨{p.amount.toLocaleString()}
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => handleDelete(p.id)} title="Delete payment">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14H6L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Modal */}
      {modal && (
        <Modal
          title="Record New Payment"
          onClose={() => { if (!paymentSaving) handleClose(); }}
          footer={
            <>
              <button className="btn btn-ghost" onClick={handleClose} disabled={paymentSaving}>Cancel</button>
              <button className="btn btn-success" onClick={handleSave} disabled={paymentSaving} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {paymentSaving ? <><Loader /> Saving…</> : 'Save Payment'}
              </button>
            </>
          }
        >
          <div className="grid-2">
            <FormGroup label="Type">
              <select className="form-select" value={form.type} onChange={e => {
                const newType = e.target.value;
                setForm(f => ({ ...f, type: newType, party: newType === 'Received' ? 'Owner' : '' }));
                setErrors(prev => ({ ...prev, party: undefined }));
              }}>
                <option>Received</option>
                <option>Paid</option>
              </select>
            </FormGroup>
            <FormGroup label="Amount (₨) *">
              <input
                className={`form-input${errors.amount ? ' input-error' : ''}`}
                type="number"
                value={form.amount}
                onChange={e => { setForm(f => ({ ...f, amount: e.target.value })); setErrors(p => ({ ...p, amount: undefined })); }}
                placeholder="50000"
              />
              {errors.amount && <span style={{ color: '#dc2626', fontSize: 11, marginTop: 3, display: 'block' }}>{errors.amount}</span>}
            </FormGroup>
            <FormGroup label={form.type === 'Received' ? 'Received From' : 'Paid To *'}>
              {form.type === 'Received' ? (
                <input className="form-input" value={form.party} onChange={e => setForm(f => ({ ...f, party: e.target.value }))} placeholder="Owner name" />
              ) : (
                <>
                  <select
                    className={`form-select${errors.party ? ' input-error' : ''}`}
                    value={form.party}
                    onChange={e => { setForm(f => ({ ...f, party: e.target.value })); setErrors(p => ({ ...p, party: undefined })); }}
                  >
                    <option value="">— Select Party —</option>
                    {parties.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    <option value="Other">Other</option>
                  </select>
                  {errors.party && <span style={{ color: '#dc2626', fontSize: 11, marginTop: 3, display: 'block' }}>{errors.party}</span>}
                </>
              )}
            </FormGroup>
            <FormGroup label="Date *">
              <input
                className={`form-input${errors.date ? ' input-error' : ''}`}
                type="date"
                value={form.date}
                onChange={e => { setForm(f => ({ ...f, date: e.target.value })); setErrors(p => ({ ...p, date: undefined })); }}
              />
              {errors.date && <span style={{ color: '#dc2626', fontSize: 11, marginTop: 3, display: 'block' }}>{errors.date}</span>}
            </FormGroup>
            <FormGroup label="Linked Lot (optional)">
              <select className="form-select" value={form.linkedLot} onChange={e => setForm(f => ({ ...f, linkedLot: e.target.value }))}>
                <option value="">None</option>
                {ghausiaLots.map(l => <option key={l.id} value={l.lotNo || l.lotNumber}>{l.lotNo || l.lotNumber} / {l.designNo} — {l.status}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Note">
              <input className="form-input" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional note" />
            </FormGroup>
          </div>
        </Modal>
      )}
    </div>
  );
}
