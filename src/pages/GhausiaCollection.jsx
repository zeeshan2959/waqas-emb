import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, FormGroup, StatusBadge, ActionBtn, SearchBar, EmptyState, ConfirmDialog } from '../components/UI';

const FABRICS = ['Lawn', 'Velvet', 'Cambric'];
const COLOR_OPTIONS = Array.from({ length: 13 }, (_, i) => i);
const STATUS_OPTIONS = ['Pending', 'Dispatched', 'Received Back', 'Completed'];

function LotForm({ initial, onSave, onClose, parties }) {
  const blank = {
    lotNo: '', designNo: '', description: '', fabric: 'Lawn', customFabric: '',
    colors: 0, pieces: '', allotDate: new Date().toISOString().slice(0, 10), partyId: parties[0]?.id || '',
    status: 'Pending', billAmount: '', dispatchDate: '', receivedBackDate: '',
  };
  const [form, setForm] = useState(initial ? {
    ...blank, ...initial,
    customFabric: FABRICS.includes(initial.fabric) ? '' : initial.fabric,
    fabric: FABRICS.includes(initial.fabric) ? initial.fabric : '__custom',
  } : blank);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.lotNo.trim()) e.lotNo = 'Required';
    if (!form.designNo.trim()) e.designNo = 'Required';
    // if (!form.partyId) e.partyId = 'Required';
    if (!form.allotDate) e.allotDate = 'Required';
    if (form.status === 'Dispatched' && !form.dispatchDate) e.dispatchDate = 'Required';
    if (form.status === 'Received Back' && !form.receivedBackDate) e.receivedBackDate = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const finalFabric = form.fabric === '__custom' ? form.customFabric : form.fabric;
    onSave({ ...form, fabric: finalFabric });
  };

  return (
    <>
      <div className="grid-2">
        <FormGroup label="Lot Number *">
          <input className="form-input" value={form.lotNo} onChange={e => set('lotNo', e.target.value)} placeholder="e.g. L001" />
          {errors.lotNo && <span style={{ color: '#dc2626', fontSize: 11 }}>{errors.lotNo}</span>}
        </FormGroup>
        <FormGroup label="Design Number *">
          <input className="form-input" value={form.designNo} onChange={e => set('designNo', e.target.value)} placeholder="e.g. D-101" />
          {errors.designNo && <span style={{ color: '#dc2626', fontSize: 11 }}>{errors.designNo}</span>}
        </FormGroup>
        <FormGroup label="Description">
          <input className="form-input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Floral Print" />
        </FormGroup>
        <FormGroup label="Fabric">
          <select className="form-select" value={form.fabric} onChange={e => set('fabric', e.target.value)}>
            {FABRICS.map(f => <option key={f}>{f}</option>)}
            <option value="__custom">+ Custom Fabric</option>
          </select>
          {form.fabric === '__custom' && (
            <input className="form-input" style={{ marginTop: 6 }} value={form.customFabric} onChange={e => set('customFabric', e.target.value)} placeholder="Enter fabric name" />
          )}
        </FormGroup>
        <FormGroup label="Colors (0–12)">
          <select className="form-select" value={form.colors} onChange={e => set('colors', +e.target.value)}>
            {COLOR_OPTIONS.map(n => <option key={n} value={n}>{n} color{n !== 1 ? 's' : ''}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Pieces">
          <input className="form-input" type="number" min="1" value={form.pieces} onChange={e => set('pieces', e.target.value)} placeholder="120" />
        </FormGroup>
        <FormGroup label="Allot Date *">
          <input className="form-input" type="date" value={form.allotDate} onChange={e => set('allotDate', e.target.value)} />
          {errors.allotDate && <span style={{ color: '#dc2626', fontSize: 11 }}>{errors.allotDate}</span>}
        </FormGroup>
        <FormGroup label="Party">
          <select className="form-select" value={form.partyId} onChange={e => set('partyId', Number(e.target.value))}>
            <option value="">— Select Party —</option>
            {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {/* {errors.partyId && <span style={{ color: '#dc2626', fontSize: 11 }}>{errors.partyId}</span>} */}
        </FormGroup>
        <FormGroup label="Status">
          <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Bill Amount (₨)">
          <input className="form-input" type="number" min="0" value={form.billAmount} onChange={e => set('billAmount', e.target.value)} placeholder="45000" />
        </FormGroup>
        {(form.status === 'Dispatched' || form.status === 'Received Back' || form.status === 'Completed') && (
          <FormGroup label="Dispatch Date *">
            <input className="form-input" type="date" value={form.dispatchDate} onChange={e => set('dispatchDate', e.target.value)} />
            {errors.dispatchDate && <span style={{ color: '#dc2626', fontSize: 11 }}>{errors.dispatchDate}</span>}
          </FormGroup>
        )}
        {(form.status === 'Received Back' || form.status === 'Completed') && (
          <FormGroup label="Received Back Date *">
            <input className="form-input" type="date" value={form.receivedBackDate} onChange={e => set('receivedBackDate', e.target.value)} />
            {errors.receivedBackDate && <span style={{ color: '#dc2626', fontSize: 11 }}>{errors.receivedBackDate}</span>}
          </FormGroup>
        )}
      </div>
      <div className="modal-footer" style={{ padding: '16px 0 0', borderTop: '1px solid var(--border)', marginTop: 8 }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Save Lot</button>
      </div>
    </>
  );
}

export default function GhausiaCollection() {
  const { ghausiaLots, addLot, updateLot, deleteLot, parties, getPartyName, payments, addPayment, deletePayment, updatePartyEdit } = useApp();
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [payModal, setPayModal] = useState(false);
  const [payForm, setPayForm] = useState({ type: 'Received', amount: '', party: 'Owner', date: '', note: '', linkedLot: '' });
  const [statusMenuOpen, setStatusMenuOpen] = useState(null);

  const STATUS_OPTIONS = ['Pending', 'Dispatched', 'Received Back', 'Completed'];

  const statusMeta = {
    'Pending': { className: 'badge badge-pending', label: 'Pending' },
    'Dispatched': { className: 'badge badge-dispatched', label: 'Dispatched' },
    'Received Back': { className: 'badge badge-received', label: 'Received Back' },
    'Completed': { className: 'badge badge-completed', label: 'Completed' },
    'In Progress': { className: 'badge badge-inprogress', label: 'In Progress' },
  };

  const setLotStatus = (lot, newStatus) => {
    const today = new Date().toISOString().slice(0, 10);
    const lotUpdate = { status: newStatus };
    if (newStatus === 'Dispatched') {
      lotUpdate.dispatchDate = today;
    }
    if (newStatus === 'Received Back' || newStatus === 'Completed') {
      lotUpdate.receivedBackDate = today;
    }
    updateLot(lot.id, lotUpdate);

    const ledgerStatus = newStatus === 'Dispatched' ? 'In Progress' : (newStatus === 'Completed' ? 'Completed' : newStatus);
    updatePartyEdit(lot.id, {
      overrideStatus: ledgerStatus,
      completeDate: newStatus === 'Completed' ? today : '',
    });

    setStatusMenuOpen(null);
  };


  const filtered = useMemo(() => ghausiaLots.filter(l => {
    const q = search.toLowerCase();
    const matchQ = !q || l.lotNo.toLowerCase().includes(q) || l.designNo.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
    const matchS = statusFilter === 'All' || l.status === statusFilter;
    return matchQ && matchS;
  }), [ghausiaLots, search, statusFilter]);

  const billable = ghausiaLots.filter(l => l.status === 'Received Back');
  const billableTotal = billable.reduce((s, l) => s + Number(l.billAmount || 0), 0);
  const ownerIn = payments.filter(p => p.type === 'Received').reduce((s, p) => s + p.amount, 0);
  const partyOut = payments.filter(p => p.type === 'Paid').reduce((s, p) => s + p.amount, 0);

  const openEdit = (lot) => { setEditing(lot); setModal('form'); };
  const openAdd = () => { setEditing(null); setModal('form'); };

  const handleSave = (form) => {
    if (editing) updateLot(editing.id, form);
    else addLot(form);
    setModal(null); setEditing(null);
  };

  const handleDelete = () => {
    deleteLot(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handlePartyChange = (lotId, partyId) => {
    const currentDate = new Date().toISOString().slice(0, 10);
    updateLot(lotId, {
      partyId: partyId ? Number(partyId) : null,
      status: partyId ? 'Dispatched' : 'Pending',
      dispatchDate: partyId ? currentDate : '',
    });
    // Set party edit to show "In Progress" in Party Ledger
    if (partyId) {
      updatePartyEdit(lotId, {
        overrideStatus: 'In Progress',
        allotDate: currentDate,
      });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Ghausia Collection</div>
          <div className="page-subtitle">Manage all design lots assigned to parties</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Lot
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Total Lots', value: ghausiaLots.length, color: '#1e40af' },
          { label: 'Billable Lots', value: billable.length, color: '#dc2626' },
          { label: 'Billable Amount', value: `₨${billableTotal.toLocaleString()}`, color: '#dc2626' },
          { label: 'Owner Received', value: `₨${ownerIn.toLocaleString()}`, color: '#15803d' },
          { label: 'Party Paid', value: `₨${partyOut.toLocaleString()}`, color: '#7c3aed' },
          { label: 'Net Balance', value: `₨${(ownerIn - partyOut).toLocaleString()}`, color: (ownerIn - partyOut) >= 0 ? '#15803d' : '#dc2626' },
        ].map(c => (
          <div key={c.label} className="stat-card">
            <div className="stat-label">{c.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Payment Panel */}
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="card-header">
          <span className="card-title">Payment Management</span>
          <button className="btn btn-success btn-sm" onClick={() => setPayModal(true)}>+ Record Payment</button>
        </div>
        <div style={{ padding: 0 }}>
          {payments.length === 0 ? (
            <p style={{ padding: 16, color: 'var(--text-muted)', fontSize: 13 }}>No payments yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th><th>Type</th><th>Party / From</th>
                    <th>Linked Lot</th><th>Note</th><th style={{ textAlign: 'right' }}>Amount</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
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
                      <td>
                        <button className="btn-icon" onClick={() => deletePayment(p.id)} title="Delete">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {billable.length > 0 && (
          <div style={{ margin: '0 16px 16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#92600A', marginBottom: 10 }}>
              Billable to Owner — {billable.length} lots · Total: ₨{billableTotal.toLocaleString()}
            </div>
            {billable.map(l => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '1px solid #FDE68A' }}>
                <span>{l.lotNo} / {l.designNo} — <span style={{ color: '#92600A' }}>{getPartyName(l.partyId)}</span></span>
                <strong style={{ color: '#92600A' }}>₨{Number(l.billAmount).toLocaleString()}</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search lot no., design, description..." />
        <select className="form-select" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Lot No</th><th>Design No</th><th>Description</th><th>Fabric</th>
                <th>Colors</th><th>Pieces</th><th>Allot Date</th><th>Party Name</th>
                <th>Status</th><th style={{ textAlign: 'right' }}>Bill Amount</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={11}><EmptyState message="No lots found" /></td></tr>
              ) : filtered.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 700, color: '#1e40af' }}>{l.lotNo}</td>
                  <td style={{ fontWeight: 600 }}>{l.designNo}</td>
                  <td>{l.description}</td>
                  <td><span style={{ background: '#F0F9FF', color: '#0369a1', border: '1px solid #BAE6FD', borderRadius: 6, padding: '2px 8px', fontSize: 12 }}>{l.fabric}</span></td>
                  <td>{l.colors}</td>
                  <td>{l.pieces}</td>
                  <td>{l.allotDate}</td>
                  <td>
                    <select
                      className="form-select"
                      style={{ width: '100%', fontSize: 13, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 4 }}
                      value={l.partyId || ''}
                      onChange={(e) => handlePartyChange(l.id, e.target.value)}
                    >
                      <option value="">— Select Party —</option>
                      {parties.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={statusMeta[l.status]?.className || 'badge'} style={{ padding: '4px 8px' }}>{l.status}</span>
                      <button
                        className="btn btn-ghost"
                        style={{ height: 26, padding: '3px 8px', fontSize: 12 }}
                        onClick={() => setStatusMenuOpen(statusMenuOpen === l.id ? null : l.id)}
                      >
                        Change
                      </button>
                    </div>
                    {statusMenuOpen === l.id && (
                      <div style={{
                        position: 'absolute', top: 'calc(100% + 6px)', left: 0,
                        background: '#fff', border: '1px solid var(--border)', borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)', width: 180, zIndex: 50,
                      }}>
                        {STATUS_OPTIONS.map(status => (
                          <button
                            key={status}
                            onClick={() => setLotStatus(l, status)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              width: '100%', padding: '8px 10px', border: 'none', background: 'transparent',
                              textAlign: 'left', cursor: 'pointer',
                            }}
                          >
                            <span className={statusMeta[status]?.className || 'badge'} style={{ padding: '3px 8px' }}>{status}</span>
                            <span>{status}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {l.dispatchDate && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>Dispatch: {l.dispatchDate}</div>}
                    {l.receivedBackDate && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 1 }}>Received: {l.receivedBackDate}</div>}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#1e40af' }}>
                    ₨{Number(l.billAmount || 0).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <ActionBtn variant="edit" onClick={() => openEdit(l)} />
                      <ActionBtn variant="delete" onClick={() => setDeleteTarget(l)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lot Form Modal */}
      {modal === 'form' && (
        <Modal title={editing ? 'Edit Lot' : 'Add New Lot'} onClose={() => { setModal(null); setEditing(null); }}>
          <LotForm initial={editing} onSave={handleSave} onClose={() => { setModal(null); setEditing(null); }} parties={parties} />
        </Modal>
      )}

      {/* Payment Modal */}
      {payModal && (
        <Modal title="Record Payment" onClose={() => setPayModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setPayModal(false)}>Cancel</button>
              <button className="btn btn-success" onClick={handleAddPayment}>Save Payment</button>
            </>
          }
        >
          <div className="grid-2">
            <FormGroup label="Type">
              <select className="form-select" value={payForm.type} onChange={e => setPayForm(f => ({ ...f, type: e.target.value }))}>
                <option>Received</option>
                <option>Paid</option>
              </select>
            </FormGroup>
            <FormGroup label="Amount (₨)">
              <input className="form-input" type="number" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} placeholder="50000" />
            </FormGroup>
            <FormGroup label="Party / From">
              <input className="form-input" value={payForm.party} onChange={e => setPayForm(f => ({ ...f, party: e.target.value }))} placeholder="Owner or party name" />
            </FormGroup>
            <FormGroup label="Date">
              <input className="form-input" type="date" value={payForm.date} onChange={e => setPayForm(f => ({ ...f, date: e.target.value }))} />
            </FormGroup>
            <FormGroup label="Linked Lot (optional)">
              <select className="form-select" value={payForm.linkedLot} onChange={e => setPayForm(f => ({ ...f, linkedLot: e.target.value }))}>
                <option value="">None</option>
                {ghausiaLots.map(l => <option key={l.id} value={l.lotNo}>{l.lotNo} / {l.designNo}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Note">
              <input className="form-input" value={payForm.note} onChange={e => setPayForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional note" />
            </FormGroup>
          </div>
        </Modal>
      )}

      {/* Confirm Delete */}
      {deleteTarget && (
        <ConfirmDialog
          message={`Delete lot ${deleteTarget.lotNo} / ${deleteTarget.designNo}? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
