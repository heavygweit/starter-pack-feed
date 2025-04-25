import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import PackDetail from './pages/PackDetail';
import { initializeFrame } from './services/frame';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize the Frame SDK and get user FID
    // This also hides the splash screen by calling sdk.actions.ready()
    initializeFrame();
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