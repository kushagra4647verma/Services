import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Bookmark, Phone, MapPin, Share2, Search, Star, Camera, Users, Wine, Coffee, ArrowUpDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import ShareModal from '@/components/ShareModal';
import InviteFriendsModal from '@/components/InviteFriendsModal';
import GroupMixMagic from '@/components/GroupMixMagic';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function RestaurantDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [beverages, setBeverages] = useState([]);
  const [filteredBeverages, setFilteredBeverages] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alcoholicOnly, setAlcoholicOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [shareItem, setShareItem] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showGroupMix, setShowGroupMix] = useState(false);
  const [menuTab, setMenuTab] = useState('beverages'); // beverages or food

  useEffect(() => {
    // Reset filters when navigating to this page
    setAlcoholicOnly(true);
    setSearchQuery('');
    setSortBy('recommended');
    setMenuTab('beverages');
    
    fetchRestaurant();
    checkBookmark();
  }, [id]);

  useEffect(() => {
    filterAndSortBeverages();
  }, [beverages, alcoholicOnly, searchQuery, sortBy]);

  const fetchRestaurant = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/restaurants/${id}`);
      setRestaurant(response.data);
      setBeverages(response.data.beverages || []);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast.error('Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const checkBookmark = async () => {
    try {
      const response = await axios.get(`${API}/bookmarks/check/${user.id}/${id}`);
      setIsBookmarked(response.data.bookmarked);
    } catch (error) {
      console.error('Error checking bookmark:', error);
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await axios.post(`${API}/bookmarks`, {
        user_id: user.id,
        restaurant_id: id
      });
      setIsBookmarked(response.data.bookmarked);
      toast.success(response.data.bookmarked ? 'Bookmarked!' : 'Bookmark removed');
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  const filterAndSortBeverages = () => {
    let filtered = beverages.filter(b => b.alcoholic === alcoholicOnly);
    
    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'price_low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      filtered.sort((a, b) => b.price - a.price);
    } else {
      filtered.sort((a, b) => (b.sipzy_rating || 0) - (a.sipzy_rating || 0));
    }

    setFilteredBeverages(filtered);
  }

  const openMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${restaurant.lat},${restaurant.lon}`;
    window.open(url, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:${restaurant.phone}`;
  };

  const handleShare = (beverage) => {
    setShareItem({
      title: beverage.name,
      description: `${beverage.type} • ₹${beverage.price} • ${restaurant.name}`,
      url: `${window.location.origin}/beverage/${beverage.id}`
    });
    setShowShareModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  if (!restaurant) return null;

  const topRatedBeverages = [...beverages]
    .filter(b => b.alcoholic === alcoholicOnly)
    .sort((a, b) => (b.sipzy_rating || 0) - (a.sipzy_rating || 0))
    .slice(0, 5);

  const customerFavorites = [...beverages]
    .filter(b => b.alcoholic === alcoholicOnly)
    .sort((a, b) => (b.customer_rating || 0) - (a.customer_rating || 0))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header Image */}
      <div className="relative h-80">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            data-testid="back-button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full glass-strong flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex gap-2">
            <button
              data-testid="bookmark-button"
              onClick={handleBookmark}
              className="w-10 h-10 rounded-full glass-strong flex items-center justify-center"
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : 'text-white'}`} />
            </button>
            <button
              data-testid="invite-button"
              onClick={() => setShowInviteModal(true)}
              className="w-10 h-10 rounded-full glass-strong flex items-center justify-center"
            >
              <Users className="w-5 h-5 text-white" />
            </button>
            <button
              data-testid="call-button"
              onClick={handleCall}
              className="w-10 h-10 rounded-full glass-strong flex items-center justify-center"
            >
              <Phone className="w-5 h-5 text-white" />
            </button>
            <button
              data-testid="map-button"
              onClick={openMaps}
              className="w-10 h-10 rounded-full glass-strong flex items-center justify-center"
            >
              <MapPin className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="absolute bottom-6 left-4 right-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-white text-3xl font-bold mb-2">{restaurant.name}</h1>
              <p className="text-white/80 text-sm mb-1">{restaurant.cuisine.join(' • ')}</p>
              <div className="flex items-center gap-3 text-white/60 text-sm">
                <span>{restaurant.area}</span>
                <span>•</span>
                <span>{restaurant.distance} km</span>
                <span>•</span>
                <span>₹{restaurant.cost_for_two} for 2</span>
              </div>
            </div>
            
            {/* Surprise Me Button */}
            <button
              onClick={() => setShowGroupMix(true)}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105 shadow-lg shadow-purple-500/50"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-white text-xs font-semibold">Surprise Me</span>
            </button>
          </div>
        </div>
      </div>

      {/* Swiggy-style Toggle with Search & Sort */}
      <div className="sticky top-0 z-40 glass-strong border-b border-white/10 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-3 max-w-6xl mx-auto">
          {/* Swiggy-style Veg/Non-Veg Toggle */}
          <div className="flex items-center gap-2 glass rounded-full px-3 py-2">
            <button
              data-testid="alcoholic-button"
              onClick={() => setAlcoholicOnly(true)}
              className={`relative w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                alcoholicOnly ? 'border-amber-500 bg-amber-500' : 'border-white/40'
              }`}
            >
              <Wine className={`w-3 h-3 ${alcoholicOnly ? 'text-black' : 'text-white/60'}`} />
            </button>
            <span className="text-white text-sm font-medium">|</span>
            <button
              data-testid="non-alcoholic-button"
              onClick={() => setAlcoholicOnly(false)}
              className={`relative w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                !alcoholicOnly ? 'border-purple-500 bg-purple-500' : 'border-white/40'
              }`}
            >
              <Coffee className={`w-3 h-3 ${!alcoholicOnly ? 'text-white' : 'text-white/60'}`} />
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              data-testid="beverage-search-input"
              placeholder="Search beverages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass border-white/20 text-white placeholder:text-white/40 pl-10 pr-3 h-9 rounded-lg text-sm"
            />
          </div>

          {/* Sort Button */}
          <Button
            data-testid="sort-beverages-button"
            onClick={() => setShowSort(true)}
            variant="outline"
            className="glass border-white/20 text-white h-9 px-3 rounded-lg flex items-center gap-2"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Sort</span>
          </Button>
        </div>

        {(searchQuery || sortBy !== 'recommended') && (
          <div className="flex items-center justify-between text-sm mt-3 max-w-6xl mx-auto">
            <span className="text-white/60">Showing {filteredBeverages.length} beverages</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSortBy('recommended');
              }}
              className="text-amber-500 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Show sections only when not searching */}
        {!searchQuery && (
          <>
            {/* Top Rated */}
            {topRatedBeverages.length > 0 && (
              <div>
                <h2 className="text-white text-xl font-bold mb-4">Top SipZy-rated Beverages</h2>
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                  {topRatedBeverages.map((bev) => (
                    <div
                      key={bev.id}
                      onClick={() => navigate(`/beverage/${bev.id}`)}
                      className="glass rounded-xl overflow-hidden cursor-pointer min-w-[200px] flex-shrink-0 hover:scale-105 transition-transform"
                    >
                      <img src={bev.image} alt={bev.name} className="w-full h-32 object-cover" />
                      <div className="p-3">
                        <h3 className="text-white font-medium text-sm mb-1">{bev.name}</h3>
                        <span className="inline-block text-xs px-2 py-0.5 glass rounded-full text-white/60 mb-2 capitalize">{bev.type}</span>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span className="text-amber-500 text-xs font-semibold">{bev.sipzy_rating || 0}</span>
                        </div>
                        <p className="text-white/80 text-xs">₹{bev.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Favorites */}
            {customerFavorites.length > 0 && (
              <div>
                <h2 className="text-white text-xl font-bold mb-4">Customer-favorite Beverages</h2>
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                  {customerFavorites.map((bev) => (
                    <div
                      key={bev.id}
                      onClick={() => navigate(`/beverage/${bev.id}`)}
                      className="glass rounded-xl overflow-hidden cursor-pointer min-w-[200px] flex-shrink-0 hover:scale-105 transition-transform"
                    >
                      <img src={bev.image} alt={bev.name} className="w-full h-32 object-cover" />
                      <div className="p-3">
                        <h3 className="text-white font-medium text-sm mb-1">{bev.name}</h3>
                        <span className="inline-block text-xs px-2 py-0.5 glass rounded-full text-white/60 mb-2 capitalize">{bev.type}</span>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-3 h-3 fill-purple-500 text-purple-500" />
                          <span className="text-purple-500 text-xs font-semibold">{bev.customer_rating || 0}</span>
                          <span className="text-white/40 text-xs">({bev.customer_rating_count || 0})</span>
                        </div>
                        <p className="text-white/80 text-xs">₹{bev.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {restaurant.amenities && restaurant.amenities.length > 0 && (
              <div>
                <h2 className="text-white text-xl font-bold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-3">
                  {restaurant.amenities.map((amenity) => (
                    <div key={amenity} className="glass rounded-lg p-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-white/80 text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Menu Tabs */}
        <div>
          <div className="flex items-center gap-2 mb-4 border-b border-white/10">
            <button
              onClick={() => setMenuTab('beverages')}
              className={`pb-3 px-4 text-sm font-semibold transition-all relative ${
                menuTab === 'beverages' ? 'text-amber-500' : 'text-white/60'
              }`}
            >
              Detailed Beverage Menu
              {menuTab === 'beverages' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
              )}
            </button>
            <button
              onClick={() => setMenuTab('food')}
              className={`pb-3 px-4 text-sm font-semibold transition-all relative ${
                menuTab === 'food' ? 'text-amber-500' : 'text-white/60'
              }`}
            >
              Food Menu Photo
              {menuTab === 'food' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
              )}
            </button>
          </div>

          {menuTab === 'beverages' && filteredBeverages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredBeverages.map((bev) => (
                <div
                  key={bev.id}
                  data-testid={`beverage-card-${bev.id}`}
                  onClick={() => navigate(`/beverage/${bev.id}`)}
                  className="glass rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="relative h-32">
                    <img src={bev.image} alt={bev.name} className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShare(bev); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full glass-strong flex items-center justify-center"
                    >
                      <Share2 className="w-3 h-3 text-white" />
                    </button>
                    <button className="absolute top-2 left-2 w-7 h-7 rounded-full glass-strong flex items-center justify-center">
                      <Camera className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <div className="p-3 space-y-2">
                    <div>
                      <h3 className="text-white font-medium text-sm mb-1">{bev.name}</h3>
                      <span className="text-xs px-2 py-0.5 glass rounded-full text-white/60">{bev.type}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/60">SipZy</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span className="text-amber-500 font-semibold">{bev.sipzy_rating || 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/60">Customer</span>
                        <div className="flex items-center gap-1 cursor-pointer hover:opacity-80">
                          <Star className="w-3 h-3 fill-purple-500 text-purple-500" />
                          <span className="text-purple-500 font-semibold">{bev.customer_rating || 0}</span>
                          <span className="text-white/40">({bev.customer_rating_count || 0})</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/60">Expert</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-green-500 text-green-500" />
                          <span className="text-green-500 font-semibold">{bev.expert_rating || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-white/80 text-sm font-medium">₹{bev.price}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : menuTab === 'beverages' ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-white text-lg mb-2">No beverages found</h3>
              <p className="text-white/60 text-sm mb-4">Try different search terms</p>
              <Button
                onClick={() => setSearchQuery('')}
                variant="outline"
                className="glass border-white/20 text-white"
              >
                Clear search
              </Button>
            </div>
          ) : null}

          {/* Food Menu Photo Tab */}
          {menuTab === 'food' && (
            <div className="space-y-4">
              {restaurant.photos && restaurant.photos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {restaurant.photos.map((photo, index) => (
                    <div key={index} className="glass rounded-2xl overflow-hidden">
                      <img 
                        src={photo} 
                        alt={`${restaurant.name} menu ${index + 1}`} 
                        className="w-full h-auto object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(photo, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 glass rounded-2xl">
                  <Camera className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-white text-lg mb-2">No menu photos available</h3>
                  <p className="text-white/60 text-sm">Check back later for food menu photos</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sort Sheet */}
      <Sheet open={showSort} onOpenChange={setShowSort}>
        <SheetContent side="bottom" className="bg-[#0a0a0a] border-white/10">
          <SheetHeader>
            <SheetTitle className="text-white">Sort By</SheetTitle>
          </SheetHeader>
          <div className="space-y-2 mt-6">
            {[
              { value: 'recommended', label: 'Recommended', icon: '⭐' },
              { value: 'price_low', label: 'Price: Low to High', icon: '↑' },
              { value: 'price_high', label: 'Price: High to Low', icon: '↓' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSortBy(option.value);
                  setShowSort(false);
                }}
                className={`w-full p-4 rounded-xl flex items-center gap-3 ${
                  sortBy === option.value ? 'glass-strong' : 'glass'
                }`}
              >
                <span className="text-2xl">{option.icon}</span>
                <span className={`flex-1 text-left ${
                  sortBy === option.value ? 'text-amber-500' : 'text-white'
                }`}>
                  {option.label}
                </span>
                {sortBy === option.value && (
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {showShareModal && (
        <ShareModal
          item={shareItem}
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}

      <InviteFriendsModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        user={user}
        restaurant={restaurant}
      />

      <GroupMixMagic
        open={showGroupMix}
        onClose={() => setShowGroupMix(false)}
        restaurant={restaurant}
        beverages={beverages}
      />
    </div>
  );
}
