import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { sdk } from '@farcaster/frame-sdk';
import Header from './components/Header';
import Home from './pages/Home';
import PackDetail from './pages/PackDetail';
import './App.css';

function App() {
  useEffect(() => {
    // Hide splash screen when app is ready
    sdk.actions.ready();
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pack/:id" element={<PackDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;