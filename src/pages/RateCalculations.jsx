import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, FormGroup, EmptyState } from '../components/UI';

export default function RateCalculations() {
  const { ghausiaLots, parties, getPartyName } = useApp();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    fabric: '',
    pieces: '',
    ratePerPiece: '',
    totalCost: '',
    notes: '',
  });

  const calculations = useMemo(() => {
    // Group lots by fabric and calculate average rates
    const fabricGroups = {};
    ghausiaLots.forEach(lot => {
      if (!fabricGroups[lot.fabric]) {
        fabricGroups[lot.fabric] = {
          fabric: lot.fabric,
          totalLots: 0,
          totalPieces: 0,
          totalValue: 0,
          avgRatePerPiece: 0,
          minRate: Infinity,
          maxRate: 0,
        };
      }
      const group = fabricGroups[lot.fabric];
      group.totalLots += 1;
      group.totalPieces += Number(lot.pieces || 0);
      group.totalValue += Number(lot.billAmount || 0);
      const ratePerPiece = Number(lot.billAmount || 0) / Number(lot.pieces || 1);
      group.minRate = Math.min(group.minRate, ratePerPiece);
      group.maxRate = Math.max(group.maxRate, ratePerPiece);
    });

    Object.values(fabricGroups).forEach(group => {
      group.avgRatePerPiece = group.totalValue / group.totalPieces;
    });

    return Object.values(fabricGroups);
  }, [ghausiaLots]);

  const handleSave = () => {
    // For now, just close the modal. In a real app, you'd save to a database
    setForm({
      fabric: '',
      pieces: '',
      ratePerPiece: '',
      totalCost: '',
      notes: '',
    });
    setModal(false);
  };

  const calculateTotal = () => {
    const pieces = Number(form.pieces || 0);
    const rate = Number(form.ratePerPiece || 0);
    return pieces * rate;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Rate Calculations</div>
          <div className="page-subtitle">Calculate and track rates per piece for different fabrics</div>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Calculation
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Total Fabrics', value: calculations.length, color: '#1e40af' },
          { label: 'Total Lots', value: calculations.reduce((s, c) => s + c.totalLots, 0), color: '#7c3aed' },
          { label: 'Total Pieces', value: calculations.reduce((s, c) => s + c.totalPieces, 0).toLocaleString(), color: '#d97706' },
          { label: 'Total Value', value: `₨${calculations.reduce((s, c) => s + c.totalValue, 0).toLocaleString()}`, color: '#15803d' },
        ].map(c => (
          <div key={c.label} className="stat-card">
            <div className="stat-label">{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Fabric Rate Table */}
      <div className="table-wrapper">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Fabric Type</th>
                <th style={{ textAlign: 'center' }}>Total Lots</th>
                <th style={{ textAlign: 'center' }}>Total Pieces</th>
                <th style={{ textAlign: 'right' }}>Total Value</th>
                <th style={{ textAlign: 'right' }}>Avg Rate/Piece</th>
                <th style={{ textAlign: 'right' }}>Min Rate</th>
                <th style={{ textAlign: 'right' }}>Max Rate</th>
              </tr>
            </thead>
            <tbody>
              {calculations.length === 0 ? (
                <tr><td colSpan={7}><EmptyState message="No fabric data available" /></td></tr>
              ) : calculations.map(calc => (
                <tr key={calc.fabric}>
                  <td style={{ fontWeight: 600, color: '#1e40af' }}>{calc.fabric}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{calc.totalLots}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{calc.totalPieces.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#7c3aed' }}>₨{calc.totalValue.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#d97706' }}>₨{calc.avgRatePerPiece.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>₨{calc.minRate.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#15803d' }}>₨{calc.maxRate.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Calculation Modal */}
      {modal && (
        <Modal
          title="Add Rate Calculation"
          onClose={() => setModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save Calculation</button>
            </>
          }
        >
          <div className="grid-2">
            <FormGroup label="Fabric Type">
              <input
                className="form-input"
                value={form.fabric}
                onChange={e => setForm(f => ({ ...f, fabric: e.target.value }))}
                placeholder="e.g. Lawn, Velvet"
              />
            </FormGroup>
            <FormGroup label="Number of Pieces">
              <input
                className="form-input"
                type="number"
                value={form.pieces}
                onChange={e => setForm(f => ({ ...f, pieces: e.target.value }))}
                placeholder="100"
              />
            </FormGroup>
            <FormGroup label="Rate per Piece (₨)">
              <input
                className="form-input"
                type="number"
                step="0.01"
                value={form.ratePerPiece}
                onChange={e => setForm(f => ({ ...f, ratePerPiece: e.target.value }))}
                placeholder="45.50"
              />
            </FormGroup>
            <FormGroup label="Total Cost (Auto-calculated)">
              <input
                className="form-input"
                type="number"
                value={calculateTotal().toFixed(2)}
                readOnly
                style={{ background: '#F8FAFC', cursor: 'not-allowed' }}
              />
            </FormGroup>
          </div>
          <FormGroup label="Notes">
            <textarea
              className="form-textarea"
              rows={3}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Optional notes about this calculation..."
            />
          </FormGroup>
        </Modal>
      )}
    </div>
  );
}