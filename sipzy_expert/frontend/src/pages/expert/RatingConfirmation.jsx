import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Star, PartyPopper, ArrowRight, Eye } from 'lucide-react';
import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';

export default function RatingConfirmation({ expert }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { beverageName, restaurantId } = location.state || {};
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          colors={['#F59E0B', '#A855F7', '#10B981', '#3B82F6', '#EC4899']}
        />
      )}
      
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-amber-500 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-500 blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        {/* Success Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center mx-auto animate-pulse">
            <Star className="w-16 h-16 text-white fill-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
            <PartyPopper className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-white text-3xl font-bold mb-4">Rating Submitted!</h1>
        <p className="text-white/70 text-lg mb-2">Your expert insights have been recorded!</p>
        {beverageName && (
          <p className="text-amber-500 font-medium mb-8">{beverageName}</p>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <Button
            onClick={() => navigate('/expert/tasks')}
            className="w-full h-14 bg-gradient-to-r from-purple-600 to-purple-400 text-white font-bold text-lg rounded-xl hover:opacity-90"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Back to Tasks
          </Button>
          
          {restaurantId && (
            <Button
              onClick={() => navigate(`/expert/restaurant/${restaurantId}`)}
              variant="outline"
              className="w-full h-14 glass border-white/20 text-white font-medium text-lg rounded-xl"
            >
              <Eye className="w-5 h-5 mr-2" />
              Rate Another Beverage
            </Button>
          )}
        </div>

        {/* Stats Update Notice */}
        <div className="mt-8 glass rounded-xl p-4">
          <p className="text-white/60 text-sm">
            Your rating will be reflected in the SipZy score calculation.
          </p>
        </div>
      </div>
    </div>
  );
}
