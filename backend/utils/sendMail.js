const fs = require("fs");
const twilio = require("twilio");


async function sendEmail(to, subject, text, pdfPath){
  if(!to){
    console.warn("Email address is missing");
    return false;
  }

  let key = process.env.EMAIL_KEY;
  let from = process.env.EMAIL_FROM;
  let senderName = process.env.EMAIL_NAME || "Visitor Pass";

  if(!key || !from){
    console.warn("Email settings are missing");
    return false;
  }

  let body = {
    sender: {name: senderName, email: from},
    to: [{ email: to }],
    subject: subject,
    textContent: text
  }

  //attachment fix
  if(pdfPath && fs.existsSync(pdfPath)){

    let buf = fs.readFileSync(pdfPath);
    let b64 = buf.toString("base64");

    body.attachments = [
      {
        name: "visitor-pass.pdf",
        content: b64,
      }]
  }

  try{
    let res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": key,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    let data = await res.json();

    if(!res.ok){
      console.error("Email service error", data.message || JSON.stringify(data));
      return false
    }

    console.log("Email was sent to " + to);
    return true;

  } 
  catch(err){
    console.error("Error in email sending", err.message);
    return false;
  }
}

//sms
async function sendSMS(phone, text){
  let num = phone;

  if(!num){
    console.warn("Phone number is missing for SMS");
    return false;
  }

  if(num.length === 10){
    num = "+91" + num;
  }

  let sid = process.env.TWILIO_ACCOUNT_SID;
  let token = process.env.TWILIO_AUTH_TOKEN;
  let fromNum = process.env.TWILIO_PHONE_NUMBER;

  if(!sid || !token || !fromNum){
    console.warn("SMS settings are missing");
    return false;
  }

  try{
    let client = twilio(sid, token);

    let msg = text + " (check email or portal for details)";

    await client.messages.create({
      body: msg,
      from: fromNum,
      to: num,
    })

    console.log("SMS was sent");
    return true;

  } 
  catch(err){
    console.error("Error in SMS sending ", err.message);
    return false;
  }
}


async function sendMail(to, subject, text, pdfPath, phone){
  let out = {emailSent: false, smsSent: false};

  out.emailSent = await sendEmail(to, subject, text, pdfPath);
  out.smsSent = await sendSMS(phone, text);

  return out;
}

//otp
async function sendOtpEmail(to, otp, name){
  let sub = "Your OTP code";
  let txt = "Hi " + (name || "visitor") + ", your otp is " + otp + " (10 min)";
  return sendEmail(to, sub, txt);
}


module.exports = {
  sendMail,
  sendEmail,
  sendSMS,
  sendOtpEmail,
}
