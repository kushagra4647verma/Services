import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { GlassWater, Phone, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

// Demo credentials - in production, this would be handled by Supabase
const DEMO_PHONE = '9999999999';
const DEMO_OTP = '123456';

// Placeholder expert data - will be replaced with API call
const DEMO_EXPERT = {
  id: 'expert_001',
  name: 'Demo Expert',
  phone: DEMO_PHONE,
  bio: 'Beverage expert with 5+ years of experience',
  avatar: null,
  expertise_tags: ['Whisky', 'Wine', 'Cocktails'],
  verified: true
};

export default function ExpertAuthPage({ setExpert }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Demo mode: Check if phone matches demo credentials
    if (phone === DEMO_PHONE) {
      toast.success(`OTP sent! Demo OTP: ${DEMO_OTP}`);
      setStep('otp');
    } else {
      // TODO: Replace with actual Supabase OTP send
      // For now, show demo message
      toast.info(`Demo mode: Use phone ${DEMO_PHONE} and OTP ${DEMO_OTP}`);
      setStep('otp');
    }
    
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Demo mode: Verify OTP
    if (phone === DEMO_PHONE && otp === DEMO_OTP) {
      // TODO: Replace with actual API call to get expert data
      localStorage.setItem('sipzy_expert', JSON.stringify(DEMO_EXPERT));
      setExpert(DEMO_EXPERT);
      toast.success('Welcome back, Expert!');
      navigate('/expert');
    } else if (otp === DEMO_OTP) {
      // Accept demo OTP for any phone during testing
      const testExpert = { ...DEMO_EXPERT, phone };
      localStorage.setItem('sipzy_expert', JSON.stringify(testExpert));
      setExpert(testExpert);
      toast.success('Welcome back, Expert!');
      navigate('/expert');
    } else {
      toast.error('Invalid OTP. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-500 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-amber-500 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-4">
          <GlassWater className="w-12 h-12 text-amber-500 mr-2" />
          <h1 className="text-3xl font-bold">
            <span className="text-gradient-amber">Sip</span>
            <span className="text-gradient-purple">Zy</span>
          </h1>
        </div>
        
        {/* Expert Badge */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-purple-400/20 border border-purple-500/30">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-semibold text-sm">Expert Portal</span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="glass-strong rounded-3xl p-8 shadow-2xl">
          {step === 'phone' && (
            <div className="space-y-6 animate-slide-up">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Expert Login</h2>
                <p className="text-white/60 text-sm">Enter your registered phone number</p>
                <p className="text-amber-500/80 text-xs mt-2">Demo: {DEMO_PHONE} / OTP: {DEMO_OTP}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/80 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-purple-400" />
                  Phone Number
                </label>
                <Input
                  data-testid="expert-phone-input"
                  type="tel"
                  placeholder="10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="glass border-white/20 text-white placeholder:text-white/40 h-12"
                  maxLength={10}
                />
              </div>

              <Button
                data-testid="expert-send-otp-button"
                onClick={handleSendOtp}
                disabled={loading || phone.length !== 10}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold h-12 rounded-xl hover:opacity-90"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-6 animate-slide-up">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Verify OTP</h2>
                <p className="text-white/60 text-sm">Enter the 6-digit code sent to {phone}</p>
                <div className="mt-3 p-3 glass rounded-lg">
                  <p className="text-purple-400 font-mono text-center text-lg">Demo OTP: {DEMO_OTP}</p>
                </div>
              </div>

              <div className="flex justify-center">
                <InputOTP
                  data-testid="expert-otp-input"
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="glass border-white/20 text-white w-12 h-14 text-xl" />
                    <InputOTPSlot index={1} className="glass border-white/20 text-white w-12 h-14 text-xl" />
                    <InputOTPSlot index={2} className="glass border-white/20 text-white w-12 h-14 text-xl" />
                    <InputOTPSlot index={3} className="glass border-white/20 text-white w-12 h-14 text-xl" />
                    <InputOTPSlot index={4} className="glass border-white/20 text-white w-12 h-14 text-xl" />
                    <InputOTPSlot index={5} className="glass border-white/20 text-white w-12 h-14 text-xl" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="space-y-3">
                <Button
                  data-testid="expert-verify-otp-button"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-400 text-white font-semibold h-12 rounded-xl hover:opacity-90"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <button
                  data-testid="expert-resend-otp"
                  onClick={() => { setStep('phone'); setOtp(''); }}
                  className="w-full text-center text-purple-400 hover:underline text-sm"
                >
                  Change Phone Number
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-white/40 text-xs text-center mt-6">
          By continuing, you agree to the Expert Guidelines.
        </p>
      </div>
    </div>
  );
}
