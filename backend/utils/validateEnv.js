function validateEnv() {

  if(!process.env.MONGO_URI || process.env.MONGO_URI.trim() === ""){
    throw new Error("MONGO_URI is missing in .env");
  }
  if(!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === ""){
    throw new Error("JWT_SECRET is missing in .env");
  }

  if(!process.env.EMAIL_KEY || !process.env.EMAIL_FROM){
    console.warn("Email settings are missing so OTP mail may not work");
  }
  if(
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_PHONE_NUMBER) 
  {
    console.warn("Twilio settings are missing so SMS may not work");
  }
}

module.exports = validateEnv;
