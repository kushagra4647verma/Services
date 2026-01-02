import { useState } from "react"
import { supabase } from "./supabase"

export default function App() {
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState("PHONE")
  const [token, setToken] = useState("")

  const sendOtp = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      phone
    })

    if (error) {
      alert(error.message)
    } else {
      setStep("OTP")
      alert("OTP sent")
    }
  }

  const verifyOtp = async () => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms"
    })

    if (error) {
      alert(error.message)
    } else {
      const accessToken = data.session.access_token
      setToken(accessToken)
      setStep("DONE")
    }
  }

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h2>Supabase Phone Login (Test)</h2>

      {step === "PHONE" && (
        <>
          <input
            placeholder="+91xxxxxxxxxx"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <br /><br />
          <button onClick={sendOtp}>Send OTP</button>
        </>
      )}

      {step === "OTP" && (
        <>
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
          />
          <br /><br />
          <button onClick={verifyOtp}>Verify OTP</button>
        </>
      )}

      {step === "DONE" && (
        <>
          <h3>✅ Login Successful</h3>
          <p><b>Access Token (copy this):</b></p>
          <textarea
            rows={10}
            cols={80}
            readOnly
            value={token}
          />
        </>
      )}
    </div>
  )
}
