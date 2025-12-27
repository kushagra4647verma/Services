import { useState } from "react"
import { supabase } from "./supabaseClient"

export default function App() {
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState("PHONE")

  const sendOtp = async () => {
    const { error } = await supabase.auth.signInWithOtp({ phone })
    if (error) alert(error.message)
    else setStep("OTP")
  }

  const verifyOtp = async () => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms"
    })

    if (error) alert(error.message)
      else setStep("DONE")
      // ✅ ACCESS TOKEN
  const accessToken = data.session.access_token
  const refreshToken = data.session.refresh_token
  const user = data.user

  console.log("Access Token:", accessToken)
  console.log("Refresh Token:", refreshToken)
  console.log("User:", user)

    
  }

  return (
    <div style={{ padding: 40 }}>
      {step === "PHONE" && (
        <>
          <h2>Login with Phone</h2>
          <input
            placeholder="+91xxxxxxxxxx"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <button onClick={sendOtp}>Send OTP</button>
        </>
      )}

      {step === "OTP" && (
        <>
          <h2>Enter OTP</h2>
          <input
            placeholder="123456"
            value={otp}
            onChange={e => setOtp(e.target.value)}
          />
          <button onClick={verifyOtp}>Verify OTP</button>
        </>
      )}

      {step === "DONE" && (
        <h2>Logged In ✅</h2>
      )}
    </div>
  )
}
