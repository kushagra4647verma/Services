import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExpertBottomNav from '@/components/expert/ExpertBottomNav';
import { toast } from 'sonner';

// Placeholder data - will be replaced with API calls
const PLACEHOLDER_RESTAURANTS = [
  {
    id: 'rest_001',
    name: 'The Whisky Lounge',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
    area: 'Koramangala',
    distance: 2.5,
    cuisine: ['Bar', 'Continental', 'Whisky']
  },
  {
    id: 'rest_002',
    name: 'Craft Cocktails & Co',
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400',
    area: 'Indiranagar',
    distance: 3.2,
    cuisine: ['Bar', 'Lounge', 'Cocktails']
  },
  {
    id: 'rest_003',
    name: 'Wine Republic',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
    area: 'HSR Layout',
    distance: 4.1,
    cuisine: ['Wine Bar', 'Italian', 'European']
  }
];

export default function ExpertTasksPage({ expert }) {
  const navigate = useNavigate();
  const [assignedRestaurants, setAssignedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedRestaurants();
  }, [expert.id]);

  const fetchAssignedRestaurants = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/expert/${expert.id}/assigned-restaurants`);
    // const data = await response.json();
    
    setAssignedRestaurants(PLACEHOLDER_RESTAURANTS);
    setLoading(false);
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-white text-2xl font-bold mb-1">Expert Tasks</h1>
        <p className="text-white/60 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {today}
        </p>
      </div>

      {/* Tasks List */}
      <div className="p-6 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : assignedRestaurants.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">{assignedRestaurants.length} restaurants to visit</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedRestaurants.map((restaurant, index) => (
                <div
                  key={restaurant.id}
                  className="glass rounded-2xl overflow-hidden hover:scale-[1.02] transition-all"
                >
                  <div className="relative h-40">
                    <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Task Number Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold">
                      Task #{index + 1}
                    </div>
                    
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-semibold text-lg">{restaurant.name}</h3>
                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <MapPin className="w-3 h-3" />
                        <span>{restaurant.area}</span>
                        <span>•</span>
                        <span>{restaurant.distance} km</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {restaurant.cuisine?.slice(0, 3).map((c) => (
                        <span key={c} className="text-xs px-2 py-1 glass rounded-full text-white/70">{c}</span>
                      ))}
                    </div>
                    
                    <Button
                      onClick={() => navigate(`/expert/restaurant/${restaurant.id}`)}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-400 text-white h-10"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Start Rating
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="glass rounded-2xl p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500/50 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">All caught up!</h3>
            <p className="text-white/60">No pending tasks for today.</p>
            <p className="text-white/40 text-sm mt-2">New assignments will appear here daily.</p>
          </div>
        )}
      </div>

      <ExpertBottomNav active="tasks" />
    </div>
  );
}
