import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { GlassWater, X, Sparkles, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function GroupMixMagic({ open, onClose, restaurant, beverages }) {
  const [participants, setParticipants] = useState('');
  const [selectedBaseDrinks, setSelectedBaseDrinks] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Get unique base drinks from beverages
  const baseDrinks = [...new Set(beverages.filter(b => b.alcoholic).map(b => b.base_drink))];

  // Update base drinks array when participants change
  const handleParticipantsChange = (value) => {
    setParticipants(value);
    const count = parseInt(value) || 0;
    // Adjust selectedBaseDrinks array to match participant count
    if (count > 0) {
      const newArray = Array(count).fill('').map((_, index) => 
        selectedBaseDrinks[index] || ''
      );
      setSelectedBaseDrinks(newArray);
    } else {
      setSelectedBaseDrinks([]);
    }
  };

  const handleBaseDrinkChange = (index, value) => {
    const newBaseDrinks = [...selectedBaseDrinks];
    newBaseDrinks[index] = value;
    setSelectedBaseDrinks(newBaseDrinks);
  };

  const handleGenerate = () => {
    if (!participants || parseInt(participants) < 1) {
      toast.error('Please enter number of participants');
      return;
    }
    
    // Check if all base drinks are selected
    const allSelected = selectedBaseDrinks.every(drink => drink !== '');
    if (!allSelected) {
      toast.error(`Please select base drink for all ${participants} participants`);
      return;
    }

    setIsGenerating(true);
    setShowResults(false);

    // Simulate slot machine effect
    setTimeout(() => {
      // Get top rated beverage for each selected base drink
      const recommendations = selectedBaseDrinks.map((baseDrink, index) => {
        const filteredBeverages = beverages
          .filter(b => b.alcoholic && b.base_drink === baseDrink)
          .sort((a, b) => (b.sipzy_rating || 0) - (a.sipzy_rating || 0));
        
        // Get a random top-rated beverage (from top 3)
        const topBeverages = filteredBeverages.slice(0, Math.min(3, filteredBeverages.length));
        const randomIndex = Math.floor(Math.random() * topBeverages.length);
        return topBeverages[randomIndex] || filteredBeverages[0];
      }).filter(Boolean);

      setRecommendations(recommendations);
      setIsGenerating(false);
      setShowResults(true);
    }, 2500);
  };

  const resetForm = () => {
    setParticipants('');
    setSelectedBaseDrinks([]);
    setIsGenerating(false);
    setRecommendations([]);
    setShowResults(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0a] border-none max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-gradient-to-b from-purple-900/40 via-purple-800/20 to-transparent backdrop-blur-xl border-b border-purple-500/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full glass-strong flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <GlassWater className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-amber-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Group Mix Magic
          </h2>
          <p className="text-center text-white/60 text-sm mt-1">Let AI create the perfect mix for your group</p>
        </div>

        <div className="p-6 space-y-6">
          {!showResults ? (
            <>
              {/* Inputs Section */}
              <div className="space-y-4">
                {/* Number of Participants */}
                <div className="space-y-2">
                  <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Number of Participants
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 4"
                    value={participants}
                    onChange={(e) => handleParticipantsChange(e.target.value)}
                    min="1"
                    max="10"
                    className="glass border-purple-500/30 text-white placeholder:text-white/40 h-14 text-lg focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>

                {/* Base Drink Selections - Multiple based on participants */}
                {selectedBaseDrinks.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-white/80 text-sm font-medium flex items-center gap-2">
                      <GlassWater className="w-4 h-4 text-amber-400" />
                      Base Drink Selection for Each Participant
                    </label>
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                      {selectedBaseDrinks.map((drink, index) => (
                        <div key={index} className="space-y-1">
                          <p className="text-xs text-white/60 font-medium">Participant {index + 1}</p>
                          <Select 
                            value={drink} 
                            onValueChange={(value) => handleBaseDrinkChange(index, value)}
                          >
                            <SelectTrigger className="glass border-purple-500/30 text-white h-12 focus:border-purple-500 focus:ring-purple-500/20">
                              <SelectValue placeholder="Choose spirit" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0a0a0a] border-purple-500/30">
                              {baseDrinks.map((baseDrink) => (
                                <SelectItem 
                                  key={baseDrink} 
                                  value={baseDrink}
                                  className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20"
                                >
                                  {baseDrink}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              {!isGenerating ? (
                <Button
                  onClick={handleGenerate}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 hover:from-purple-700 hover:via-pink-600 hover:to-amber-600 text-white rounded-xl shadow-lg shadow-purple-500/50 transition-all hover:scale-105"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Mix
                </Button>
              ) : (
                /* Slot Machine Animation */
                <div className="relative">
                  <div className="glass-strong rounded-2xl p-8 border-2 border-purple-500/30 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-amber-500/10 animate-pulse" />
                    
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-center gap-4">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center animate-spin"
                            style={{ animationDelay: `${i * 0.2}s`, animationDuration: '1s' }}
                          >
                            <GlassWater className="w-10 h-10 text-white" />
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-white mb-2">Mixing Magic...</h3>
                        <p className="text-white/60 text-sm">Finding the perfect combinations for your group</p>
                      </div>

                      {/* Animated dots */}
                      <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Results Section */
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Your Perfect Mix
                </h3>
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="glass border-white/20 text-white hover:bg-white/10"
                  size="sm"
                >
                  Try Again
                </Button>
              </div>

              {/* Cocktail Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((cocktail, index) => (
                  <div
                    key={cocktail.id}
                    className="glass-strong rounded-2xl overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-105 cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative h-40">
                      <img 
                        src={cocktail.image} 
                        alt={cocktail.name} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      
                      {/* Badge */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-bold">
                        Participant {index + 1}
                      </div>
                      
                      {/* Rating */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 glass-strong px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className="text-white font-bold text-sm">{cocktail.sipzy_rating || 0}</span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h4 className="text-white font-bold text-lg mb-2">{cocktail.name}</h4>
                      
                      {/* Type Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-300 border border-purple-500/30 capitalize">
                          #{cocktail.type}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-300 border border-amber-500/30">
                          #{cocktail.base_drink}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm font-medium">₹{cocktail.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {recommendations.length === 0 && (
                <div className="text-center py-12 glass rounded-2xl">
                  <GlassWater className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">No cocktails found for this combination</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
