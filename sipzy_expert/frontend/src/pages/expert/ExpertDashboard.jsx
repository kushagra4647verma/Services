import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Star, TrendingUp, Wine, ChevronRight, MapPin, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
    cuisine: ['Bar', 'Continental']
  },
  {
    id: 'rest_002',
    name: 'Craft Cocktails & Co',
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400',
    area: 'Indiranagar',
    distance: 3.2,
    cuisine: ['Bar', 'Lounge']
  },
  {
    id: 'rest_003',
    name: 'Wine Republic',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
    area: 'HSR Layout',
    distance: 4.1,
    cuisine: ['Wine Bar', 'Italian']
  }
];

const PLACEHOLDER_STATS = {
  total_ratings: 127,
  avg_score_given: 3.8,
  beverages_this_week: 12
};

const PLACEHOLDER_RECENT = {
  weekly_count: 12,
  restaurants: [
    {
      id: 'rest_101',
      name: 'The Brew House',
      image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400',
      area: 'MG Road'
    },
    {
      id: 'rest_102',
      name: 'Spirits & Spice',
      image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400',
      area: 'Whitefield'
    }
  ]
};

export default function ExpertDashboard({ expert, setExpert }) {
  const navigate = useNavigate();
  const [assignedRestaurants, setAssignedRestaurants] = useState([]);
  const [recentlyRated, setRecentlyRated] = useState({ weekly_count: 0, restaurants: [] });
  const [stats, setStats] = useState({ total_ratings: 0, avg_score_given: 0, beverages_this_week: 0 });
  const [loading, setLoading] = useState(true);
  const [showRecentModal, setShowRecentModal] = useState(false);
  const location = useLocation();

  // Fetch dashboard data - replace with actual API calls
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // TODO: Replace with actual API calls
    // const [assignedRes, recentRes, statsRes] = await Promise.all([
    //   fetch(`/api/expert/${expert.id}/assigned-restaurants`),
    //   fetch(`/api/expert/${expert.id}/recently-rated`),
    //   fetch(`/api/expert/${expert.id}/stats`)
    // ]);
    
    setAssignedRestaurants(PLACEHOLDER_RESTAURANTS);
    setRecentlyRated(PLACEHOLDER_RECENT);
    setStats(PLACEHOLDER_STATS);
    setLoading(false);
  }, [expert.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, location.key]);

  const handleLogout = () => {
    localStorage.removeItem('sipzy_expert');
    if (setExpert) setExpert(null);
    navigate('/expert/auth');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      {/* Header */}
      <div className="p-6 space-y-4">
        {/* Expert Greeting */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center overflow-hidden">
              {expert.avatar ? (
                <img src={expert.avatar} alt={expert.name} className="w-full h-full object-cover" />
              ) : (
                <ShieldCheck className="w-7 h-7 text-white" />
              )}
            </div>
            <div>
              <p className="text-white/60 text-sm">Hello,</p>
              <h1 className="text-white text-xl font-bold">{expert.name}!</h1>
            </div>
          </div>
          
          {/* Right side: Badge + Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600/20 to-purple-400/20 border border-purple-500/30">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 font-medium text-xs">Verified Expert</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-red-500/20 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-6 mb-6">
        <h2 className="text-white text-lg font-bold mb-4">Expert Stats</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="glass rounded-2xl p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.total_ratings}</p>
            <p className="text-white/60 text-xs">Total Ratings</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.avg_score_given}</p>
            <p className="text-white/60 text-xs">Avg Score</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
              <Wine className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.beverages_this_week}</p>
            <p className="text-white/60 text-xs">This Week</p>
          </div>
        </div>
      </div>

      {/* Today's Exploration */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-bold">Today&apos;s Exploration</h2>
          {assignedRestaurants.length > 0 && (
            <span className="text-purple-400 text-sm">{assignedRestaurants.length} pending</span>
          )}
        </div>
        
        {loading ? (
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {[1, 2].map((i) => (
              <div key={i} className="glass rounded-2xl h-48 w-64 flex-shrink-0 animate-pulse" />
            ))}
          </div>
        ) : assignedRestaurants.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {assignedRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => navigate(`/expert/restaurant/${restaurant.id}`)}
                className="glass rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all min-w-[260px] flex-shrink-0"
              >
                <div className="relative h-36">
                  <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-semibold">{restaurant.name}</h3>
                    <div className="flex items-center gap-1 text-white/70 text-xs">
                      <MapPin className="w-3 h-3" />
                      <span>{restaurant.area}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-400 text-white text-sm h-9"
                  >
                    Start Rating
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-8 text-center">
            <ShieldCheck className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
            <p className="text-white/60">No restaurants assigned for today</p>
            <p className="text-white/40 text-sm mt-1">Check back tomorrow!</p>
          </div>
        )}
      </div>

      {/* Recently Rated */}
      <div className="px-6">
        <button
          onClick={() => setShowRecentModal(true)}
          className="w-full glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Star className="w-6 h-6 text-amber-500" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-semibold">Recently Rated</h3>
              <p className="text-white/60 text-sm">{recentlyRated.weekly_count} beverages this week</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/60" />
        </button>
      </div>

      {/* Recently Rated Modal */}
      <Sheet open={showRecentModal} onOpenChange={setShowRecentModal}>
        <SheetContent side="bottom" className="bg-[#0a0a0a] border-white/10 max-h-[70vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-white">Recently Rated Restaurants</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 mt-6">
            {recentlyRated.restaurants.length > 0 ? (
              recentlyRated.restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="glass rounded-xl p-4 flex items-center gap-3"
                >
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{restaurant.name}</h4>
                    <p className="text-white/60 text-sm">{restaurant.area}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-white/60">No ratings yet</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <ExpertBottomNav active="home" />
    </div>
  );
}
