import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Star, LogOut, Edit2, Hash, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ExpertBottomNav from '@/components/expert/ExpertBottomNav';
import { toast } from 'sonner';

// Placeholder stats - will be replaced with API call
const PLACEHOLDER_STATS = {
  total_ratings: 127,
  avg_score_given: 3.8,
  beverages_this_week: 12
};

export default function ExpertProfilePage({ expert, setExpert }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_ratings: 0, avg_score_given: 0, beverages_this_week: 0 });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: expert.name,
    bio: expert.bio || '',
    expertise_tags: expert.expertise_tags?.join(', ') || ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [expert.id]);

  const fetchStats = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/expert/${expert.id}/stats`);
    // const data = await response.json();
    
    setStats(PLACEHOLDER_STATS);
  };

  const handleLogout = () => {
    localStorage.removeItem('sipzy_expert');
    setExpert(null);
    navigate('/expert/auth');
    toast.success('Logged out successfully');
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/expert/${expert.id}`, {
    //   method: 'PUT',
    //   body: JSON.stringify({...})
    // });
    
    const updatedExpert = {
      ...expert,
      name: editData.name,
      bio: editData.bio,
      expertise_tags: editData.expertise_tags.split(',').map(t => t.trim()).filter(t => t)
    };
    
    localStorage.setItem('sipzy_expert', JSON.stringify(updatedExpert));
    setExpert(updatedExpert);
    setShowEditModal(false);
    toast.success('Profile updated successfully');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      {/* Profile Header */}
      <div className="p-6 text-center border-b border-white/10">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mx-auto mb-4 overflow-hidden">
          {expert.avatar ? (
            <img src={expert.avatar} alt={expert.name} className="w-full h-full object-cover" />
          ) : (
            <ShieldCheck className="w-12 h-12 text-white" />
          )}
        </div>
        
        <h1 className="text-white text-2xl font-bold mb-2">{expert.name}</h1>
        
        <div className="flex justify-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600/20 to-purple-400/20 border border-purple-500/30">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 font-medium text-sm">Verified Expert</span>
          </div>
        </div>
        
        {expert.bio && (
          <p className="text-white/70 text-sm max-w-md mx-auto mb-4">{expert.bio}</p>
        )}
        
        {/* Expertise Tags */}
        {expert.expertise_tags?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {expert.expertise_tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 text-xs px-3 py-1.5 glass rounded-full text-amber-400">
                <Hash className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Total Ratings */}
        <div className="flex items-center justify-center gap-2 text-white/60">
          <Award className="w-4 h-4" />
          <span>{stats.total_ratings} Total Ratings</span>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6">
        <h2 className="text-white text-lg font-bold mb-4">Your Performance</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-500">{stats.total_ratings}</p>
            <p className="text-white/60 text-xs">Beverages Rated</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.avg_score_given}</p>
            <p className="text-white/60 text-xs">Avg Score Given</p>
          </div>
          <div className="glass rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.beverages_this_week}</p>
            <p className="text-white/60 text-xs">This Week</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 space-y-3">
        <Button
          onClick={() => setShowEditModal(true)}
          className="w-full glass border-white/20 text-white h-12 flex items-center justify-center gap-2"
          variant="outline"
        >
          <Edit2 className="w-5 h-5" />
          Edit Profile
        </Button>
        
        <Button
          onClick={handleLogout}
          className="w-full bg-red-500/20 border border-red-500/30 text-red-400 h-12 flex items-center justify-center gap-2 hover:bg-red-500/30"
          variant="outline"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm text-white/80">Name</label>
              <Input
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="glass border-white/20 text-white h-11"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-white/80">Bio</label>
              <Textarea
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                className="glass border-white/20 text-white min-h-[100px]"
                placeholder="Tell us about your expertise..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-white/80">Expertise Tags (comma separated)</label>
              <Input
                value={editData.expertise_tags}
                onChange={(e) => setEditData({ ...editData, expertise_tags: e.target.value })}
                className="glass border-white/20 text-white h-11"
                placeholder="Whisky, Wine, Cocktails"
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setShowEditModal(false)}
                variant="outline"
                className="flex-1 glass border-white/20 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={loading || !editData.name}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-400 text-white"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ExpertBottomNav active="profile" />
    </div>
  );
}
