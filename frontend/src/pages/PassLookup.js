import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getAuthConfig } from "../services/api";

function PassLookup(){
  const navigate = useNavigate();
  
  const [visitorEmail, setVisitorEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [passData, setPassData] = useState(null);

  const doSearch = async() =>{
    if(visitorEmail === ""){
      alert("Please enter email first");
      return;
    }
    console.log("Looking for pass for " + visitorEmail);
    setIsSearching(true);

    try{
      const response = await API.get(
        `/pass/view?email=${visitorEmail}`, 
        getAuthConfig()
      )
      console.log("Visitor pass was found")
      setPassData(response.data);
    } 
    catch(err){
      console.error("Not get visitor pass", err.message);
      setPassData(null);
      
      if(err.response && err.response.data){
        alert(err.response.data.message);
      } 
      else{
        alert("We can't find pass for this email");
      }
    } 
    finally{
      setIsSearching(false);
    }
  }

  return(
    <div className="bg-gray-200 min-h-screen p-10">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-md">
        
        <div className="flex justify-between mb-8">

          <h1 className="text-xl font-black text-gray-800">Find Visitor Pass</h1>
          <button 
            onClick={() => navigate("/dashboard")} 
            className="text-blue-500 hover:text-blue-700 font-bold">
            Go Back
          </button>

        </div>

        <div className="space-y-4">

          <label className="text-sm text-gray-500 font-semibold">Enter Visitor's Registered Email</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border-2 border-gray-100 p-3 rounded-xl outline-none focus:border-blue-300"
              placeholder="e.g. visitor@gmail.com"
              value={visitorEmail}
              onChange={(e) => setVisitorEmail(e.target.value)}/>

            <button
              onClick={doSearch}
              disabled={isSearching}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:opacity-90">
              {isSearching ? "..." : "Find"}
            </button>
            
          </div>
        </div>

        {passData != null && (
          <div className="mt-10 p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">{passData.name}</h2>
            <p className="text-gray-500 text-sm mb-4">{passData.email}</p>
            
            <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-2">
              <p className="text-sm"><strong>Status:</strong> {passData.status}</p>
              <p className="text-sm">
                <strong>Visit Date:</strong> {passData.isScheduled ? passData.visitDate : "Not fixed"}
              </p>
            </div>

            <div className="mt-6">
              {passData.passUrl ? (
                <a
                  href={passData.passUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center bg-green-500 text-white p-4 rounded-xl font-black hover:bg-green-600">
                  VIEW PDF PASS
                </a>

              ):(
                <div className="text-center p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
                  The pass is not been been generated yet.
                </div>
              )}
            </div>
          </div>
        )}

        {!passData && !isSearching && (
          <div className="mt-10 text-center text-gray-400 text-xs italic">
            Enter an email above to search the visitor records.
          </div>
        )}

      </div>
    </div>
  );
}

export default PassLookup;
