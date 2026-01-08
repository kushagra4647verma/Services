import { useState } from "react"
import { supabase } from "../../supabaseClient"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp"
import { Phone, GlassWater, User, Mail } from "lucide-react"
import { toast } from "@/components/ui/sonner"

const API_BASE = import.meta.env.VITE_API_BASE_URL

export default function Login({ onLogin }) {
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState("LOGIN") // LOGIN, SIGNUP, OTP
  const [mode, setMode] = useState(null) // "login" or "signup"
  const [loading, setLoading] = useState(false)
  const [devOtp, setDevOtp] = useState(null)

  // Fetch OTP from backend in dev mode
  async function fetchDevOtp(phoneNumber) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      const res = await fetch(`${API_BASE}/auth/dev-otp/91${phoneNumber}`, {
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      })
      if (res.ok) {
        const data = await res.json()
        setDevOtp(data.otp)
      }
    } catch (err) {
      // Dev OTP fetch failed silently
    }
  }

  // Login: Check if user exists, then send OTP
  async function handleLogin() {
    // console.log("[Login] Starting login flow for phone:", phone)
    
    if (phone.length !== 10) {
      toast.error("Enter a valid 10-digit phone number")
      return
    }

    setLoading(true)
    setOtp("")

    try {
      // Step 1: Check if user exists
      // console.log("[Login] Checking if user exists...")
      const { data: exists, error: rpcError } = await supabase.rpc("user_exists_by_phone", {
        p_phone: `91${phone}`,
      })

      // console.log("[Login] user_exists_by_phone result:", { exists, rpcError })

      if (rpcError) {
        console.error("[Login] RPC error:", rpcError)
        throw rpcError
      }

      if (!exists) {
        // console.log("[Login] User not found")
        toast.error("Account not found. Please create an account.")
        setLoading(false)
        return
      }

      // Step 2: Send OTP only if user exists
      // console.log("[Login] User exists, sending OTP...")
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${phone}`
      })

      // console.log("[Login] signInWithOtp result:", { error })

      if (error) {
        console.error("Send OTP error:", error)
        toast.error(error.message || "Failed to send OTP")
      } else {
        // console.log("[Login] OTP sent successfully, transitioning to OTP screen")
        toast.success("OTP sent successfully")
        setMode("login")
        setStep("OTP")
        setDevOtp(null)
        fetchDevOtp(phone)
      }
    } catch (err) {
      console.error("[Login] Caught error:", err)
      toast.error("Something went wrong. Please try again.")
    }

    setLoading(false)
    // console.log("[Login] Flow complete, loading set to false")
  }

  // Signup: Check user doesn't exist, then send OTP
  async function handleSignup() {
    if (phone.length !== 10) {
      toast.error("Enter a valid 10-digit phone number")
      return
    }
    if (!name.trim()) {
      toast.error("Please enter your name")
      return
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email")
      return
    }

    setLoading(true)
    setOtp("")

    try {
      // Step 1: Check if user already exists
      const { data: exists, error: rpcError } = await supabase.rpc("user_exists_by_phone", {
        p_phone: `91${phone}`,
      })

      if (rpcError) throw rpcError

      if (exists) {
        toast.error("Account already exists. Please login instead.")
        setStep("LOGIN")
        setLoading(false)
        return
      }

      // Step 2: Send OTP for new user with metadata
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${phone}`,
        options: {
          data: {
            name: name.trim(),
            email: email.trim(),
          },
        },
      })

      if (error) {
        console.error("Send OTP error:", error)
        toast.error(error.message || "Failed to send OTP")
      } else {
        toast.success("OTP sent successfully")
        setMode("signup")
        setStep("OTP")
        setDevOtp(null)
        fetchDevOtp(phone)
      }
    } catch (err) {
      console.error("Signup error:", err)
      toast.error("Something went wrong. Please try again.")
    }

    setLoading(false)
  }

  async function verifyOtp() {
    if (otp.length !== 6) {
      toast.error("Enter complete 6-digit OTP")
      return
    }

    setLoading(true)

    try {
      let result

      if (mode === "signup") {
        // Signup: Simple verification first
        result = await supabase.auth.verifyOtp({
          phone: `+91${phone}`,
          token: otp,
          type: "sms",
        })
        
        // After verification, update user metadata
        if (result.data?.session) {
          // console.log("[Signup] Updating user metadata...")
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              name: name.trim(),
              email: email.trim(),
            },
          })
          if (updateError) {
            console.error("[Signup] Failed to update user metadata:", updateError)
          } else {
            // console.log("[Signup] User metadata updated successfully")
          }
        }
      } else {
        // Login: Simple verification
        result = await supabase.auth.verifyOtp({
          phone: `+91${phone}`,
          token: otp,
          type: "sms"
        })
      }

      const { data, error } = result

      if (error) {
        console.error("OTP verification error:", error)
        if (error.status === 403) {
          toast.error("OTP expired or invalid. Please request a new OTP.")
          setOtp("")
        } else if (error.message?.includes("expired")) {
          toast.error("OTP has expired. Please request a new one.")
          setOtp("")
        } else {
          toast.error(error.message || "Invalid OTP")
        }
      } else if (data?.session) {
        toast.success(mode === "signup" ? "Account created successfully!" : "Logged in successfully")
        onLogin()
      } else {
        toast.error("Verification failed. Please try again.")
      }
    } catch (err) {
      console.error("Verify error:", err)
      toast.error("Something went wrong. Please try again.")
    }

    setLoading(false)
  }

  function resetForm() {
    setPhone("")
    setName("")
    setEmail("")
    setOtp("")
    setDevOtp(null)
    setMode(null)
    setStep("LOGIN")
  }

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
          {/* Login Screen */}
          {step === "LOGIN" && (
            <div className="space-y-6 animate-slide-up">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome!</h2>
                <p className="text-white/60 text-sm">Enter your phone number to continue</p>
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
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="glass border-white/20 text-white placeholder:text-white/40 h-12"
                  maxLength={10}
                />
              </div>

              <Button
                onClick={handleLogin}
                disabled={loading || phone.length !== 10}
                className="w-full gradient-amber text-black font-semibold h-12 rounded-xl hover:opacity-90"
              >
                {loading ? "Checking..." : "Send OTP"}
              </Button>

              <p className="text-center text-white/60 text-sm">
                Don't have an account?{" "}
                <button
                  onClick={() => setStep("SIGNUP")}
                  className="text-amber-500 hover:text-amber-400 font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
          )}

          {/* Signup Screen */}
          {step === "SIGNUP" && (
            <div className="space-y-6 animate-slide-up">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-white/60 text-sm">Fill in your details to get started</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/80 flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-500" />
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass border-white/20 text-white placeholder:text-white/40 h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/80 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-500" />
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass border-white/20 text-white placeholder:text-white/40 h-12"
                  />
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
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="glass border-white/20 text-white placeholder:text-white/40 h-12"
                    maxLength={10}
                  />
                </div>
              </div>

              <Button
                onClick={handleSignup}
                disabled={loading || phone.length !== 10 || !name.trim() || !email.includes("@")}
                className="w-full gradient-amber text-black font-semibold h-12 rounded-xl hover:opacity-90"
              >
                {loading ? "Checking..." : "Create Account"}
              </Button>

              <p className="text-center text-white/60 text-sm">
                Already have an account?{" "}
                <button
                  onClick={resetForm}
                  className="text-amber-500 hover:text-amber-400 font-medium"
                >
                  Login
                </button>
              </p>
            </div>
          )}

          {/* OTP Screen */}
          {step === "OTP" && (
            <div className="space-y-6 animate-slide-up">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Verify OTP</h2>
                <p className="text-white/60 text-sm">Enter the 6-digit code sent to +91{phone}</p>
              </div>

              {/* Dev mode OTP display */}
              {devOtp && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-center">
                  <p className="text-green-400 text-xs mb-1">OTP:</p>
                  <p className="text-green-300 text-2xl font-mono font-bold tracking-widest">{devOtp}</p>
                </div>
              )}

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
                    setStep(mode === "login" ? "LOGIN" : "SIGNUP")
                    setOtp("")
                    setDevOtp(null)
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
