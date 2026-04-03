import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, FormGroup, StatusBadge, SearchBar, EmptyState } from '../components/UI';

export default function PartyLedger() {
  const { ghausiaLots, updateLot, partyEdits, updatePartyEdit, getPartyName, parties } = useApp();
  const [search, setSearch] = useState('');
  const [partyFilter, setPartyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Only show lots that have been assigned to a party (all non-null partyId lots)
  const assignedLots = useMemo(() => {
    return ghausiaLots.filter(l => l.partyId);
  }, [ghausiaLots]);

  const filtered = useMemo(() => assignedLots.filter(l => {
    const q = search.toLowerCase();
    const matchQ = !q || l.lotNo.toLowerCase().includes(q) || l.designNo.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
    const matchP = partyFilter === 'All' || String(l.partyId) === partyFilter;
    const pe = partyEdits[l.id] || {};
    const displayStatus = pe.overrideStatus || l.status;
    const matchS = statusFilter === 'All' || displayStatus === statusFilter;
    return matchQ && matchP && matchS;
  }), [assignedLots, search, partyFilter, statusFilter, partyEdits]);

  const openEdit = (lot, initialStatus) => {
    const pe = partyEdits[lot.id] || {};
    setEditForm({
      allotDate: lot.allotDate || '',
      completeDate: pe.completeDate || (initialStatus === 'Completed' ? new Date().toISOString().slice(0, 10) : ''),
      status: initialStatus || pe.overrideStatus || lot.status,
      billAmount: pe.partyBillAmount !== undefined ? pe.partyBillAmount : (lot.billAmount || ''),
      receipt: pe.receipt || '',
      notes: pe.notes || '',
    });
    setEditingId(lot.id);
  };

  const handleSave = () => {
    const lot = ghausiaLots.find(l => l.id === editingId);

    if (editForm.status === 'Completed') {
      // Mark ledger entry done and also update Ghausia collection item
      updatePartyEdit(editingId, {
        completeDate: editForm.completeDate || new Date().toISOString().slice(0, 10),
        partyBillAmount: editForm.billAmount,
        receipt: editForm.receipt,
        notes: editForm.notes,
        overrideStatus: 'Completed',
      });
      updateLot(editingId, {
        status: 'Received Back',
        receivedBackDate: editForm.completeDate || new Date().toISOString().slice(0, 10),
      });
    } else {
      updatePartyEdit(editingId, {
        completeDate: editForm.completeDate,
        partyBillAmount: editForm.billAmount,
        receipt: editForm.receipt,
        notes: editForm.notes,
        overrideStatus: 'In Progress',
      });
      if (lot.status !== 'Dispatched') {
        updateLot(editingId, { status: 'Dispatched', dispatchDate: lot.dispatchDate || new Date().toISOString().slice(0, 10) });
      }
    }

    setEditingId(null);
  };

  const totals = useMemo(() => ({
    lots: filtered.length,
    billTotal: filtered.reduce((s, l) => {
      const pe = partyEdits[l.id] || {};
      return s + Number(pe.partyBillAmount !== undefined ? pe.partyBillAmount : (l.billAmount || 0));
    }, 0),
    completed: filtered.filter(l => {
      const pe = partyEdits[l.id] || {};
      return (pe.overrideStatus || l.status) === 'Completed';
    }).length,
    inProgress: filtered.filter(l => {
      const pe = partyEdits[l.id] || {};
      return (pe.overrideStatus || l.status) === 'In Progress';
    }).length,
    withReceipt: filtered.filter(l => partyEdits[l.id]?.receipt).length,
  }), [filtered, partyEdits]);

  const handleRowStatusChange = (lot, newStatus) => {
    if (newStatus === 'Completed') {
      openEdit(lot, 'Completed');
      return;
    }

    updatePartyEdit(lot.id, { overrideStatus: 'In Progress' });
    if (lot.status !== 'Dispatched') {
      updateLot(lot.id, { status: 'Dispatched', dispatchDate: new Date().toISOString().slice(0, 10) });
    }
  };

  const editingLot = ghausiaLots.find(l => l.id === editingId);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Party Ledger</div>
          <div className="page-subtitle">All lots assigned to parties — editable completion details</div>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Assigned Lots', value: totals.lots, color: '#1e40af' },
          { label: 'Total Bill Value', value: `₨${totals.billTotal.toLocaleString()}`, color: '#7c3aed' },
          { label: 'Completed', value: totals.completed, color: '#15803d' },
          { label: 'In Progress', value: totals.inProgress, color: '#d97706' },
          { label: 'With Receipts', value: totals.withReceipt, color: '#0284c7' },
        ].map(c => (
          <div key={c.label} className="stat-card">
            <div className="stat-label">{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search lot no., design..." />
        <select className="form-select" style={{ width: 190 }} value={partyFilter} onChange={e => setPartyFilter(e.target.value)}>
          <option value="All">All Parties</option>
          {parties.map(p => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
        </select>
        <select className="form-select" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option>Completed</option>
          <option>In Progress</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Lot No</th>
                <th>Design No</th>
                <th>Description</th>
                <th>Fabric</th>
                <th>Colors</th>
                <th>Pieces</th>
                <th>Allot Date</th>
                <th>Complete Date</th>
                <th>Party Name</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Bill Amount</th>
                <th>Receipt</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={13}><EmptyState message="No assigned lots found" /></td></tr>
              ) : filtered.map(l => {
                const pe = partyEdits[l.id] || {};
                const displayStatus = pe.overrideStatus || l.status;
                const displayBill = pe.partyBillAmount !== undefined ? pe.partyBillAmount : l.billAmount;
                return (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 700, color: '#1e40af' }}>{l.lotNo}</td>
                    <td style={{ fontWeight: 600 }}>{l.designNo}</td>
                    <td>{l.description}</td>
                    <td>
                      <span style={{ background: '#F0F9FF', color: '#0369a1', border: '1px solid #BAE6FD', borderRadius: 6, padding: '2px 8px', fontSize: 12 }}>
                        {l.fabric}
                      </span>
                    </td>
                    <td>{l.colors}</td>
                    <td>{l.pieces}</td>
                    <td>{l.allotDate}</td>
                    <td>{pe.completeDate || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td style={{ fontWeight: 500 }}>{getPartyName(l.partyId)}</td>
                    <td>
                      <select
                        className="form-select"
                        style={{ width: 140, minWidth: 140, fontSize: 12, padding: '5px 8px' }}
                        value={displayStatus === 'Received Back' ? 'Completed' : displayStatus}
                        onChange={(e) => handleRowStatusChange(l, e.target.value)}
                      >
                        <option>In Progress</option>
                        <option>Completed</option>
                      </select>
                      <div style={{ marginTop: 4 }}>
                        <StatusBadge status={displayStatus === 'Received Back' ? 'Completed' : displayStatus} />
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#1e40af' }}>
                      ₨{Number(displayBill || 0).toLocaleString()}
                    </td>
                    <td>
                      {pe.receipt
                        ? <span style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: 6, padding: '2px 8px', fontSize: 11.5, fontWeight: 600 }}>📎 {pe.receipt}</span>
                        : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No receipt</span>
                      }
                    </td>
                    <td>
                      <button
                        onClick={() => openEdit(l)}
                        style={{ padding: '4px 12px', fontSize: 12, fontWeight: 500, borderRadius: 6, cursor: 'pointer', background: '#EFF6FF', color: '#1e40af', border: '1px solid #BFDBFE', fontFamily: 'Inter, sans-serif' }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && editingLot && (
        <Modal
          title={`Edit — ${editingLot.lotNo} / ${editingLot.designNo}`}
          onClose={() => setEditingId(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setEditingId(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
            </>
          }
        >
          {/* Read-only info */}
          <div style={{ background: '#F8FAFC', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lot Info (read-only)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px 16px', fontSize: 13 }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Description: </span>{editingLot.description}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Fabric: </span>{editingLot.fabric}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Colors: </span>{editingLot.colors}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Pieces: </span>{editingLot.pieces}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Party: </span>{getPartyName(editingLot.partyId)}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Ghausia Status: </span><StatusBadge status={editingLot.status} /></div>
            </div>
          </div>

          <div className="grid-2">
            <FormGroup label="Allot Date">
              <input className="form-input" type="date" value={editForm.allotDate} onChange={e => setEditForm(f => ({ ...f, allotDate: e.target.value }))} />
            </FormGroup>
            <FormGroup label="Status">
              <select className="form-select" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                <option>Completed</option>
                <option>In Progress</option>
              </select>
            </FormGroup>
            {editForm.status === 'Completed' && (
              <FormGroup label="Complete Date">
                <input className="form-input" type="date" value={editForm.completeDate} onChange={e => setEditForm(f => ({ ...f, completeDate: e.target.value }))} />
              </FormGroup>
            )}
            <FormGroup label="Bill Amount (₨)">
              <input className="form-input" type="number" value={editForm.billAmount} onChange={e => setEditForm(f => ({ ...f, billAmount: e.target.value }))} />
            </FormGroup>
          </div>
          <FormGroup label="Upload Bill Receipt (filename)">
            <input
              className="form-input"
              type="file"
              accept="image/*,.pdf"
              onChange={e => setEditForm(f => ({ ...f, receipt: e.target.files[0]?.name || '' }))}
            />
            {editForm.receipt && (
              <div style={{ fontSize: 12, color: '#15803d', marginTop: 5 }}>📎 {editForm.receipt}</div>
            )}
          </FormGroup>
          <FormGroup label="Notes">
            <textarea className="form-textarea" rows={2} value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." style={{ resize: 'vertical' }} />
          </FormGroup>

          {editForm.status === 'Completed' && editingLot.status !== 'Completed' && (
            <div className="alert alert-warning">
              <strong>Note:</strong> Marking as Completed will update the Ghausia lot status to "Received Back" with the complete date.
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
