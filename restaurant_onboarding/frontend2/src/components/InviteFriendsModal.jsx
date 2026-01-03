import { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Search, Users } from 'lucide-react';
import ShareModal from './ShareModal';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function InviteFriendsModal({ open, onClose, user, restaurant }) {
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [message, setMessage] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareItem, setShareItem] = useState(null);

  useEffect(() => {
    if (open) {
      fetchFriends();
      setMessage(`Let's visit ${restaurant?.name || 'this place'} together!`);
    }
  }, [open, restaurant]);

  const fetchFriends = async () => {
    try {
      const response = await axios.get(`${API}/friends/${user.id}`);
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const toggleFriend = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  const handleInvite = () => {
    if (selectedFriends.length === 0) {
      toast.error('Please select at least one friend');
      return;
    }

    // Show share modal with message
    setShareItem({
      title: `Visit ${restaurant?.name || 'Restaurant'} Together!`,
      description: message,
      url: `${window.location.origin}/restaurant/${restaurant?.id}`
    });
    setShowShareModal(true);
    onClose();
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Invite Friends
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass border-white/20 text-white placeholder:text-white/40 pl-10 h-10"
              />
            </div>

            {/* Friends List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredFriends.length > 0 ? (
                filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    onClick={() => toggleFriend(friend.id)}
                    className={`glass rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all ${
                      selectedFriends.includes(friend.id) ? 'border-2 border-purple-500' : ''
                    }`}
                  >
                    <Checkbox
                      checked={selectedFriends.includes(friend.id)}
                      onCheckedChange={() => toggleFriend(friend.id)}
                      className="border-white/40 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                    />
                    <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center text-white font-semibold">
                      {friend.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{friend.name}</p>
                      <p className="text-white/60 text-sm">@{friend.name.toLowerCase().replace(' ', '')}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-white/20 mx-auto mb-2" />
                  <p className="text-white/60 text-sm">
                    {searchQuery ? 'No friends found' : 'No friends yet'}
                  </p>
                </div>
              )}
            </div>

            {/* Personal Message */}
            <div>
              <label className="text-sm text-white/80 mb-2 block">Personal Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal message..."
                className="glass border-white/20 text-white placeholder:text-white/40 min-h-[80px]"
              />
            </div>

            {/* Selected Count */}
            {selectedFriends.length > 0 && (
              <div className="glass rounded-lg p-3">
                <p className="text-white/80 text-sm">
                  {selectedFriends.length} friend{selectedFriends.length > 1 ? 's' : ''} selected
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 glass border-white/20 text-white h-11 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={selectedFriends.length === 0}
                className="flex-1 gradient-purple text-white font-semibold h-11 rounded-xl"
              >
                Send Invites
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showShareModal && (
        <ShareModal
          item={shareItem}
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
}
