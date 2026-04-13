import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function VisitorPortal(){
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  function saveVisitorSession(data){
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.user.id);
    localStorage.setItem("role", data.user.role);
    localStorage.setItem("userName", data.user.name);

    if(data.user.visitorId){
      localStorage.setItem("visitorId", data.user.visitorId);
    }
  }

  async function handleRegister(e){
    e.preventDefault();

    if(!name || !email || !phone || !password){
      alert("Please fill all required fields");
      return;
    }

    if(password.length < 6){
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("purpose", purpose);
    formData.append("password", password);

    if(photo){
      formData.append("photo", photo);
    }

    try{
      const res = await API.post("/auth/visitor/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Visitor registration form submitted");
      alert(res.data.message);

      setOtpEmail(email);
      setLoginEmail(email);
      setName("");
      setEmail("");
      setPhone("");
      setPurpose("");
      setPassword("");
      setPhoto(null);
    } 
    catch(err){
      console.error("Visitor registration is failed", err.message);
      alert(err.response?.data?.message || "Visitor registration failed");
    } 
    finally{
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();

    if(!otpEmail || !otp){
      alert("Enter email and OTP");
      return;
    }

    try{
      const res = await API.post("/auth/visitor/verify-otp", {
        email: otpEmail,
        otp: otp,
      });

      console.log("Visitor email verified");
      alert(res.data.message);
    } 
    catch(err){
      console.error("OTP verification is been failed", err.message);
      alert(err.response?.data?.message || "OTP verification failed");
    }
  }

  async function handleResendOtp() {
    if(!otpEmail){
      alert("Enter email first");
      return;
    }

    try{
      const res = await API.post("/auth/visitor/resend-otp", { email: otpEmail });
      console.log("OTP sent again");
      alert(res.data.message);
    } 
    catch(err){
      console.error("Can't send OTP again", err.message);
      alert(err.response?.data?.message || "Can't resend OTP");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();

    if(!loginEmail || !loginPassword){
      alert("Enter email and password");
      return;
    }

    try{
      const res = await API.post("/auth/visitor/login", {
        email: loginEmail,
        password: loginPassword,
      })

      saveVisitorSession(res.data);
      console.log("Visitor login worked");
      navigate("/visitor/pass");
    } 
    catch(err){
      console.error("Visitor login is been failed", err.message);
      alert(err.response?.data?.message || "Visitor login failed");
    }
  }

  
  return(
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Visitor Self Registration</h2>
              <p className="mt-2 text-sm text-gray-500">Register, verify OTP, then login to see your pass.</p>
            </div>

            {localStorage.getItem("role") === "visitor" && localStorage.getItem("token") && (
              <button
                type="button"
                onClick={() => navigate("/visitor/pass")}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                Open My Pass
              </button>
            )}
          </div>

          <form onSubmit={handleRegister} className="grid gap-4">
            <input
              className="rounded-lg border p-3"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}/>

            <input
              className="rounded-lg border p-3"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}/>

            <input
              className="rounded-lg border p-3"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}/>

            <input
              className="rounded-lg border p-3"
              placeholder="Purpose of Visit"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}/>

            <input
              type="password"
              className="rounded-lg border p-3"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}/>

            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
              <p className="mb-2 text-sm font-medium text-gray-700">Photo (optional)</p>
              <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
              {photo && <p className="mt-2 text-xs text-gray-500">{photo.name}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 p-4 font-bold text-white hover:bg-blue-700 disabled:bg-gray-400">
              {loading ? "Submitting..." : "Register Visitor"}
            </button>

          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-bold text-gray-800">Verify OTP</h3>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                className="w-full rounded-lg border p-3"
                placeholder="Email"
                value={otpEmail}
                onChange={(e) => setOtpEmail(e.target.value)}/>
              <input
                className="w-full rounded-lg border p-3"
                placeholder="6 digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}/>
              
              <button type="submit" className="w-full rounded-lg bg-green-600 p-3 font-bold text-white hover:bg-green-700">
                Verify Email
              </button>
              <button type="button" onClick={handleResendOtp} className="w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-700 hover:bg-gray-50">
                Resend OTP
              </button>

            </form>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-bold text-gray-800">Visitor Login</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              
              <input
                className="w-full rounded-lg border p-3"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}/>
              
              <input
                type="password"
                className="w-full rounded-lg border p-3"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}/>

              <button type="submit" className="w-full rounded-lg bg-gray-800 p-3 font-bold text-white hover:bg-gray-900">Login and View Pass</button>
            
            </form>
          </div>
        </div>

        <button type="button" onClick={() => navigate("/")} className="text-sm font-medium text-gray-600 underline hover:text-blue-600">
          Back to Staff Login
        </button>
        
      </div>
    </div>
  );
}

export default VisitorPortal;
