import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AppContext = createContext(null);

const normalizeDateString = (value) => {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return date?.toISOString()?.slice(0, 10);
};

const normalizeLotData = (lot) => {
  const id = lot.id || lot._id || '';
  const lotNumber = lot.lotNumber || lot.lotNo || '';
  const itemType = lot.itemType || lot.fabric || '';
  const fabric = lot.fabric || lot.itemType || '';
  const quantity = Number(lot.quantity ?? lot.pieces ?? 0);
  const pieces = Number(lot.pieces ?? lot.quantity ?? 0);
  const partyId = lot.partyId != null && lot.partyId !== '' ? String(lot.partyId) : '';
  const status = typeof lot.status === 'string'
    ? lot.status
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .toLowerCase()
    : 'pending';

  return {
    ...lot,
    id,
    lotNumber,
    lotNo: lotNumber,
    designNo: lot.designNo || '',
    description: lot.description || lot.notes || '',
    fabric,
    itemType,
    customFabric: lot.customFabric || '',
    colors: Number(lot.colors ?? 0),
    quantity,
    pieces,
    unit: lot.unit || 'pieces',
    rate: Number(lot.rate ?? 0),
    billAmount: Number(lot.billAmount ?? 0),
    totalAmount: Number(lot.totalAmount ?? lot.billAmount ?? 0),
    partyId,
    partyName: lot.partyName || '',
    allotDate: normalizeDateString(lot.allotDate || lot.receivedDate || lot.createdAt || lot.updatedAt),
    dispatchDate: normalizeDateString(lot.dispatchDate),
    receivedBackDate: normalizeDateString(lot.receivedBackDate),
    receivedDate: normalizeDateString(lot.receivedDate),
    status: status || 'Pending',
    notes: lot.notes || '',
  };
};

const INITIAL_PARTIES = [];

const INITIAL_GHAUSIA = [];

// Party ledger entries are derived from ghausia lots (when assigned to a party)
// They can have extra editable fields: completeDate, partyBillAmount, receipt
const INITIAL_PARTY_EDITS = {};

const INITIAL_PAYMENTS = [];

export function AppProvider({ children }) {
  const [parties, setParties] = useState(INITIAL_PARTIES);
  const [ghausiaLots, setGhausiaLots] = useState(INITIAL_GHAUSIA);
  const [partyEdits, setPartyEdits] = useState(INITIAL_PARTY_EDITS);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);

  useEffect(() => {
    async function loadAppData() {
      try {
        const [remoteParties, remoteLots, remotePayments, remotePartyEdits] = await Promise.all([
          apiService.getParties(),
          apiService.getGhausiaLots(),
          apiService.getPayments(),
          apiService.getPartyEdits(),
        ]);

        if (Array.isArray(remoteParties) && remoteParties.length > 0) {
          setParties(remoteParties);
        }

        if (Array.isArray(remoteLots) && remoteLots.length > 0) {
          setGhausiaLots(remoteLots.map(normalizeLotData));
        }

        if (Array.isArray(remotePayments) && remotePayments.length > 0) {
          setPayments(remotePayments);
        }

        if (Array.isArray(remotePartyEdits)) {
          setPartyEdits(remotePartyEdits.reduce((acc, item) => {
            acc[item.lotId] = item;
            return acc;
          }, {}));
        }
      } catch (error) {
        console.error('Unable to load persisted data from JSON Server', error);
      }
    }

    loadAppData();
  }, []);

  const addParty = async (p) => {
    const created = await apiService.createParty(p);
    setParties(arr => [...arr, created]);
    return created;
  };

  const updateParty = async (id, p) => {
    const updated = await apiService.updateParty(id, p);
    setParties(arr => arr.map(x => x.id === id ? updated : x));
    return updated;
  };

  const deleteParty = async (id) => {
    await apiService.deleteParty(id);
    setParties(arr => arr.filter(x => x.id !== id));
  };

  const addLot = async (lot) => {
    const created = normalizeLotData(await apiService.createGhausiaLot(lot));
    setGhausiaLots(arr => [...arr, created]);
    return created;
  };

  const updateLot = async (id, lot) => {
    const updated = normalizeLotData(await apiService.updateGhausiaLot(id, lot));
    setGhausiaLots(arr => arr.map(x => x.id === id ? updated : x));
    return updated;
  };

  const deleteLot = async (id) => {
    await apiService.deleteGhausiaLot(id);
    setGhausiaLots(arr => arr.filter(x => x.id !== id));
  };

  const updatePartyEdit = async (lotId, data) => {
    try {
      const result = await apiService.upsertPartyEditByLotId(lotId, data);
      setPartyEdits(prev => ({ ...prev, [lotId]: result }));
      return result;
    } catch (error) {
      console.error('Error updating party edit:', error);
      const fallback = { ...data, lotId };
      setPartyEdits(prev => ({
        ...prev,
        [lotId]: { ...(prev[lotId] || {}), ...fallback },
      }));
    }
  };

  const addPayment = async (p) => {
    const payment = await apiService.createPayment({ ...p, amount: Number(p.amount) });
    setPayments(arr => [...arr, payment]);
    return payment;
  };

  const deletePayment = async (id) => {
    await apiService.deletePayment(id);
    setPayments(arr => arr.filter(x => x.id !== id));
  };

  const getPartyById = (id) => parties.find(p => p.id === id);
  const getPartyName = (id) => parties.find(p => p.id === id)?.name || 'Unknown';

  return (
    <AppContext.Provider value={{
      parties, addParty, updateParty, deleteParty,
      ghausiaLots, addLot, updateLot, deleteLot,
      partyEdits, updatePartyEdit,
      payments, addPayment, deletePayment,
      getPartyById, getPartyName,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
