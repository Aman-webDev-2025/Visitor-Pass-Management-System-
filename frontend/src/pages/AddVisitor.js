import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getAuthConfig } from "../services/api";

const AddVisitor = () =>{
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState("");
  const [photo, setPhoto] = useState(null);

  const handleFormSubmit = async(e) =>{
    e.preventDefault();

    if(!name || !email || !phone){
      return alert("Required fields: Name, Email, and Phone Number");
    }

    setLoading(true);
    const data = new FormData();
    data.append("name", name);
    data.append("email", email);
    data.append("phone", phone);

    if(purpose){
      data.append("purpose", purpose);
    }

    if(photo){
      data.append("photo", photo);
    }

    try{
      const authHeader = getAuthConfig();
      await API.post("/visitors", data, authHeader);
      
      console.log("Visitor added successfully");
      navigate("/dashboard");
    } 
    catch(error){
      console.error("Can't  add visitor right now", error.message);
      const errMsg = error.response?.data?.message || "Something went wrong Please try again later";
      alert(errMsg);
    } 
    finally{
      setLoading(false);
    }
  }

  return(
    <div className="flex justify-center mt-12 px-4">
      <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">

        <h1 className="text-xl font-semibold text-gray-900 mb-5">Visitor Registration</h1>
        
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          <input 
            className="p-3 border-2 rounded-md hover:border-blue-500 outline-none" 
            placeholder="Full Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input 
            type="email"
            className="p-3 border-2 rounded-md hover:border-blue-500 outline-none" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            className="p-3 border-2 rounded-md hover:border-blue-500 outline-none" 
            placeholder="Phone Number" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input 
            className="p-3 border-2 rounded-md hover:border-blue-500 outline-none" 
            placeholder="Purpose of visit..." 
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
          
          <div className="p-3 border-2 rounded-md text-center">
            <label className="text-sm text-blue-500 hover:text-blue-800">
              {photo ? photo.name : "Select Visitor Photo"}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => setPhoto(e.target.files[0])}
              />
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`mt-2 py-3 rounded-md text-white font-medium ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {loading ? "Processing..." : "Add Visitor"}
          </button>

          <button 
            type="button"
            onClick={() => navigate("/dashboard")} 
            className="text-gray-400 text-xs hover:text-gray-600">
            GO BACK
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddVisitor;
