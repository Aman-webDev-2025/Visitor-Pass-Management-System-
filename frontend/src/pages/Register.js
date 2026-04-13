import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Register(){
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [isSaving, setIsSaving] = useState(false);

  const handleFormSubmit = async(e) =>{
    e.preventDefault();
    if(!name || !email || !password){
      alert("Please fill all required fields!")
      return;
    }

    if(password.length < 6){
      alert("Password length is must be greater then 6");
      return;
    }
    setIsSaving(true);
    console.log("Creating staff account for " + name);

    try{
      const userData = {
        name: name,
        email: email,
        password: password,
        role: role
      };

      await API.post("/auth/register", userData);
      alert("Registration successful! You can now login");
      navigate("/");
    } 
    catch(err){
      console.error("Can't create staff account", err.message);
      const msg = err.response?.data?.message || "Can't create staff account";
      alert(msg);
    } 
    finally{
      setIsSaving(false);
    }
  }

  return(
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-black text-gray-800 mb-6">Staff Join Form</h2>
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 ml-1">FULL NAME</label>
              <input
                className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-green-400"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}/>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 ml-1">EMAIL</label>
              <input
                className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-green-400"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}/>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 ml-1 ">PASSWORD</label>
              <input
                type="password"
                className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-green-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}/>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 ml-1">ASSIGN ROLE</label>
              <select 
                className="w-full border-2 border-gray-100 p-3 rounded-xl outline-none bg-white"
                value={role}
                onChange={(e) => setRole(e.target.value)}>

                <option value="employee">Employee</option>
                <option value="security">Security Desk</option>
                <option value="admin">Admin</option>
              </select>

            </div>

            <button 
              type="submit" 
              disabled={isSaving}
              className={`w-full p-4 rounded-xl font-bold text-white transition-all ${isSaving ? 'bg-gray-300' : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100'}`}>
              {isSaving ? "Saving..." : "Create Account"}
            </button>
          </form>

        </div>

        <div className="text-center mt-6">
          <button 
            onClick={() => navigate("/")} 
            className="text-sm text-gray-400 hover:text-blue-500 font-medium">
            Already have an account? Log in
          </button>
          
        </div>
      </div>
    </div>
  );
}

export default Register;
