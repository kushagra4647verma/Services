import { useState } from "react"
import { supabase } from "../../supabaseClient"

export default function Login({ onLogin }) {
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState("PHONE")

  async function sendOtp() {
    await supabase.auth.signInWithOtp({ phone })
    setStep("OTP")
  }

  async function verifyOtp() {
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms"
    })
    if (!error) onLogin()
  }

  return (
    <>
      {step === "PHONE" && (
        <>
          <input placeholder="+91..." value={phone} onChange={e => setPhone(e.target.value)} />
          <button onClick={sendOtp}>Send OTP</button>
        </>
      )}
      {step === "OTP" && (
        <>
          <input placeholder="OTP" value={otp} onChange={e => setOtp(e.target.value)} />
          <button onClick={verifyOtp}>Verify</button>
        </>
      )}
    </>
  )
}
