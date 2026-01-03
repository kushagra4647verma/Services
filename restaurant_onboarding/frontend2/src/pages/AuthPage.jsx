import { useState } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { GlassWater, Phone, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AuthPage({ setUser }) {
  const [step, setStep] = useState('phone'); // phone, otp, signup
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [displayOtp, setDisplayOtp] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/send-otp`, { phone });
      setDisplayOtp(response.data.otp);
      toast.success(`OTP sent! Your OTP is: ${response.data.otp}`);
      setStep('otp');
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/verify-otp`, { phone, otp });
      if (response.data.is_new) {
        setStep('signup');
      } else {
        localStorage.setItem('sipzy_user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        toast.success('Welcome back!');
      }
    } catch (error) {
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !age) {
      toast.error('Please fill in all fields');
      return;
    }

    if (parseInt(age) < 23) {
      toast.error('You must be 23 years or older to use SipZy');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms & Conditions');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/signup`, { name, age: parseInt(age), phone });
      localStorage.setItem('sipzy_user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      toast.success('Welcome to SipZy!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-amber-500 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-500 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <GlassWater className="w-16 h-16 text-amber-500 mr-3" />
          <h1 className="text-4xl font-bold">
            <span className="text-gradient-amber">Sip</span>
            <span className="text-gradient-purple">Zy</span>
          </h1>
        </div>

        {/* Auth Card */}
        <div className="glass-strong rounded-3xl p-8 shadow-2xl">
          {step === 'phone' && (
            <div className="space-y-6 animate-slide-up">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome!</h2>
                <p className="text-white/60 text-sm">Enter your phone number to get started</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/80 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-500" />
                  Phone Number
                </label>
                <Input
                  data-testid="phone-input"
                  type="tel"
                  placeholder="10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="glass border-white/20 text-white placeholder:text-white/40 h-12"
                  maxLength={10}
                />
              </div>

              <Button
                data-testid="send-otp-button"
                onClick={handleSendOtp}
                disabled={loading || phone.length !== 10}
                className="w-full gradient-amber text-black font-semibold h-12 rounded-xl hover:opacity-90"
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
                {displayOtp && (
                  <div className="mt-3 p-3 glass rounded-lg">
                    <p className="text-amber-500 font-mono text-center text-lg">Your OTP: {displayOtp}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <InputOTP
                  data-testid="otp-input"
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
                  data-testid="verify-otp-button"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  className="w-full gradient-amber text-black font-semibold h-12 rounded-xl hover:opacity-90"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <Button
                  data-testid="back-to-phone-button"
                  onClick={() => { setStep('phone'); setOtp(''); setDisplayOtp(''); }}
                  variant="ghost"
                  className="w-full text-white/60 hover:text-white"
                >
                  Change Phone Number
                </Button>
              </div>
            </div>
          )}

          {step === 'signup' && (
            <div className="space-y-6 animate-slide-up">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-white/60 text-sm">Tell us about yourself</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/80 flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-500" />
                    Full Name
                  </label>
                  <Input
                    data-testid="name-input"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass border-white/20 text-white placeholder:text-white/40 h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/80 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    Age
                  </label>
                  <Input
                    data-testid="age-input"
                    type="number"
                    placeholder="Must be 23+"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="glass border-white/20 text-white placeholder:text-white/40 h-12"
                    min="23"
                  />
                </div>

                <div className="flex items-start gap-3 p-4 glass rounded-xl">
                  <Checkbox
                    data-testid="terms-checkbox"
                    checked={agreedToTerms}
                    onCheckedChange={setAgreedToTerms}
                    className="mt-1 border-white/40 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />
                  <p className="text-sm text-white/80">
                    I agree to the{' '}
                    <span className="text-amber-500 cursor-pointer hover:underline">Terms & Conditions</span>
                    {' '}and confirm I am 23 years or older
                  </p>
                </div>
              </div>

              <Button
                data-testid="signup-button"
                onClick={handleSignup}
                disabled={loading || !name || !age || !agreedToTerms}
                className="w-full gradient-amber text-black font-semibold h-12 rounded-xl hover:opacity-90"
              >
                {loading ? 'Creating Account...' : 'Get Started'}
              </Button>
            </div>
          )}
        </div>

        <p className="text-white/40 text-xs text-center mt-6">
          By continuing, you agree to SipZy's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
