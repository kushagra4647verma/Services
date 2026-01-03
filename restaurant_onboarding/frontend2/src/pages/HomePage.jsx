import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Search, Mic, Filter, ArrowUpDown, Bookmark, Share2, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BottomNav from '@/components/BottomNav';
import ShareModal from '@/components/ShareModal';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HomePage({ user }) {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [trendingRestaurants, setTrendingRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [selectedBaseDrinks, setSelectedBaseDrinks] = useState([]);
  const [ratingRange, setRatingRange] = useState([0]);
  const [distanceRange, setDistanceRange] = useState([10]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [costRange, setCostRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState('rating');
  
  // Share modal
  const [shareItem, setShareItem] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const cuisines = ['Indian', 'Continental', 'Asian', 'Mediterranean', 'Italian', 'Chinese'];
  const baseDrinks = ['Whisky', 'Rum', 'Vodka', 'Gin', 'Beer', 'Wine', 'Water', 'Soda', 'Milk', 'Juice'];
  const restaurantTypes = ['Fine Dining', 'Casual', 'Romantic', 'Gastropub', 'Brewery'];

  // Reset filters on first load
  useEffect(() => {
    setSearchQuery('');
    setSelectedCuisines([]);
    setSelectedBaseDrinks([]);
    setRatingRange([0]);
    setDistanceRange([10]);
    setSelectedTypes([]);
    setCostRange([0, 5000]);
    setSortBy('rating');
  }, []);

  useEffect(() => {
    fetchRestaurants();
    fetchBookmarks();
  }, [searchQuery, selectedCuisines, selectedBaseDrinks, ratingRange, distanceRange, selectedTypes, costRange, sortBy]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCuisines.length > 0) params.append('cuisine', selectedCuisines[0]);
      if (ratingRange[0] > 0) params.append('min_rating', ratingRange[0]);
      if (distanceRange[0] < 10) params.append('max_distance', distanceRange[0]);
      if (selectedTypes.length > 0) params.append('restaurant_type', selectedTypes[0]);
      if (costRange[0] > 0) params.append('min_cost', costRange[0]);
      if (costRange[1] < 5000) params.append('max_cost', costRange[1]);
      params.append('sort_by', sortBy);

      const response = await axios.get(`${API}/restaurants?${params}`);
      setRestaurants(response.data);

      // Fetch featured and trending only if no search
      if (!searchQuery) {
        const featuredRes = await axios.get(`${API}/restaurants/featured`);
        setFeaturedRestaurants(featuredRes.data);
        
        const trendingRes = await axios.get(`${API}/restaurants/trending`);
        setTrendingRestaurants(trendingRes.data);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const response = await axios.get(`${API}/bookmarks/${user.id}`);
      setBookmarkedIds(response.data.map(r => r.id));
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const handleBookmark = async (e, restaurantId) => {
    e.stopPropagation();
    try {
      const response = await axios.post(`${API}/bookmarks`, {
        user_id: user.id,
        restaurant_id: restaurantId
      });
      
      if (response.data.bookmarked) {
        setBookmarkedIds([...bookmarkedIds, restaurantId]);
        toast.success('Bookmarked!');
      } else {
        setBookmarkedIds(bookmarkedIds.filter(id => id !== restaurantId));
        toast.success('Bookmark removed');
      }
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleShare = (e, restaurant) => {
    e.stopPropagation();
    setShareItem({
      title: restaurant.name,
      description: `${restaurant.top_beverage || 'Amazing beverages'} • ${restaurant.area}`,
      url: `${window.location.origin}/restaurant/${restaurant.id}`
    });
    setShowShareModal(true);
  };

  const clearFilters = () => {
    setSelectedCuisines([]);
    setSelectedBaseDrinks([]);
    setRatingRange([0]);
    setDistanceRange([10]);
    setSelectedTypes([]);
    setCostRange([0, 5000]);
    setSortBy('rating');
  };

  const hasActiveFilters = selectedCuisines.length > 0 || selectedBaseDrinks.length > 0 || 
    ratingRange[0] > 0 || distanceRange[0] < 10 || selectedTypes.length > 0 || 
    costRange[0] > 0 || costRange[1] < 5000;

  const RestaurantCard = ({ restaurant }) => (
    <div
      data-testid={`restaurant-card-${restaurant.id}`}
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
      className="glass rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-200 min-w-[280px] flex-shrink-0"
    >
      <div className="relative h-48">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            data-testid={`bookmark-button-${restaurant.id}`}
            onClick={(e) => handleBookmark(e, restaurant.id)}
            className="w-8 h-8 rounded-full glass-strong flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Bookmark
              className={`w-4 h-4 ${bookmarkedIds.includes(restaurant.id) ? 'fill-amber-500 text-amber-500' : 'text-white'}`}
            />
          </button>
          <button
            data-testid={`share-button-${restaurant.id}`}
            onClick={(e) => handleShare(e, restaurant)}
            className="w-8 h-8 rounded-full glass-strong flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Share2 className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Restaurant info */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-semibold text-lg mb-1">{restaurant.name}</h3>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <MapPin className="w-3 h-3" />
            <span>{restaurant.area}</span>
            <span>•</span>
            <span>{restaurant.distance} km</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="text-amber-500 font-semibold text-sm">{restaurant.sipzy_rating || 0}</span>
            </div>
            <span className="text-white/60 text-xs">SipZy Rating</span>
          </div>
          <span className="text-white/80 text-sm">₹{restaurant.cost_for_two} for 2</span>
        </div>
        
        {restaurant.top_beverage && (
          <p className="text-white/60 text-xs">
            Top: <span className="text-amber-500">{restaurant.top_beverage}</span>
          </p>
        )}
        
        <div className="flex flex-wrap gap-1">
          {restaurant.cuisine.slice(0, 2).map((c) => (
            <span key={c} className="text-xs px-2 py-1 glass rounded-full text-white/80">{c}</span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-strong border-b border-white/10 backdrop-blur-xl">
        <div className="p-4 space-y-4">
          {/* Location & Expert Corner */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              <span className="text-white font-medium">Bangalore</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              Expert Corner
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              data-testid="search-input"
              placeholder="Search restaurants, cuisines, areas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass border-white/20 text-white placeholder:text-white/40 pl-10 pr-12 h-12 rounded-xl"
            />
            <Mic className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500 cursor-pointer" />
          </div>

          {/* Filter & Sort */}
          <div className="flex gap-3">
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button
                  data-testid="filter-button"
                  variant="outline"
                  className="flex-1 glass border-white/20 text-white hover:border-amber-500 h-10"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-2 w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="bg-[#0a0a0a] border-white/10 max-h-[80vh] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-white">Filters</SheetTitle>
                </SheetHeader>
                
                <div className="space-y-6 mt-6">
                  {/* Cuisine */}
                  <div>
                    <label className="text-sm text-white/80 mb-3 block">Cuisine</label>
                    <div className="flex flex-wrap gap-2">
                      {cuisines.map((cuisine) => (
                        <button
                          key={cuisine}
                          onClick={() => {
                            if (selectedCuisines.includes(cuisine)) {
                              setSelectedCuisines(selectedCuisines.filter(c => c !== cuisine));
                            } else {
                              setSelectedCuisines([...selectedCuisines, cuisine]);
                            }
                          }}
                          className={`px-4 py-2 rounded-full text-sm ${
                            selectedCuisines.includes(cuisine)
                              ? 'gradient-amber text-black'
                              : 'glass border-white/20 text-white'
                          }`}
                        >
                          {cuisine}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Base Drink */}
                  <div>
                    <label className="text-sm text-white/80 mb-3 block">Base Drink</label>
                    <div className="flex flex-wrap gap-2">
                      {baseDrinks.map((drink) => (
                        <button
                          key={drink}
                          onClick={() => {
                            if (selectedBaseDrinks.includes(drink)) {
                              setSelectedBaseDrinks(selectedBaseDrinks.filter(d => d !== drink));
                            } else {
                              setSelectedBaseDrinks([...selectedBaseDrinks, drink]);
                            }
                          }}
                          className={`px-4 py-2 rounded-full text-sm ${
                            selectedBaseDrinks.includes(drink)
                              ? 'gradient-purple text-white'
                              : 'glass border-white/20 text-white'
                          }`}
                        >
                          {drink}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SipZy Rating */}
                  <div>
                    <label className="text-sm text-white/80 mb-3 block">
                      SipZy Rating: {ratingRange[0]}+ stars
                    </label>
                    <Slider
                      value={ratingRange}
                      onValueChange={setRatingRange}
                      min={0}
                      max={5}
                      step={0.5}
                      className="py-4"
                    />
                  </div>

                  {/* Distance */}
                  <div>
                    <label className="text-sm text-white/80 mb-3 block">
                      Distance: Up to {distanceRange[0]} km
                    </label>
                    <Slider
                      value={distanceRange}
                      onValueChange={setDistanceRange}
                      min={0}
                      max={10}
                      step={0.5}
                      className="py-4"
                    />
                  </div>

                  {/* Restaurant Type */}
                  <div>
                    <label className="text-sm text-white/80 mb-3 block">Restaurant Type</label>
                    <div className="flex flex-wrap gap-2">
                      {restaurantTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            if (selectedTypes.includes(type)) {
                              setSelectedTypes(selectedTypes.filter(t => t !== type));
                            } else {
                              setSelectedTypes([...selectedTypes, type]);
                            }
                          }}
                          className={`px-4 py-2 rounded-full text-sm ${
                            selectedTypes.includes(type)
                              ? 'gradient-purple text-white'
                              : 'glass border-white/20 text-white'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cost for Two */}
                  <div>
                    <label className="text-sm text-white/80 mb-3 block">
                      Cost for Two: ₹{costRange[0]} - ₹{costRange[1]}
                    </label>
                    <Slider
                      value={costRange}
                      onValueChange={setCostRange}
                      min={0}
                      max={5000}
                      step={100}
                      className="py-4"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="flex-1 glass border-white/20 text-white"
                    >
                      Clear All
                    </Button>
                    <Button
                      onClick={() => setShowFilters(false)}
                      className="flex-1 gradient-amber text-black"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger
                data-testid="sort-button"
                className="flex-1 glass border-white/20 text-white h-10"
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a] border-white/10">
                <SelectItem value="rating">Highest Rating</SelectItem>
                <SelectItem value="distance">Nearest First</SelectItem>
                <SelectItem value="cost_low">Cost Low to High</SelectItem>
                <SelectItem value="cost_high">Cost High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Show featured/trending only when not searching */}
        {!searchQuery && !hasActiveFilters && (
          <>
            {/* Featured Spots */}
            {featuredRestaurants.length > 0 && (
              <div>
                <h2 className="text-white text-xl font-bold mb-4">Featured Spots</h2>
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                  {featuredRestaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </div>
              </div>
            )}

            {/* Trending Restaurants */}
            {trendingRestaurants.length > 0 && (
              <div>
                <h2 className="text-white text-xl font-bold mb-4">Trending Restaurants</h2>
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                  {trendingRestaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* All Restaurants / Search Results */}
        <div>
          <h2 className="text-white text-xl font-bold mb-4">
            {searchQuery || hasActiveFilters ? `Results (${restaurants.length})` : 'Nearby Restaurants'}
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-white text-lg mb-2">No restaurants found</h3>
              <p className="text-white/60 text-sm mb-4">
                {searchQuery ? 'Try different search terms' : 'Try adjusting your filters'}
              </p>
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="glass border-white/20 text-white"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNav active="sipzy" />
      
      {showShareModal && (
        <ShareModal
          item={shareItem}
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
