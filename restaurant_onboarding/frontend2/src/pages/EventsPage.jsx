import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Calendar, MapPin, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/BottomNav';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function EventsPage({ user }) {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [searchQuery]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = searchQuery ? `?search=${searchQuery}` : '';
      const response = await axios.get(`${API}/events${params}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (event) => {
    // Open phone dialer
    window.location.href = 'tel:+918012345678';
    toast.success(`Booking for ${event.name}...`);
  };

  const featuredEvents = events.filter(e => e.featured);
  const trendingEvents = events.filter(e => e.trending && !e.featured);
  const moreEvents = events.filter(e => !e.featured && !e.trending);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-strong border-b border-white/10 backdrop-blur-xl p-4 space-y-4">
        <div>
          <h1 className="text-white text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-7 h-7 text-purple-500" />
            EventS
          </h1>
          <p className="text-white/60 text-sm mt-1">Discover exciting events near you</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            data-testid="events-search-input"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass border-white/20 text-white placeholder:text-white/40 pl-10 h-12 rounded-xl"
          />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Featured Events */}
            {featuredEvents.length > 0 && (
              <div>
                <h2 className="text-white text-xl font-bold mb-4">Featured Events</h2>
                <div className="space-y-4">
                  {featuredEvents.map((event) => (
                    <div
                      key={event.id}
                      data-testid={`event-card-${event.id}`}
                      className="glass rounded-2xl overflow-hidden hover:scale-105 transition-transform"
                    >
                      <div className="relative h-48">
                        <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 gradient-amber text-black text-xs font-semibold rounded-full">
                            Featured
                          </span>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <h3 className="text-white text-lg font-bold">{event.name}</h3>
                        <p className="text-white/80 text-sm">{event.description}</p>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleBookNow(event)}
                          className="w-full gradient-amber text-black font-semibold h-10 rounded-xl"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Book Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Events */}
            {trendingEvents.length > 0 && (
              <div>
                <h2 className="text-white text-xl font-bold mb-4">Trending Near You</h2>
                <div className="space-y-4">
                  {trendingEvents.map((event) => (
                    <div
                      key={event.id}
                      data-testid={`event-card-${event.id}`}
                      className="glass rounded-2xl overflow-hidden hover:scale-105 transition-transform"
                    >
                      <div className="relative h-48">
                        <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 gradient-purple text-white text-xs font-semibold rounded-full">
                            Trending
                          </span>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <h3 className="text-white text-lg font-bold">{event.name}</h3>
                        <p className="text-white/80 text-sm">{event.description}</p>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleBookNow(event)}
                          className="w-full gradient-purple text-white font-semibold h-10 rounded-xl"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Book Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* More Events */}
            {moreEvents.length > 0 && (
              <div>
                <h2 className="text-white text-xl font-bold mb-4">More Events</h2>
                <div className="space-y-4">
                  {moreEvents.map((event) => (
                    <div
                      key={event.id}
                      data-testid={`event-card-${event.id}`}
                      className="glass rounded-2xl overflow-hidden hover:scale-105 transition-transform"
                    >
                      <div className="relative h-48">
                        <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      </div>
                      <div className="p-4 space-y-3">
                        <h3 className="text-white text-lg font-bold">{event.name}</h3>
                        <p className="text-white/80 text-sm">{event.description}</p>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleBookNow(event)}
                          variant="outline"
                          className="w-full glass border-white/20 text-white font-semibold h-10 rounded-xl"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Book Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {events.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-white text-lg mb-2">No events found</h3>
                <p className="text-white/60 text-sm">Try a different search term</p>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav active="events" />
    </div>
  );
}
