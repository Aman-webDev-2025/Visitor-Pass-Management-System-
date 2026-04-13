import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Login(){
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) =>{
    event.preventDefault();

    if(email === "" || password === ""){
      alert("Both fields are required");
      return;
    }
    setLoading(true);

    try{
      const response = await API.post("/auth/login", {
        email: email,
        password: password
      })

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.user.id);
      localStorage.setItem("role", response.data.user.role);
      localStorage.setItem("userName", response.data.user.name);

      console.log("Staff has successfull login");
      navigate("/dashboard");
    } 
    catch(error){
      console.error("Staff login failed", error.message);

      if(error.response){
        alert(error.response.data.message);
      } 
      else{
        alert("Login failed. Please check your connection");
      }
    } 
    finally{
      setLoading(false);
    }
  }

  return(
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-sm">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">Staff Sign In</h2>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm mb-1 ml-1 text-gray-600">Email Address</label>
            <input
              type="email"
              className="w-full border-2 p-3 rounded-xl hover:border-blue-400 outline-none"
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm mb-1 ml-1 text-gray-600">Password</label>
            <input
              type="password"
              className="w-full border-2 p-3 rounded-xl hover:border-blue-400 outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all">
            {loading ? "Checking..." : "Login Now"}
          </button>
        </form>

        <div className="mt-8 space-y-3">
          <p className="text-center text-xs text-gray-400 font-bold">OTHER OPTIONS</p>
          
          <button
            onClick={() => navigate("/register")}
            className="w-full py-3 text-sm text-blue-600 border-2 border-blue-200 rounded-xl hover:bg-blue-100">
            Create Staff Account
          </button>
          
          <button
            onClick={() => navigate("/visitor")}
            className="w-full py-3 text-sm text-gray-500 hover:text-gray-800">
            Open Visitor Portal
          </button>
          
        </div>
      </div>
    </div>
  );
}

export default Login;
