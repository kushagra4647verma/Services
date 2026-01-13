import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Star, Wine, Coffee, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Placeholder data - will be replaced with API call
const PLACEHOLDER_RESTAURANTS = {
  'rest_001': {
    id: 'rest_001',
    name: 'The Whisky Lounge',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
    area: 'Koramangala',
    distance: 2.5,
    cuisine: ['Bar', 'Continental', 'Whisky'],
    phone: '+91 9876543210',
    lat: 12.9352,
    lon: 77.6245,
    beverages: [
      { id: 'bev_001', name: 'Glenfiddich 12yr', type: 'whisky', base_drink: 'Scotch', price: 850, image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400', alcoholic: true, sipzy_rating: 4.2 },
      { id: 'bev_002', name: 'Old Fashioned', type: 'cocktail', base_drink: 'Bourbon', price: 650, image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400', alcoholic: true, sipzy_rating: 4.5 },
      { id: 'bev_003', name: 'Virgin Mojito', type: 'mocktail', base_drink: 'Lime', price: 350, image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400', alcoholic: false, sipzy_rating: 4.0 },
      { id: 'bev_004', name: 'Espresso Martini', type: 'cocktail', base_drink: 'Vodka', price: 550, image: 'https://images.unsplash.com/photo-1545438102-799c3991fffa?w=400', alcoholic: true, sipzy_rating: 4.3 },
    ]
  },
  'rest_002': {
    id: 'rest_002',
    name: 'Craft Cocktails & Co',
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800',
    area: 'Indiranagar',
    distance: 3.2,
    cuisine: ['Bar', 'Lounge', 'Cocktails'],
    phone: '+91 9876543211',
    lat: 12.9784,
    lon: 77.6408,
    beverages: [
      { id: 'bev_005', name: 'Negroni', type: 'cocktail', base_drink: 'Gin', price: 600, image: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?w=400', alcoholic: true, sipzy_rating: 4.4 },
      { id: 'bev_006', name: 'Margarita', type: 'cocktail', base_drink: 'Tequila', price: 550, image: 'https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=400', alcoholic: true, sipzy_rating: 4.1 },
    ]
  },
  'rest_003': {
    id: 'rest_003',
    name: 'Wine Republic',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800',
    area: 'HSR Layout',
    distance: 4.1,
    cuisine: ['Wine Bar', 'Italian', 'European'],
    phone: '+91 9876543212',
    lat: 12.9116,
    lon: 77.6389,
    beverages: [
      { id: 'bev_007', name: 'Cabernet Sauvignon', type: 'wine', base_drink: 'Red Wine', price: 750, image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400', alcoholic: true, sipzy_rating: 4.6 },
      { id: 'bev_008', name: 'Chardonnay', type: 'wine', base_drink: 'White Wine', price: 700, image: 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=400', alcoholic: true, sipzy_rating: 4.3 },
    ]
  }
};

export default function ExpertRestaurantDetail({ expert }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [beverages, setBeverages] = useState([]);
  const [alcoholicOnly, setAlcoholicOnly] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/restaurants/${id}`);
    // const data = await response.json();
    
    const data = PLACEHOLDER_RESTAURANTS[id] || PLACEHOLDER_RESTAURANTS['rest_001'];
    setRestaurant(data);
    setBeverages(data.beverages || []);
    setLoading(false);
  };

  const filteredBeverages = beverages.filter(b => b.alcoholic === alcoholicOnly);

  const openMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${restaurant.lat},${restaurant.lon}`;
    window.open(url, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:${restaurant.phone}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-8">
      {/* Header Image */}
      <div className="relative h-64">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full glass-strong flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          
          {/* Expert Mode Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span className="text-white font-medium text-xs">Expert Mode</span>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-white text-2xl font-bold mb-1">{restaurant.name}</h1>
          <p className="text-white/80 text-sm mb-1">{restaurant.cuisine?.join(' • ')}</p>
          <div className="flex items-center gap-3 text-white/60 text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {restaurant.area}
            </span>
            <span>•</span>
            <span>{restaurant.distance} km</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 flex gap-3">
        <Button
          onClick={handleCall}
          variant="outline"
          className="flex-1 glass border-white/20 text-white h-10"
        >
          <Phone className="w-4 h-4 mr-2" />
          Call
        </Button>
        <Button
          onClick={openMaps}
          variant="outline"
          className="flex-1 glass border-white/20 text-white h-10"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Directions
        </Button>
      </div>

      {/* Toggle */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 glass rounded-full px-4 py-2 w-fit">
          <button
            onClick={() => setAlcoholicOnly(true)}
            className={`relative w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
              alcoholicOnly ? 'border-amber-500 bg-amber-500' : 'border-white/40'
            }`}
          >
            <Wine className={`w-4 h-4 ${alcoholicOnly ? 'text-black' : 'text-white/60'}`} />
          </button>
          <span className="text-white text-sm">|</span>
          <button
            onClick={() => setAlcoholicOnly(false)}
            className={`relative w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
              !alcoholicOnly ? 'border-purple-500 bg-purple-500' : 'border-white/40'
            }`}
          >
            <Coffee className={`w-4 h-4 ${!alcoholicOnly ? 'text-white' : 'text-white/60'}`} />
          </button>
          <span className="text-white/60 text-sm ml-2">
            {alcoholicOnly ? 'Alcoholic' : 'Non-Alcoholic'} ({filteredBeverages.length})
          </span>
        </div>
      </div>

      {/* Beverages Grid */}
      <div className="px-4">
        <h2 className="text-white text-lg font-bold mb-4">Select Beverage to Rate</h2>
        
        {filteredBeverages.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredBeverages.map((bev) => (
              <div
                key={bev.id}
                onClick={() => navigate(`/expert/beverage/${bev.id}/rate?restaurant=${id}`)}
                className="glass rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="relative h-28">
                  <img src={bev.image} alt={bev.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-3">
                  <h3 className="text-white font-medium text-sm mb-1">{bev.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs capitalize">{bev.type}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span className="text-amber-500 text-xs font-semibold">{bev.sipzy_rating || 0}</span>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mt-1">₹{bev.price}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl p-8 text-center">
            <Wine className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/60">No {alcoholicOnly ? 'alcoholic' : 'non-alcoholic'} beverages available</p>
          </div>
        )}
      </div>
    </div>
  );
}
