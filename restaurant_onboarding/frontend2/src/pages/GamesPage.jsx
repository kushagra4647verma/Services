import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Gamepad2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const iconMap = {
  brain: '🧠',
  flask: '🧪',
  sparkles: '✨',
  disc: '💿',
  users: '👥'
};

export default function GamesPage({ user }) {
  const [games, setGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, [searchQuery]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const params = searchQuery ? `?search=${searchQuery}` : '';
      const response = await axios.get(`${API}/games${params}`);
      setGames(response.data);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-strong border-b border-white/10 backdrop-blur-xl p-4 space-y-4">
        <div>
          <h1 className="text-white text-2xl font-bold flex items-center gap-2">
            <Gamepad2 className="w-7 h-7 text-amber-500" />
            GameS
          </h1>
          <p className="text-white/60 text-sm mt-1">Fun games to play while you sip</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            data-testid="games-search-input"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass border-white/20 text-white placeholder:text-white/40 pl-10 h-12 rounded-xl"
          />
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : games.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {games.map((game) => (
              <div
                key={game.id}
                data-testid={`game-card-${game.id}`}
                className="glass rounded-2xl p-6 cursor-pointer hover:scale-105 transition-transform space-y-3"
              >
                <div className="text-5xl mb-3">{iconMap[game.icon] || '🎮'}</div>
                <h3 className="text-white text-xl font-bold">{game.name}</h3>
                <p className="text-white/80 text-sm">{game.description}</p>
                <div className="pt-3 border-t border-white/10">
                  <p className="text-white/60 text-xs font-medium mb-2">How to Play:</p>
                  <p className="text-white/70 text-xs">{game.instructions}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Gamepad2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-white text-lg mb-2">No games found</h3>
            <p className="text-white/60 text-sm">Try a different search term</p>
          </div>
        )}
      </div>

      <BottomNav active="games" />
    </div>
  );
}
