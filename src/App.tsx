import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PackDetail from './pages/PackDetail';
import PreviewFeed from './pages/PreviewFeed';
import { initializeFrame, waitForFrameInit } from './services/frame';

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
      <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-100">
        <div className="w-9 h-9 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin mb-4" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="max-w-3xl mx-auto p-4">
        <main className="py-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pack/:id" element={<PackDetail />} />
            <Route path="/preview-feed" element={<PreviewFeed />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;