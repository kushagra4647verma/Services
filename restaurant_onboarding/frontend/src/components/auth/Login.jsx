import { useState } from "react"
import { supabase } from "../../supabaseClient"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp"
import { Phone, GlassWater } from "lucide-react"
import { toast } from "@/components/ui/sonner"

export default function Login({ onLogin }) {
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState("PHONE")
  const [loading, setLoading] = useState(false)

  async function sendOtp() {
    if (phone.length !== 10) {
      toast.error("Enter a valid 10-digit phone number")
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone}`
    })

    setLoading(false)

    if (error) {
      toast.error("Failed to send OTP")
    } else {
      toast.success("OTP sent successfully")
      setStep("OTP")
    }
  }

  async function verifyOtp() {
    if (otp.length !== 6) {
      toast.error("Enter complete 6-digit OTP")
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: otp,
      type: "sms"
    })

    setLoading(false)

    if (error) {
      toast.error("Invalid OTP")
    } else {
      toast.success("Logged in successfully")
      onLogin()
    }
  }

  return (
  <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
    {/* Background decoration */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-amber-500 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-500 blur-[120px]" />
    </div>

    <div className="relative z-10 max-w-md">
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
        {step === "PHONE" && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome!
              </h2>
              <p className="text-white/60 text-sm">
                Enter your phone number to get started
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/80 flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="10-digit phone number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="glass border-white/20 text-white placeholder:text-white/40 h-12"
                maxLength={10}
              />
            </div>

            <Button
              onClick={sendOtp}
              disabled={loading || phone.length !== 10}
              className="w-full gradient-amber text-black font-semibold h-12 rounded-xl hover:opacity-90"
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </div>
        )}

        {step === "OTP" && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Verify OTP
              </h2>
              <p className="text-white/60 text-sm">
                Enter the 6-digit code sent to +91{phone}
              </p>
            </div>

            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  {[...Array(6)].map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="glass border-white/20 text-white w-12 h-14 text-xl"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="space-y-3">
              <Button
                onClick={verifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full gradient-amber text-black font-semibold h-12 rounded-xl hover:opacity-90"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setStep("PHONE")
                  setOtp("")
                }}
                className="w-full text-white/60 hover:text-white"
              >
                Change Phone Number
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="text-white/40 text-xs text-center mt-6">
        By continuing, you agree to SipZy's Terms of Service and Privacy Policy
      </p>
    </div>
  </div>
)

}
