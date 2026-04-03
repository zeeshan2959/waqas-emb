import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

const INITIAL_PARTIES = [
  { id: 1, name: 'Al-Hamra Textiles', phone: '0300-1234567', address: 'Shop 12, Cloth Market, Lahore' },
  { id: 2, name: 'Zara Fabrics', phone: '0321-9876543', address: 'Block A, Faisalabad Textile Market' },
  { id: 3, name: 'Classic Threads', phone: '0333-5554321', address: 'Main Bazar, Multan' },
  { id: 4, name: 'Royal Designs', phone: '0311-7778899', address: 'Hall Road, Lahore' },
  { id: 5, name: 'Star Cloth House', phone: '0345-1122334', address: 'Ring Road, Gujranwala' },
];

const INITIAL_GHAUSIA = [
  {
    id: 1, lotNo: 'L001', designNo: 'D-101', description: 'Floral Print',
    fabric: 'Lawn', colors: 5, pieces: 120,
    allotDate: '2025-01-10', partyId: 1,
    status: 'Completed', billAmount: 45000,
    dispatchDate: '2025-01-15', receivedBackDate: '2025-01-20',
  },
  {
    id: 2, lotNo: 'L002', designNo: 'D-102', description: 'Geometric Pattern',
    fabric: 'Velvet', colors: 3, pieces: 80,
    allotDate: '2025-01-15', partyId: 2,
    status: 'Dispatched', billAmount: 32000,
    dispatchDate: '2025-01-22', receivedBackDate: '',
  },
  {
    id: 3, lotNo: 'L003', designNo: 'D-103', description: 'Block Print',
    fabric: 'Cambric', colors: 7, pieces: 200,
    allotDate: '2025-01-18', partyId: 3,
    status: 'Received Back', billAmount: 78000,
    dispatchDate: '2025-01-25', receivedBackDate: '2025-02-01',
  },
  {
    id: 4, lotNo: 'L004', designNo: 'D-104', description: 'Embroidery Work',
    fabric: 'Lawn', colors: 2, pieces: 60,
    allotDate: '2025-01-20', partyId: 4,
    status: 'Pending', billAmount: 24000,
    dispatchDate: '', receivedBackDate: '',
  },
];

// Party ledger entries are derived from ghausia lots (when assigned to a party)
// They can have extra editable fields: completeDate, partyBillAmount, receipt
const INITIAL_PARTY_EDITS = {
  // keyed by ghausia lot id
  1: { completeDate: '2025-01-20', partyBillAmount: 45000, receipt: null, notes: '' },
};

const INITIAL_PAYMENTS = [
  { id: 1, type: 'Received', amount: 100000, party: 'Owner', date: '2025-01-05', note: 'Initial advance', linkedLot: '' },
  { id: 2, type: 'Paid', amount: 45000, party: 'Al-Hamra Textiles', date: '2025-01-22', note: 'Bill for L001/D-101', linkedLot: 'L001' },
];

export function AppProvider({ children }) {
  const [parties, setParties] = useState(INITIAL_PARTIES);
  const [ghausiaLots, setGhausiaLots] = useState(INITIAL_GHAUSIA);
  const [partyEdits, setPartyEdits] = useState(INITIAL_PARTY_EDITS);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);

  const addParty = (p) => setParties(arr => [...arr, { ...p, id: Date.now() }]);
  const updateParty = (id, p) => setParties(arr => arr.map(x => x.id === id ? { ...x, ...p } : x));
  const deleteParty = (id) => setParties(arr => arr.filter(x => x.id !== id));

  const addLot = (lot) => setGhausiaLots(arr => [...arr, { ...lot, id: Date.now() }]);
  const updateLot = (id, lot) => setGhausiaLots(arr => arr.map(x => x.id === id ? { ...x, ...lot } : x));
  const deleteLot = (id) => setGhausiaLots(arr => arr.filter(x => x.id !== id));

  const updatePartyEdit = (lotId, edits) =>
    setPartyEdits(prev => ({ ...prev, [lotId]: { ...(prev[lotId] || {}), ...edits } }));

  const addPayment = (p) => setPayments(arr => [...arr, { ...p, id: Date.now(), amount: Number(p.amount) }]);
  const deletePayment = (id) => setPayments(arr => arr.filter(x => x.id !== id));

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
