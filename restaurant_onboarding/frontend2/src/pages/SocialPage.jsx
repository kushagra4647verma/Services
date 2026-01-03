import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Star, Users as UsersIcon, Award, Bookmark, LogOut, Plus, Edit, Trash2, Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SocialPage({ user, setUser }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ ratings_count: 0, friends_count: 0, bookmarks_count: 0 });
  const [ratings, setRatings] = useState([]);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [badges, setBadges] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  // Diary modal states
  const [showAddDiary, setShowAddDiary] = useState(false);
  const [showViewDiary, setShowViewDiary] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState(null);
  const [diaryForm, setDiaryForm] = useState({
    beverage_name: '',
    restaurant: '',
    rating: 0,
    notes: '',
    photo: '',
    share_to_feed: false
  });

  // Badge filter
  const [badgeFilter, setBadgeFilter] = useState('all'); // all, earned, in_progress

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, ratingsRes, diaryRes, badgesRes, bookmarksRes, friendsRes] = await Promise.all([
        axios.get(`${API}/users/${user.id}/stats`),
        axios.get(`${API}/users/${user.id}/ratings`),
        axios.get(`${API}/diary/${user.id}`),
        axios.get(`${API}/users/${user.id}/badges`),
        axios.get(`${API}/bookmarks/${user.id}`),
        axios.get(`${API}/friends/${user.id}`)
      ]);

      setStats(statsRes.data);
      setRatings(ratingsRes.data);
      setDiaryEntries(diaryRes.data);
      setBadges(badgesRes.data);
      setBookmarks(bookmarksRes.data);
      setFriends(friendsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDiary = async () => {
    if (!diaryForm.beverage_name || !diaryForm.restaurant || diaryForm.rating === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await axios.post(`${API}/diary/add`, {
        user_id: user.id,
        ...diaryForm
      });
      toast.success('Diary entry added!');
      setShowAddDiary(false);
      setDiaryForm({
        beverage_name: '',
        restaurant: '',
        rating: 0,
        notes: '',
        photo: '',
        share_to_feed: false
      });
      fetchAllData();
    } catch (error) {
      toast.error('Failed to add diary entry');
    }
  };

  const handleUpdateDiary = async () => {
    try {
      await axios.put(`${API}/diary/entry/${selectedDiary.id}`, diaryForm);
      toast.success('Diary entry updated!');
      setShowViewDiary(false);
      fetchAllData();
    } catch (error) {
      toast.error('Failed to update diary entry');
    }
  };

  const handleDeleteDiary = async () => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      await axios.delete(`${API}/diary/entry/${selectedDiary.id}`);
      toast.success('Diary entry deleted');
      setShowViewDiary(false);
      fetchAllData();
    } catch (error) {
      toast.error('Failed to delete diary entry');
    }
  };

  const handleDiaryPhotoUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/diary/upload-photo`, formData);
      setDiaryForm({ ...diaryForm, photo: response.data.photo_url });
      toast.success('Photo uploaded!');
    } catch (error) {
      toast.error('Failed to upload photo');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sipzy_user');
    setUser(null);
    navigate('/auth');
  };

  const filteredBadges = badges.filter(badge => {
    if (badgeFilter === 'earned') return badge.earned;
    if (badgeFilter === 'in_progress') return !badge.earned;
    return true;
  });

  const badgesByTier = {
    1: filteredBadges.filter(b => b.tier === 1),
    2: filteredBadges.filter(b => b.tier === 2),
    3: filteredBadges.filter(b => b.tier === 3)
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      {/* Profile Header */}
      <div className="glass-strong border-b border-white/10 p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full gradient-amber flex items-center justify-center text-white text-3xl font-bold">
              {user.name[0]}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 border-4 border-[#0a0a0a]" />
          </div>
          
          <div>
            <h1 className="text-white text-2xl font-bold">{user.name}</h1>
            <p className="text-white/60 text-sm">@{user.name.toLowerCase().replace(' ', '')}</p>
          </div>

          <Button
            variant="outline"
            className="glass border-white/20 text-white h-9 rounded-lg text-sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="glass rounded-xl p-4 text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full gradient-amber mx-auto mb-2">
              <Star className="w-5 h-5 text-black" />
            </div>
            <p className="text-white text-2xl font-bold">{stats.ratings_count}</p>
            <p className="text-white/60 text-xs">Ratings</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full gradient-purple mx-auto mb-2">
              <UsersIcon className="w-5 h-5 text-white" />
            </div>
            <p className="text-white text-2xl font-bold">{stats.friends_count}</p>
            <p className="text-white/60 text-xs">Friends</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 mx-auto mb-2">
              <Award className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-white text-2xl font-bold">{badges.filter(b => b.earned).length}</p>
            <p className="text-white/60 text-xs">Badges</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ratings" className="p-4">
        <TabsList className="glass w-full h-auto p-1 grid grid-cols-5 gap-1">
          <TabsTrigger
            value="ratings"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-xs py-2"
          >
            Ratings
          </TabsTrigger>
          <TabsTrigger
            value="diary"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-xs py-2"
          >
            Diary
          </TabsTrigger>
          <TabsTrigger
            value="badges"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-xs py-2"
          >
            Badges
          </TabsTrigger>
          <TabsTrigger
            value="saves"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-xs py-2"
          >
            Saves
          </TabsTrigger>
          <TabsTrigger
            value="friends"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-xs py-2"
          >
            Friends
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Ratings */}
        <TabsContent value="ratings" className="space-y-3 mt-4">
          {ratings.length > 0 ? (
            ratings.map((rating) => (
              <div
                key={rating.id}
                onClick={() => rating.beverage && navigate(`/beverage/${rating.beverage.id}`)}
                className="glass rounded-xl p-4 cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="flex gap-3">
                  {rating.beverage && (
                    <img
                      src={rating.beverage.image}
                      alt={rating.beverage.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{rating.beverage?.name || 'Unknown'}</h3>
                    <div className="flex items-center gap-2 my-1">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= rating.rating ? 'fill-amber-500 text-amber-500' : 'text-white/20'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-amber-500 text-sm font-semibold">{rating.rating}</span>
                    </div>
                    {rating.review && (
                      <p className="text-white/80 text-sm">{rating.review}</p>
                    )}
                    <p className="text-white/40 text-xs mt-1">
                      {new Date(rating.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No ratings yet. Start rating beverages!</p>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Drink Diary */}
        <TabsContent value="diary" className="space-y-3 mt-4">
          <Button
            data-testid="add-diary-button"
            onClick={() => setShowAddDiary(true)}
            className="w-full gradient-amber text-black font-semibold h-12 rounded-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Entry
          </Button>

          {diaryEntries.length > 0 ? (
            diaryEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => {
                  setSelectedDiary(entry);
                  setDiaryForm(entry);
                  setShowViewDiary(true);
                }}
                className="glass rounded-xl p-4 cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="flex gap-3">
                  {entry.photo && (
                    <img src={entry.photo} alt={entry.beverage_name} className="w-16 h-16 rounded-lg object-cover" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{entry.beverage_name}</h3>
                    <p className="text-white/60 text-sm">{entry.restaurant}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= entry.rating ? 'fill-amber-500 text-amber-500' : 'text-white/20'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-white/40 text-xs">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No diary entries yet. Start documenting your beverage journey!</p>
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Badges */}
        <TabsContent value="badges" className="space-y-4 mt-4">
          <div className="flex gap-2">
            {['all', 'earned', 'in_progress'].map((filter) => (
              <button
                key={filter}
                onClick={() => setBadgeFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm capitalize ${
                  badgeFilter === filter
                    ? 'gradient-amber text-black'
                    : 'glass border-white/20 text-white'
                }`}
              >
                {filter.replace('_', ' ')}
              </button>
            ))}
          </div>

          {[1, 2, 3].map((tier) => (
            badgesByTier[tier].length > 0 && (
              <div key={tier}>
                <div className={`flex items-center gap-3 mb-4 px-4 py-2 rounded-xl ${
                  tier === 1 ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30' :
                  tier === 2 ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30' :
                  'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30'
                }`}>
                  <span className={`text-3xl ${
                    tier === 1 ? 'text-amber-500' :
                    tier === 2 ? 'text-purple-500' :
                    'text-emerald-500'
                  }`}>
                    {tier === 1 ? '🌟' : tier === 2 ? '💎' : '👑'}
                  </span>
                  <div>
                    <h3 className={`font-bold text-lg ${
                      tier === 1 ? 'text-amber-500' :
                      tier === 2 ? 'text-purple-500' :
                      'text-emerald-500'
                    }`}>
                      Tier {tier}
                    </h3>
                    <p className="text-white/70 text-xs">
                      {tier === 1 ? 'Newbie' : tier === 2 ? 'SipZeR' : 'Alpha Z'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {badgesByTier[tier].map((badge) => (
                    <div
                      key={badge.name}
                      className={`relative rounded-2xl p-4 transition-all duration-300 ${
                        badge.earned 
                          ? 'bg-gradient-to-br from-amber-500/20 via-purple-500/20 to-emerald-500/20 border-2 border-amber-500/50 shadow-lg shadow-amber-500/20 hover:scale-105' 
                          : 'glass border border-white/10 opacity-60'
                      }`}
                    >
                      {badge.earned && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
                          <span className="text-xs">✓</span>
                        </div>
                      )}
                      <div className={`text-5xl mb-3 ${!badge.earned && 'grayscale'}`}>{badge.icon}</div>
                      <h4 className={`font-semibold text-sm mb-1 ${badge.earned ? 'text-white' : 'text-white/60'}`}>
                        {badge.name}
                      </h4>
                      {badge.earned ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-400 text-xs rounded-full font-semibold border border-green-500/50">
                            <span className="text-xs">🎉</span> Unlocked!
                          </span>
                        </div>
                      ) : (
                        <div className="mt-2 space-y-1">
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-500 to-purple-500 rounded-full transition-all duration-500"
                              style={{ width: `${(badge.progress / badge.target) * 100}%` }}
                            />
                          </div>
                          <p className="text-white/70 text-xs font-medium">
                            {badge.progress}/{badge.target} completed
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </TabsContent>

        {/* Tab 4: Saves */}
        <TabsContent value="saves" className="space-y-3 mt-4">
          {bookmarks.length > 0 ? (
            bookmarks.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                className="glass rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              >
                <div className="flex gap-3">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-24 h-24 object-cover"
                  />
                  <div className="flex-1 p-3">
                    <h3 className="text-white font-medium mb-1">{restaurant.name}</h3>
                    <p className="text-white/60 text-sm mb-2">{restaurant.area}</p>
                    <div className="flex flex-wrap gap-1">
                      {restaurant.cuisine.slice(0, 2).map((c) => (
                        <span key={c} className="text-xs px-2 py-0.5 glass rounded-full text-white/60">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Bookmark className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No bookmarks yet. Save your favorite restaurants!</p>
            </div>
          )}
        </TabsContent>

        {/* Tab 5: Friends */}
        <TabsContent value="friends" className="space-y-3 mt-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button
              variant="outline"
              className="glass border-white/20 text-white h-10 rounded-xl"
            >
              Add from Phone Book
            </Button>
            <Button
              variant="outline"
              className="glass border-white/20 text-white h-10 rounded-xl"
            >
              Search Friends
            </Button>
          </div>

          {friends.length > 0 ? (
            friends.map((friend) => (
              <div key={friend.id} className="glass rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full gradient-purple flex items-center justify-center text-white font-semibold">
                    {friend.name[0]}
                  </div>
                  <div>
                    <p className="text-white font-medium">{friend.name}</p>
                    <p className="text-white/60 text-sm">@{friend.name.toLowerCase().replace(' ', '')}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass border-white/20 text-white"
                >
                  View Profile
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <UsersIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No friends yet. Start connecting!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Logout Button */}
      <div className="p-4">
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full h-12 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>

      <BottomNav active="social" />

      {/* Add Diary Modal */}
      <Dialog open={showAddDiary} onOpenChange={setShowAddDiary}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Add Diary Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-white/80 mb-2 block">Beverage Name *</label>
              <Input
                value={diaryForm.beverage_name}
                onChange={(e) => setDiaryForm({ ...diaryForm, beverage_name: e.target.value })}
                placeholder="What did you drink?"
                className="glass border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div>
              <label className="text-sm text-white/80 mb-2 block">Restaurant *</label>
              <Input
                value={diaryForm.restaurant}
                onChange={(e) => setDiaryForm({ ...diaryForm, restaurant: e.target.value })}
                placeholder="Where did you drink it?"
                className="glass border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            <div>
              <label className="text-sm text-white/80 mb-3 block">Rating *</label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setDiaryForm({ ...diaryForm, rating: star })}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= diaryForm.rating ? 'fill-amber-500 text-amber-500' : 'text-white/20'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-white/80 mb-2 block">Notes</label>
              <Textarea
                value={diaryForm.notes}
                onChange={(e) => setDiaryForm({ ...diaryForm, notes: e.target.value })}
                placeholder="Your thoughts..."
                className="glass border-white/20 text-white placeholder:text-white/40 min-h-[80px]"
              />
            </div>
            <div>
              <label className="text-sm text-white/80 mb-2 block">Photo</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 glass border-white/20 text-white"
                  onClick={() => document.getElementById('diary-camera').click()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Camera
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 glass border-white/20 text-white"
                  onClick={() => document.getElementById('diary-upload').click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
              {diaryForm.photo && (
                <img src={diaryForm.photo} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
              )}
              <input
                id="diary-camera"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files[0] && handleDiaryPhotoUpload(e.target.files[0])}
              />
              <input
                id="diary-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files[0] && handleDiaryPhotoUpload(e.target.files[0])}
              />
            </div>
            <div className="flex items-center justify-between glass rounded-lg p-3">
              <label className="text-sm text-white/80">Share to Feed</label>
              <Switch
                checked={diaryForm.share_to_feed}
                onCheckedChange={(checked) => setDiaryForm({ ...diaryForm, share_to_feed: checked })}
              />
            </div>
            <Button
              onClick={handleAddDiary}
              className="w-full gradient-amber text-black font-semibold h-12 rounded-xl"
            >
              Add Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View/Edit Diary Modal */}
      <Dialog open={showViewDiary} onOpenChange={setShowViewDiary}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Diary Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-white/80 mb-2 block">Beverage Name</label>
              <Input
                value={diaryForm.beverage_name}
                onChange={(e) => setDiaryForm({ ...diaryForm, beverage_name: e.target.value })}
                className="glass border-white/20 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-white/80 mb-2 block">Restaurant</label>
              <Input
                value={diaryForm.restaurant}
                onChange={(e) => setDiaryForm({ ...diaryForm, restaurant: e.target.value })}
                className="glass border-white/20 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-white/80 mb-3 block">Rating</label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setDiaryForm({ ...diaryForm, rating: star })}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= diaryForm.rating ? 'fill-amber-500 text-amber-500' : 'text-white/20'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-white/80 mb-2 block">Notes</label>
              <Textarea
                value={diaryForm.notes}
                onChange={(e) => setDiaryForm({ ...diaryForm, notes: e.target.value })}
                className="glass border-white/20 text-white min-h-[80px]"
              />
            </div>
            {diaryForm.photo && (
              <img src={diaryForm.photo} alt="Entry" className="w-full h-32 object-cover rounded-lg" />
            )}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleUpdateDiary}
                className="gradient-amber text-black font-semibold h-10 rounded-xl"
              >
                <Edit className="w-4 h-4 mr-2" />
                Update
              </Button>
              <Button
                onClick={handleDeleteDiary}
                variant="destructive"
                className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 h-10 rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
