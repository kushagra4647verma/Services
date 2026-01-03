import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '@/App.css';
import SplashScreen from '@/pages/SplashScreen';
import AuthPage from '@/pages/AuthPage';
import HomePage from '@/pages/HomePage';
import RestaurantDetail from '@/pages/RestaurantDetail';
import BeverageDetail from '@/pages/BeverageDetail';
import GamesPage from '@/pages/GamesPage';
import EventsPage from '@/pages/EventsPage';
import SocialPage from '@/pages/SocialPage';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('sipzy_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Show splash for 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage setUser={setUser} />} />
          <Route path="/" element={user ? <HomePage user={user} /> : <Navigate to="/auth" />} />
          <Route path="/restaurant/:id" element={user ? <RestaurantDetail user={user} /> : <Navigate to="/auth" />} />
          <Route path="/beverage/:id" element={user ? <BeverageDetail user={user} /> : <Navigate to="/auth" />} />
          <Route path="/games" element={user ? <GamesPage user={user} /> : <Navigate to="/auth" />} />
          <Route path="/events" element={user ? <EventsPage user={user} /> : <Navigate to="/auth" />} />
          <Route path="/social" element={user ? <SocialPage user={user} setUser={setUser} /> : <Navigate to="/auth" />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
