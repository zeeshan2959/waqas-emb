import React, { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import { useApp } from '../context/AppContext';
import { Modal, FormGroup, StatusBadge, ActionBtn, SearchBar, EmptyState, ConfirmDialog } from '../components/UI';

const FABRICS = ['Lawn', 'Velvet', 'Cambric'];
const COLOR_OPTIONS = Array.from({ length: 13 }, (_, i) => i);
const STATUS_OPTIONS = ['pending', 'dispatched', 'received back', 'completed'];

function LotForm({ initial, onSave, onClose, parties }) {
  const blank = {
    lotNumber: '', lotNo: '', designNo: '', description: '', itemType: 'Lawn', fabric: 'Lawn', customFabric: '',
    colors: 0, quantity: '', pieces: '', unit: 'pieces', rate: '', billAmount: '',
    //  totalAmount: '', 
    //  notes: '',
    allotDate: new Date().toISOString().slice(0, 10), partyId: '', partyName: '',
    status: 'pending', dispatchDate: '', receivedBackDate: '',
  };
  const [form, setForm] = useState(initial ? {
    ...blank,
    ...initial,
    lotNumber: initial.lotNumber || initial.lotNo || '',
    lotNo: initial.lotNo || initial.lotNumber || '',
    itemType: FABRICS.includes(initial.itemType || initial.fabric) ? (initial.itemType || initial.fabric) : '__custom',
    fabric: FABRICS.includes(initial.itemType || initial.fabric) ? (initial.itemType || initial.fabric) : '__custom',
    customFabric: FABRICS.includes(initial.itemType || initial.fabric) ? '' : (initial.customFabric || initial.itemType || initial.fabric || ''),
    quantity: initial.quantity ?? initial.pieces ?? '',
    pieces: initial.pieces ?? initial.quantity ?? '',
    partyId: initial.partyId || (parties.find(p => p.name === (initial.partyName || initial.party))?.id) || '',
    partyName: (parties.find(p => p.id === initial.partyId)?.name) || initial.partyName || '',
  } : blank);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const newErrors = {};
    if (!form.lotNumber.trim()) newErrors.lotNumber = 'Lot Number is required';
    if (!form.designNo.trim()) newErrors.designNo = 'Design Number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const finalType = form.itemType === '__custom' ? form.customFabric : form.itemType;
    const lotNumber = form.lotNumber || form.lotNo;
    const quantityValue = Number(form.quantity || form.pieces || 0);
    const selectedParty = parties.find(p => p.id === form.partyId);
    const partyName = selectedParty?.name || form.partyName || '';
    const partyId = form.partyId || '';

    onSave({
      ...form,
      fabric: finalType,
      itemType: finalType,
      lotNumber,
      lotNo: lotNumber,
      quantity: quantityValue,
      pieces: quantityValue,
      rate: Number(form.rate || 0),
      billAmount: Number(form.billAmount || 0),
      // totalAmount: Number(form.totalAmount || form.billAmount || 0),
      unit: form.unit || 'pieces',
      partyId,
      partyName,
    });
  };

  return (
    <>
      <div className="grid-2">
        <FormGroup label="Lot Number *">
          <input
            className={`form-input${errors.lotNumber ? ' input-error' : ''}`}
            value={form.lotNumber}
            onChange={e => { const v = e.target.value; set('lotNumber', v); set('lotNo', v); }}
            placeholder="e.g. L-10"
          />
          {errors.lotNumber && <span style={{ color: '#dc2626', fontSize: 11, marginTop: 3, display: 'block' }}>{errors.lotNumber}</span>}
        </FormGroup>
        <FormGroup label="Design Number *">
          <input
            className={`form-input${errors.designNo ? ' input-error' : ''}`}
            value={form.designNo}
            onChange={e => set('designNo', e.target.value)}
            placeholder="e.g. D-101"
          />
          {errors.designNo && <span style={{ color: '#dc2626', fontSize: 11, marginTop: 3, display: 'block' }}>{errors.designNo}</span>}
        </FormGroup>
        <FormGroup label="Description">
          <input className="form-input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Floral Print" />
        </FormGroup>
        <FormGroup label="Item Type">
          <select className="form-select" value={form.itemType} onChange={e => set('itemType', e.target.value)}>
            {FABRICS.map(f => <option key={f}>{f}</option>)}
            <option value="__custom">+ Custom Item Type</option>
          </select>
          {form.itemType === '__custom' && (
            <input className="form-input" style={{ marginTop: 6 }} value={form.customFabric} onChange={e => set('customFabric', e.target.value)} placeholder="Enter item type" />
          )}
        </FormGroup>
        <FormGroup label="Colors (0–12)">
          <select className="form-select" value={form.colors} onChange={e => set('colors', +e.target.value)}>
            {COLOR_OPTIONS.map(n => <option key={n} value={n}>{n} color{n !== 1 ? 's' : ''}</option>)}
          </select>
        </FormGroup>
        {/* <FormGroup label="Total Amount (₨)">
          <input className="form-input" type="number" min="0" value={form.totalAmount} onChange={e => set('totalAmount', e.target.value)} placeholder="0" />
        </FormGroup> */}
        <FormGroup label="Allot Date">
          <input className="form-input" type="date" value={form.allotDate} onChange={e => set('allotDate', e.target.value)} />
        </FormGroup>
        <FormGroup label="Party">
          <select
            className="form-select"
            value={form.partyId}
            autoFocus={!initial}
            onChange={e => {
              const selectedParty = parties.find(p => p.id === e.target.value);
              set('partyId', e.target.value);
              set('partyName', selectedParty ? selectedParty.name : '');
            }}
          >
            <option value="">— Select Party —</option>
            {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Status">
          <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Bill Amount (₨)">
          <input className="form-input" type="number" min="0" value={form.billAmount} onChange={e => set('billAmount', e.target.value)} placeholder="45000" />
        </FormGroup>
        {/* <FormGroup label="Notes">
          <input className="form-input" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes" />
        </FormGroup> */}
        {(form.status === 'dispatched' || form.status === 'received back' || form.status === 'completed') && (
          <FormGroup label="Dispatch Date">
            <input className="form-input" type="date" value={form.dispatchDate} onChange={e => set('dispatchDate', e.target.value)} />
          </FormGroup>
        )}
        {(form.status === 'received back' || form.status === 'completed') && (
          <FormGroup label="Received Back Date">
            <input className="form-input" type="date" value={form.receivedBackDate} onChange={e => set('receivedBackDate', e.target.value)} />
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
  const [payErrors, setPayErrors] = useState({});

  const statusMeta = {
    'pending':       { className: 'badge badge-pending',    label: 'Pending' },
    'dispatched':    { className: 'badge badge-dispatched', label: 'Dispatched' },
    'received back': { className: 'badge badge-received',   label: 'Received Back' },
    'completed':     { className: 'badge badge-completed',  label: 'Completed' },
    'in progress':   { className: 'badge badge-inprogress', label: 'In Progress' },
  };

  const setLotStatus = async (lot, newStatus) => {
    const today = new Date().toISOString().slice(0, 10);
    const lotUpdate = { status: newStatus };
    if (newStatus === 'dispatched') lotUpdate.dispatchDate = today;
    if (newStatus === 'received back' || newStatus === 'completed') lotUpdate.receivedBackDate = today;
    await updateLot(lot.id, lotUpdate);

    const ledgerStatus = newStatus === 'dispatched' ? 'In Progress' : (newStatus === 'completed' ? 'Completed' : newStatus);
    await updatePartyEdit(lot.id, {
      overrideStatus: ledgerStatus,
      completeDate: newStatus === 'completed' ? today : '',
    });

    if (statusFilter !== 'All' && newStatus !== statusFilter) {
      setStatusFilter('All');
    }
  };

  const filtered = useMemo(() => ghausiaLots.filter(l => {
    const q = search.toLowerCase();
    const lotLabel = (l.lotNumber || l.lotNo || '').toLowerCase();
    const matchQ = !q || lotLabel.includes(q) || l.designNo.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
    const matchS = statusFilter === 'All' || l.status === statusFilter;
    return matchQ && matchS;
  }), [ghausiaLots, search, statusFilter]);

  const billable = ghausiaLots.filter(l => l.status === 'received back');
  const billableTotal = billable.reduce((s, l) => s + Number(l.billAmount || 0), 0);
  const ownerIn = payments.filter(p => p.type === 'Received').reduce((s, p) => s + p.amount, 0);
  const partyOut = payments.filter(p => p.type === 'Paid').reduce((s, p) => s + p.amount, 0);

  const openEdit = (lot) => { setEditing(lot); setModal('form'); };
  const openAdd = () => { setEditing(null); setModal('form'); };

  const handleSave = async (form) => {
    if (editing) await updateLot(editing.id, form);
    else await addLot(form);
    setModal(null); setEditing(null);
  };

  const handleDelete = async () => {
    await deleteLot(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handlePartyChange = async (lotId, partyId) => {
    const currentDate = new Date().toISOString().slice(0, 10);
    const selectedParty = parties.find(p => p.id === partyId);
    await updateLot(lotId, {
      partyId: partyId || '',
      partyName: selectedParty ? selectedParty.name : '',
      status: partyId ? 'dispatched' : 'pending',
      dispatchDate: partyId ? currentDate : '',
    });
    if (partyId) {
      await updatePartyEdit(lotId, {
        overrideStatus: 'In Progress',
        allotDate: currentDate,
      });
    }
  };

  const validatePayForm = () => {
    const errs = {};
    if (!payForm.amount) errs.amount = 'Amount is required';
    if (!payForm.date) errs.date = 'Date is required';
    if (payForm.type === 'Paid' && !payForm.party) errs.party = 'Please select a party';
    setPayErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddPayment = async () => {
    if (!validatePayForm()) return;
    try {
      await addPayment({
        type: payForm.type,
        amount: Number(payForm.amount),
        party: payForm.party,
        date: payForm.date,
        linkedLot: payForm.linkedLot,
        note: payForm.note,
      });
      setPayModal(false);
      setPayErrors({});
      setPayForm({ type: 'Received', amount: '', party: 'Owner', date: '', note: '', linkedLot: '' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save payment. Please try again.' });
    }
  };

  const handleDeletePayment = async (id) => {
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
      await deletePayment(id);
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
                        <button className="btn-icon" onClick={() => handleDeletePayment(p.id)} title="Delete">
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
                <span>{l.lotNumber || l.lotNo} / {l.designNo} — <span style={{ color: '#92600A' }}>{l.partyId || l.partyName}</span></span>
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
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Lot No</th><th>Design No</th><th>Description</th><th>Item Type</th>
                <th>Colors</th>
                {/* <th>Quantity</th> */}
                <th>Allot Date</th><th>Party Name</th>
                <th>Status</th><th style={{ textAlign: 'right' }}>Bill Amount</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={11}><EmptyState message="No lots found" /></td></tr>
              ) : filtered.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 700, color: '#1e40af' }}>{l.lotNumber}</td>
                  <td style={{ fontWeight: 600 }}>{l.designNo}</td>
                  <td>{l.description}</td>
                  <td><span style={{ background: '#F0F9FF', color: '#0369a1', border: '1px solid #BAE6FD', borderRadius: 6, padding: '2px 8px', fontSize: 12 }}>{l.itemType || l.fabric}</span></td>
                  <td>{l.colors}</td>
                  {/* <td>{l.quantity}</td> */}
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
                  <td>
                    <select
                      className="form-select"
                      style={{ width: 150, fontSize: 12, padding: '5px 8px' }}
                      value={l.status}
                      onChange={(e) => setLotStatus(l, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
                      ))}
                    </select>
                    <div style={{ marginTop: 4 }}>
                      <StatusBadge status={statusMeta[l.status]?.label || l.status} />
                    </div>
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
        <Modal title="Record Payment" onClose={() => { setPayModal(false); setPayErrors({}); }}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => { setPayModal(false); setPayErrors({}); }}>Cancel</button>
              <button className="btn btn-success" onClick={handleAddPayment}>Save Payment</button>
            </>
          }
        >
          <div className="grid-2">
            <FormGroup label="Type">
              <select className="form-select" value={payForm.type} onChange={e => {
                const newType = e.target.value;
                setPayForm(f => ({ ...f, type: newType, party: newType === 'Received' ? 'Owner' : '' }));
                setPayErrors(prev => ({ ...prev, party: undefined }));
              }}>
                <option>Received</option>
                <option>Paid</option>
              </select>
            </FormGroup>
            <FormGroup label="Amount (₨) *">
              <input
                className={`form-input${payErrors.amount ? ' input-error' : ''}`}
                type="number"
                value={payForm.amount}
                onChange={e => { setPayForm(f => ({ ...f, amount: e.target.value })); setPayErrors(p => ({ ...p, amount: undefined })); }}
                placeholder="50000"
              />
              {payErrors.amount && <span style={{ color: '#dc2626', fontSize: 11, marginTop: 3, display: 'block' }}>{payErrors.amount}</span>}
            </FormGroup>
            <FormGroup label={payForm.type === 'Received' ? 'Received From' : 'Paid To *'}>
              {payForm.type === 'Received' ? (
                <input
                  className="form-input"
                  value={payForm.party}
                  onChange={e => setPayForm(f => ({ ...f, party: e.target.value }))}
                  placeholder="Owner name"
                />
              ) : (
                <>
                  <select
                    className={`form-select${payErrors.party ? ' input-error' : ''}`}
                    value={payForm.party}
                    onChange={e => { setPayForm(f => ({ ...f, party: e.target.value })); setPayErrors(p => ({ ...p, party: undefined })); }}
                  >
                    <option value="">— Select Party —</option>
                    {parties.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    <option value="Other">Other</option>
                  </select>
                  {payErrors.party && <span style={{ color: '#dc2626', fontSize: 11, marginTop: 3, display: 'block' }}>{payErrors.party}</span>}
                </>
              )}
            </FormGroup>
            <FormGroup label="Date *">
              <input
                className={`form-input${payErrors.date ? ' input-error' : ''}`}
                type="date"
                value={payForm.date}
                onChange={e => { setPayForm(f => ({ ...f, date: e.target.value })); setPayErrors(p => ({ ...p, date: undefined })); }}
              />
              {payErrors.date && <span style={{ color: '#dc2626', fontSize: 11, marginTop: 3, display: 'block' }}>{payErrors.date}</span>}
            </FormGroup>
            <FormGroup label="Linked Lot (optional)">
              <select className="form-select" value={payForm.linkedLot} onChange={e => setPayForm(f => ({ ...f, linkedLot: e.target.value }))}>
                <option value="">None</option>
                {ghausiaLots.map(l => <option key={l.id} value={l.lotNumber}>{l.lotNumber || l.lotNo} / {l.designNo}</option>)}
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
          message={`Delete lot ${deleteTarget.lotNumber || deleteTarget.lotNo} / ${deleteTarget.designNo}? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
