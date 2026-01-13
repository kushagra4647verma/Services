import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Star, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

// Placeholder beverages data - will be replaced with API call
const PLACEHOLDER_BEVERAGES = {
  'bev_001': { id: 'bev_001', name: 'Glenfiddich 12yr', type: 'whisky', base_drink: 'Scotch', price: 850, image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=800', alcoholic: true, sipzy_rating: 4.2, restaurant_id: 'rest_001' },
  'bev_002': { id: 'bev_002', name: 'Old Fashioned', type: 'cocktail', base_drink: 'Bourbon', price: 650, image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800', alcoholic: true, sipzy_rating: 4.5, restaurant_id: 'rest_001' },
  'bev_003': { id: 'bev_003', name: 'Virgin Mojito', type: 'mocktail', base_drink: 'Lime', price: 350, image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800', alcoholic: false, sipzy_rating: 4.0, restaurant_id: 'rest_001' },
  'bev_004': { id: 'bev_004', name: 'Espresso Martini', type: 'cocktail', base_drink: 'Vodka', price: 550, image: 'https://images.unsplash.com/photo-1545438102-799c3991fffa?w=800', alcoholic: true, sipzy_rating: 4.3, restaurant_id: 'rest_001' },
  'bev_005': { id: 'bev_005', name: 'Negroni', type: 'cocktail', base_drink: 'Gin', price: 600, image: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?w=800', alcoholic: true, sipzy_rating: 4.4, restaurant_id: 'rest_002' },
  'bev_006': { id: 'bev_006', name: 'Margarita', type: 'cocktail', base_drink: 'Tequila', price: 550, image: 'https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=800', alcoholic: true, sipzy_rating: 4.1, restaurant_id: 'rest_002' },
  'bev_007': { id: 'bev_007', name: 'Cabernet Sauvignon', type: 'wine', base_drink: 'Red Wine', price: 750, image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800', alcoholic: true, sipzy_rating: 4.6, restaurant_id: 'rest_003' },
  'bev_008': { id: 'bev_008', name: 'Chardonnay', type: 'wine', base_drink: 'White Wine', price: 700, image: 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=800', alcoholic: true, sipzy_rating: 4.3, restaurant_id: 'rest_003' },
};

export default function ExpertBeverageRating({ expert }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get('restaurant');
  
  const [beverage, setBeverage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Rating states
  const [presentation, setPresentation] = useState([3]);
  const [taste, setTaste] = useState([3]);
  const [ingredients, setIngredients] = useState([3]);
  const [accuracy, setAccuracy] = useState([3]);
  const [notes, setNotes] = useState('');
  
  // Check if expert already rated this beverage
  const [existingRating, setExistingRating] = useState(null);

  useEffect(() => {
    fetchBeverage();
    checkExistingRating();
  }, [id]);

  const fetchBeverage = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/beverages/${id}`);
    // const data = await response.json();
    
    const data = PLACEHOLDER_BEVERAGES[id] || PLACEHOLDER_BEVERAGES['bev_001'];
    setBeverage(data);
    setLoading(false);
  };

  const checkExistingRating = async () => {
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/expert/${expert.id}/beverage/${id}/rating`);
    // if (response.ok) { ... }
    
    // For demo, no existing rating
    setExistingRating(null);
  };

  const handleSubmit = async () => {
    if (!expert?.id) {
      toast.error('Expert session not found. Please login again.');
      navigate('/expert/auth');
      return;
    }
    
    setSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/expert/${expert.id}/beverages/${id}/rate`, {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     presentation: presentation[0],
    //     taste: taste[0],
    //     ingredients: ingredients[0],
    //     accuracy: accuracy[0],
    //     notes,
    //     restaurant_id: restaurantId || beverage?.restaurant_id
    //   })
    // });
    
    console.log('Submitting rating:', {
      expert_id: expert.id,
      beverage_id: id,
      presentation: presentation[0],
      taste: taste[0],
      ingredients: ingredients[0],
      accuracy: accuracy[0],
      notes,
      restaurant_id: restaurantId || beverage?.restaurant_id
    });
    
    toast.success('Rating submitted successfully!');
    
    // Navigate to success page with beverage info
    navigate('/expert/rating-success', { 
      state: { 
        beverageName: beverage.name,
        restaurantId: restaurantId || beverage?.restaurant_id
      } 
    });
    
    setSubmitting(false);
  };

  const getScoreLabel = (value) => {
    if (value <= 1) return 'Poor';
    if (value <= 2) return 'Below Avg';
    if (value <= 3) return 'Average';
    if (value <= 4) return 'Good';
    return 'Excellent';
  };

  const avgScore = ((presentation[0] + taste[0] + ingredients[0] + accuracy[0]) / 4).toFixed(1);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  if (!beverage) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-8">
      {/* Header */}
      <div className="relative">
        <div className="relative h-48">
          <img src={beverage.image} alt={beverage.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
          
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-10 h-10 rounded-full glass-strong flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          
          {/* Expert Mode Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600">
            <ShieldCheck className="w-4 h-4 text-white" />
            <span className="text-white font-medium text-xs">Expert Rating</span>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-white text-xl font-bold">{beverage.name}</h1>
            <p className="text-white/70 text-sm capitalize">{beverage.type} • {beverage.base_drink}</p>
          </div>
        </div>
      </div>

      {/* Expert Rating Form */}
      <div className="p-4 space-y-6">
        {existingRating && (
          <div className="glass rounded-xl p-3 border border-amber-500/30">
            <p className="text-amber-500 text-sm flex items-center gap-2">
              <Star className="w-4 h-4" />
              You&apos;ve already rated this beverage. Updating will replace your previous rating.
            </p>
          </div>
        )}
        
        {/* Average Score Preview */}
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-white/60 text-sm mb-2">Your Expert Score</p>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <span className="text-4xl font-bold text-white">{avgScore}</span>
            <span className="text-white/60">/5</span>
          </div>
        </div>

        {/* Rating Sliders */}
        <div className="space-y-6">
          {/* Presentation */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-medium">Presentation</label>
              <div className="flex items-center gap-2">
                <span className="text-amber-500 font-bold">{presentation[0]}</span>
                <span className="text-white/40 text-sm">({getScoreLabel(presentation[0])})</span>
              </div>
            </div>
            <Slider
              value={presentation}
              onValueChange={setPresentation}
              min={1}
              max={5}
              step={0.5}
              className="py-2"
            />
            <p className="text-white/50 text-xs mt-2">Visual appeal, glassware, garnish, color</p>
          </div>

          {/* Taste */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-medium">Taste</label>
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-bold">{taste[0]}</span>
                <span className="text-white/40 text-sm">({getScoreLabel(taste[0])})</span>
              </div>
            </div>
            <Slider
              value={taste}
              onValueChange={setTaste}
              min={1}
              max={5}
              step={0.5}
              className="py-2"
            />
            <p className="text-white/50 text-xs mt-2">Flavor balance, complexity, finish</p>
          </div>

          {/* Ingredients */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-medium">Ingredients</label>
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-bold">{ingredients[0]}</span>
                <span className="text-white/40 text-sm">({getScoreLabel(ingredients[0])})</span>
              </div>
            </div>
            <Slider
              value={ingredients}
              onValueChange={setIngredients}
              min={1}
              max={5}
              step={0.5}
              className="py-2"
            />
            <p className="text-white/50 text-xs mt-2">Quality of spirits, mixers, freshness</p>
          </div>

          {/* Accuracy */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-medium">Accuracy</label>
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-bold">{accuracy[0]}</span>
                <span className="text-white/40 text-sm">({getScoreLabel(accuracy[0])})</span>
              </div>
            </div>
            <Slider
              value={accuracy}
              onValueChange={setAccuracy}
              min={1}
              max={5}
              step={0.5}
              className="py-2"
            />
            <p className="text-white/50 text-xs mt-2">True to recipe, consistency, authenticity</p>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-white font-medium">Expert Notes (Optional)</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your expert insights, recommendations, or observations..."
            className="glass border-white/20 text-white placeholder:text-white/40 min-h-[100px]"
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-bold text-lg rounded-xl hover:opacity-90"
        >
          {submitting ? 'Submitting...' : existingRating ? 'Update Expert Rating' : 'Submit Expert Rating'}
        </Button>
      </div>
    </div>
  );
}
