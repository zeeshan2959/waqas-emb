import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import GhausiaCollection from './pages/GhausiaCollection';
import PartyLedger from './pages/PartyLedger';
import Parties from './pages/Parties';
import Payments from './pages/Payments';
import RateCalculations from './pages/RateCalculations';

function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 230, flex: 1, padding: '28px 28px 40px', minHeight: '100vh', background: '#F0F2F5' }}>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ghausia" element={<GhausiaCollection />} />
            <Route path="/party-ledger" element={<PartyLedger />} />
            <Route path="/parties" element={<Parties />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/rate-calculations" element={<RateCalculations />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
