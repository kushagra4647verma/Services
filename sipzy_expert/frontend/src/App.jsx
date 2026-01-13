import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '@/App.css';
import SplashScreen from '@/pages/SplashScreen';

// Expert Module
import ExpertAuthPage from '@/pages/expert/ExpertAuthPage';
import ExpertDashboard from '@/pages/expert/ExpertDashboard';
import ExpertTasksPage from '@/pages/expert/ExpertTasksPage';
import ExpertProfilePage from '@/pages/expert/ExpertProfilePage';
import ExpertRestaurantDetail from '@/pages/expert/ExpertRestaurantDetail';
import ExpertBeverageRating from '@/pages/expert/ExpertBeverageRating';
import RatingConfirmation from '@/pages/expert/RatingConfirmation';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [expert, setExpert] = useState(null);

  useEffect(() => {
    // Check if expert is logged in
    const storedExpert = localStorage.getItem('sipzy_expert');
    if (storedExpert) {
      setExpert(JSON.parse(storedExpert));
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
          {/* Root redirect to expert auth or dashboard */}
          <Route path="/" element={<Navigate to={expert ? "/expert" : "/expert/auth"} />} />
          
          {/* Expert Routes */}
          <Route path="/expert/auth" element={expert ? <Navigate to="/expert" /> : <ExpertAuthPage setExpert={setExpert} />} />
          <Route path="/expert" element={expert ? <ExpertDashboard expert={expert} setExpert={setExpert} /> : <Navigate to="/expert/auth" />} />
          <Route path="/expert/tasks" element={expert ? <ExpertTasksPage expert={expert} /> : <Navigate to="/expert/auth" />} />
          <Route path="/expert/profile" element={expert ? <ExpertProfilePage expert={expert} setExpert={setExpert} /> : <Navigate to="/expert/auth" />} />
          <Route path="/expert/restaurant/:id" element={expert ? <ExpertRestaurantDetail expert={expert} /> : <Navigate to="/expert/auth" />} />
          <Route path="/expert/beverage/:id/rate" element={expert ? <ExpertBeverageRating expert={expert} /> : <Navigate to="/expert/auth" />} />
          <Route path="/expert/rating-success" element={expert ? <RatingConfirmation expert={expert} /> : <Navigate to="/expert/auth" />} />
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
