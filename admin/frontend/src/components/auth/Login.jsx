import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Phone, Lock, ShieldCheck } from "lucide-react"

const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD

export default function Login({ onLogin }) {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simulate async check
    setTimeout(() => {
      if (phone === ADMIN_PHONE && password === ADMIN_PASSWORD) {
        // Store in sessionStorage (cleared when browser closes)
        sessionStorage.setItem("adminAuth", "true")
        onLogin()
      } else {
        setError("Invalid phone number or password")
      }
      setLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-amber mb-4">
            <ShieldCheck className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-white/60">SipZy Restaurant Management</p>
        </div>

        {/* Login Card */}
        <div className="glass-strong rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Input */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white/80">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter admin phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !phone || !password}
              className="w-full gradient-amber text-black font-semibold hover:opacity-90"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Warning Notice */}
          <div className="mt-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-amber-500 text-xs text-center">
              ⚠️ This is a temporary admin portal. Do not use for production.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
