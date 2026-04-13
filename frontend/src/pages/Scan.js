import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import API, { getAuthConfig } from "../services/api";
import { useNavigate } from "react-router-dom";

function Scan(){
  const navigate = useNavigate();
  const [scanType, setScanType] = useState("checkin");

  useEffect(() =>{
    let isLocked = false;

    console.log("Scanner started" + scanType + " mode");

    const scannerInstance = new Html5QrcodeScanner("reader", { 
      fps: 8, 
      qrbox: { width: 250, height: 250} 
    })

    const onScanSuccess = async(qrCodeData) =>{
      if(isLocked) return;
      isLocked = true;

      console.log("QR code was scanned successful");

      try{
        const auth = getAuthConfig();
        const response = await API.post(
          "/check/scan",
          {visitorId: qrCodeData, action: scanType },
          auth
        )
        alert("SUCCESS: " + response.data.message);
        
        await scannerInstance.clear();
        navigate("/dashboard");

      }catch(err){
        console.error("Scan is failed", err.message);
        const errorMsg = err.response?.data?.message || "Scan failed. Try again";
        alert(errorMsg);
        isLocked = false;
      }
    }

    const onScanError = () =>{
    }
    scannerInstance.render(onScanSuccess, onScanError);

    return () =>{
      scannerInstance.clear().catch((e) => console.warn("Scanner had a problem", e.message));
    }
  }, [scanType, navigate]);

  return(
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <h1 className="text-2xl font-black text-gray-800 mb-2">QR Guard Scanner</h1>
      <p className="text-gray-500 text-sm mb-8">Point the camera at the visitor's pass</p>

      <div className="bg-white p-2 rounded-2xl shadow-sm flex gap-2 mb-10 border border-gray-200">
        <button
          onClick={() => setScanType("checkin")}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${
            scanType === "checkin" ? "bg-green-600 text-white shadow-lg" : "bg-transparent text-gray-400"
          }`}>
          Check-In
        </button>

        <button
          onClick={() => setScanType("checkout")}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${
            scanType === "checkout" ? "bg-orange-500 text-white shadow-lg" : "bg-transparent text-gray-400"
          }`}>
          Check-Out
        </button>
      </div>

      <div className="w-full max-w-[450px] overflow-hidden rounded-3xl border-8 border-white shadow-2xl bg-gray-200">
        <div id="reader" style={{ width: "100%" }}></div>
      </div>

      <button
        onClick={() => navigate("/dashboard")}
        className="mt-12 text-gray-400 hover:text-gray-700 font-bold uppercase text-xs tracking-widest">
         Cancel & Go Back
      </button>
    </div>
  );
}

export default Scan;
