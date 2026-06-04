import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PriceProvider } from './data/usePrices';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import Portfolio from './components/Portfolio';
import Competition from './components/Competition';
import Analysis from './components/Analysis';

const App: React.FC = () => {
  return (
    <PriceProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="competition" element={<Competition />} />
            <Route path="analysis" element={<Analysis />} />
          </Route>
        </Routes>
      </HashRouter>
    </PriceProvider>
  );
};

export default App;
