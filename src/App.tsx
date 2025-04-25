import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import PackDetail from './pages/PackDetail';
import { initializeFrame, waitForFrameInit } from './services/frame';
import './App.css';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      // Initialize the Frame SDK and get user FID
      // This also hides the splash screen by calling sdk.actions.ready()
      await initializeFrame();
      
      // Wait for the frame to be fully initialized before rendering the app
      await waitForFrameInit();
      
      // Mark as initialized
      setIsInitialized(true);
    }
    
    init();
  }, []);

  // Show loading state until frame is initialized
  if (!isInitialized) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

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