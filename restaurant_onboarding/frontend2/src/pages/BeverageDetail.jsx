import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Star, Share2, Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import ShareModal from '@/components/ShareModal';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BeverageDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [beverage, setBeverage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [showExpertBreakdown, setShowExpertBreakdown] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [shareItem, setShareItem] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetchBeverage();
  }, [id]);

  const fetchBeverage = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/beverages/${id}`);
      setBeverage(response.data);
    } catch (error) {
      console.error('Error fetching beverage:', error);
      toast.error('Failed to load beverage details');
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/beverages/${id}/rate`, {
        user_id: user.id,
        rating,
        review
      });
      toast.success('Rating submitted!');
      setShowRatingModal(false);
      setRating(0);
      setReview('');
      fetchBeverage();
    } catch (error) {
      toast.error('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/beverages/${id}/upload-photo`, formData);
      toast.success('Photo uploaded!');
      // Auto-open share modal
      setShareItem({
        title: beverage.name,
        description: `Check out this photo of ${beverage.name}!`,
        url: `${window.location.origin}/beverage/${id}`,
        image: response.data.photo_url
      });
      setShowShareModal(true);
      fetchBeverage();
    } catch (error) {
      toast.error('Failed to upload photo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  if (!beverage) return null;

  const expertBreakdown = beverage.expert_breakdown || {};

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="relative h-96">
        <img src={beverage.image} alt={beverage.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        <button
          data-testid="back-button"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full glass-strong flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="absolute bottom-6 left-4 right-4">
          <h1 className="text-white text-3xl font-bold mb-2">{beverage.name}</h1>
          <span className="inline-block px-3 py-1 glass rounded-full text-white/80 text-sm">
            {beverage.type}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Ratings */}
        <div className="space-y-3">
          {/* SipZy Rating */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">SipZy Rating</span>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                <span className="text-amber-500 text-2xl font-bold">{beverage.sipzy_rating || 0}</span>
              </div>
            </div>
          </div>

          {/* Customer Rating */}
          <div
            data-testid="customer-rating-card"
            onClick={() => setShowReviewsModal(true)}
            className="glass rounded-xl p-4 cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white/60 text-sm block mb-1">Customer Rating</span>
                <span className="text-white/40 text-xs">{beverage.customer_rating_count || 0} reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-purple-500 text-purple-500" />
                <span className="text-purple-500 text-2xl font-bold">{beverage.customer_rating || 0}</span>
              </div>
            </div>
          </div>

          {/* Expert Rating */}
          <div
            data-testid="expert-rating-card"
            onClick={() => setShowExpertBreakdown(true)}
            className="glass rounded-xl p-4 cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">Expert Rating</span>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-green-500 text-green-500" />
                <span className="text-green-500 text-2xl font-bold">{beverage.expert_rating || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="glass rounded-xl p-4 space-y-3">
          <h3 className="text-white font-semibold mb-3">Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Description</span>
              <span className="text-white/80 text-right max-w-[60%]">{beverage.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Price</span>
              <span className="text-white/80 font-semibold">₹{beverage.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Base Drink</span>
              <span className="text-white/80">{beverage.base_drink}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Type</span>
              <span className="text-white/80 capitalize">{beverage.alcoholic ? 'Alcoholic' : 'Non-Alcoholic'}</span>
            </div>
          </div>
        </div>

        {/* Restaurant Info */}
        {beverage.restaurant && (
          <div
            onClick={() => navigate(`/restaurant/${beverage.restaurant.id}`)}
            className="glass rounded-xl p-4 cursor-pointer hover:scale-105 transition-transform"
          >
            <h3 className="text-white font-semibold mb-2">Available at</h3>
            <div className="flex items-center gap-3">
              <img src={beverage.restaurant.image} alt={beverage.restaurant.name} className="w-16 h-16 rounded-lg object-cover" />
              <div>
                <p className="text-white font-medium">{beverage.restaurant.name}</p>
                <p className="text-white/60 text-sm">{beverage.restaurant.area}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            data-testid="add-rating-button"
            onClick={() => setShowRatingModal(true)}
            className="gradient-amber text-black font-semibold h-12 rounded-xl"
          >
            <Star className="w-5 h-5 mr-2" />
            Add Rating
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="glass border-white/20 text-white h-12 rounded-xl"
              onClick={() => document.getElementById('photo-upload').click()}
            >
              <Camera className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="glass border-white/20 text-white h-12 rounded-xl"
              onClick={() => {
                setShareItem({
                  title: beverage.name,
                  description: `${beverage.type} • ₹${beverage.price}`,
                  url: `${window.location.origin}/beverage/${id}`
                });
                setShowShareModal(true);
              }}
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files[0] && handlePhotoUpload(e.target.files[0])}
        />

        {/* Customer Reviews */}
        {beverage.reviews && beverage.reviews.length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-4">Recent Reviews</h3>
            <div className="space-y-3">
              {beverage.reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="glass rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center text-white font-semibold">
                      {review.user_name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white font-medium">{review.user_name}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          <span className="text-amber-500 text-sm font-semibold">{review.rating}</span>
                        </div>
                      </div>
                      {review.review && (
                        <p className="text-white/80 text-sm">{review.review}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {beverage.reviews.length > 3 && (
                <Button
                  onClick={() => setShowReviewsModal(true)}
                  variant="ghost"
                  className="w-full text-amber-500"
                >
                  View all {beverage.reviews.length} reviews
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Rating Modal */}
      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Rate {beverage.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div>
              <label className="text-sm text-white/80 mb-3 block">Your Rating</label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= rating ? 'fill-amber-500 text-amber-500' : 'text-white/20'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-white/80 mb-2 block">Review (Optional)</label>
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience..."
                className="glass border-white/20 text-white placeholder:text-white/40 min-h-[100px]"
              />
            </div>
            <Button
              onClick={handleRate}
              disabled={submitting || rating === 0}
              className="w-full gradient-amber text-black font-semibold h-12 rounded-xl"
            >
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Reviews Modal */}
      <Dialog open={showReviewsModal} onOpenChange={setShowReviewsModal}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Reviews ({beverage.customer_rating_count || 0})</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {beverage.reviews && beverage.reviews.map((review) => (
              <div key={review.id} className="glass rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center text-white font-semibold">
                    {review.user_name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-medium">{review.user_name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span className="text-amber-500 text-sm font-semibold">{review.rating}</span>
                      </div>
                    </div>
                    {review.review && (
                      <p className="text-white/80 text-sm mb-2">{review.review}</p>
                    )}
                    <p className="text-white/40 text-xs">
                      {new Date(review.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Expert Breakdown Modal */}
      <Dialog open={showExpertBreakdown} onOpenChange={setShowExpertBreakdown}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Expert Rating Breakdown</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {[
              { label: 'Presentation', value: expertBreakdown.presentation || 0 },
              { label: 'Taste', value: expertBreakdown.taste || 0 },
              { label: 'Ingredients', value: expertBreakdown.ingredients || 0 },
              { label: 'Accuracy', value: expertBreakdown.accuracy || 0 }
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-sm">{item.label}</span>
                  <span className="text-white font-semibold">{item.value}/5</span>
                </div>
                <Progress value={(item.value / 5) * 100} className="h-2" />
              </div>
            ))}
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
    </div>
  );
}
