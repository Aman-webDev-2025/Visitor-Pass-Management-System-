import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import API, { getAuthConfig } from "../services/api";

function VisitorPass(){
  const navigate = useNavigate();
  
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() =>{
    async function loadPassData(){
      console.log("Loading visitor pass");
      try{
        const authConfig = getAuthConfig();
        const response = await API.get("/pass/my-pass", authConfig);
        
        console.log("Visitor pass is loaded");
        setVisitor(response.data);
      } 
      catch(err){
        console.error("Can't load visitor pass", err.message);
        alert("Sorry, can't load your pass details right now");
      } 
      finally{
        setLoading(false);
      }
    }

    loadPassData();
  }, []);

  const handleLogout = () => {
    console.log("Visitor logged out");
    localStorage.clear();
    navigate("/visitor");
  };

  if(loading === true){
    return(
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-400 font-bold animate-pulse">Loading Pass...</div>
      </div>
    );
  }

  if(visitor == null){
    return(
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-10">
        <div className="bg-white p-10 rounded-3xl shadow-sm text-center border border-gray-200">
          
          <h2 className="text-gray-800 font-bold mb-2">No Pass Available</h2>
          <p className="text-gray-500 mb-6 text-sm">We can't find a pass for your account.</p>
          <button 
            onClick={() => navigate("/visitor")} 
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700">
            Go Back
          </button>

        </div>
      </div>
    );
  }

  return(
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-md border border-gray-100 p-6 md:p-8">
        
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-2xl font-black text-gray-800">My Entry Pass</h1>
            <p className="text-gray-400 text-sm italic">Welcome, {visitor.name}</p>
          </div>

          <button 
            onClick={handleLogout} 
            className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100">
            Logout
          </button>

        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="w-32 h-32 bg-gray-100 rounded-2xl overflow-hidden border-2 border-gray-50 mx-auto md:mx-0 shadow-inner">
            {visitor.photoUrl ? (
              <img src={visitor.photoUrl} alt="Visitor" className="w-full h-full object-cover" />
            ):(
              <div className="flex items-center justify-center h-full text-gray-300 text-[10px] font-bold">IMAGE MISSING</div>
            )}
          </div>

          <div className="space-y-2 text-center md:text-left">
            <p className="text-sm text-gray-600"><strong>Email:</strong> {visitor.email}</p>
            <p className="text-sm text-gray-600"><strong>Mobile:</strong> {visitor.phone || "Not provided"}</p>
            <p className="text-sm text-gray-600"><strong>Status:</strong> {visitor.status}</p>
            <p className="text-sm text-gray-600">
              <strong>Visit Time:</strong> {visitor.isScheduled ? `${visitor.visitDate} at ${visitor.visitTime}` : "Waiting for schedule"}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center">
          {visitor.passIssued && visitor.id ? (
            <div className="text-center">
              <p className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Scan at Entry</p>
              <div className="bg-white p-4 rounded-2xl inline-block shadow-sm mb-6 border border-gray-100">
                <QRCode value={String(visitor.id)} size={150} />
              </div>
            </div>
          ) : null}

          {visitor.passUrl ? (
            <a
              href={visitor.passUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-green-600 text-white text-center py-4 rounded-xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all">
              DOWNLOAD PDF PASS
            </a>
          ) : (
            <div className="text-center p-4">
              <p className="text-sm text-gray-400 italic">
                Note: Your pass will be generated after approval and scheduling was complete.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default VisitorPass;
