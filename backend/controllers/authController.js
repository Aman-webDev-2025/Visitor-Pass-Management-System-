const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Visitor = require("../models/Visitor");
const sendMail = require("../utils/sendMail");

//for generating otp
function makeOtp() {
  let n = Math.floor(100000 + Math.random() * 900000);
  return String(n);
}

//staff registeration
const registerUser = async (req, res) =>{
  try{
    const {name, email, password, role}= req.body;

    if(role === "visitor"){
      return res.status(400).json({message: "Visitors should use only visitor portal" })
    }

    let already = await User.findOne({email: email })
    if(already){
      return res.status(400).json({message: "User already exists"});
    }

    let hash = await bcrypt.hash(password, 10);
    let u = await User.create({
      name: name,
      email: email,
      password: hash,
      role: role || "employee",
      isEmailVerified: true,
    });

    console.log("Staff account is created with this email" + u.email);

    //send back json data but without password
    res.status(201).json({
      message: "Registered",
      user:{
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        visitorId: u.visitorId || null,
      }
    })
  } 
  catch(err){
    console.error("Can't create staff account right now", err.message);
    res.status(500).json({message: "Registration failed"})
  }
}

//login for staff
const loginUser = async(req, res) =>{
  try{
    const{email, password} = req.body;

    let user = await User.findOne({email: email})
    if(!user){
      return res.status(400).json({message: "User not found" })
    }

    if(user.role === "visitor"){
      return res.status(400).json({message: "Please use visitor login" })
    }

    let ok = await bcrypt.compare(password, user.password);
    if(!ok){
      return res.status(400).json({message: "Invalid password" });
    }

    let token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        role: user.role,
        visitorId: user.visitorId || null
      },
      process.env.JWT_SECRET,
      {expiresIn: "24h"}
    )

    console.log("Staff logged in successfull" + user.email);
    res.json({
      token: token,
      user:{
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        visitorId: user.visitorId || null
      }
    })
  } 
  catch(err){
    console.error("Can't login staff right now", err.message);
    res.status(500).json({message: "Login failed"});
  }
}

//visitor signup by self 
const registerVisitor = async(req, res) =>{
  try{
    const {name, email, password, phone, purpose } = req.body;

    let hash = await bcrypt.hash(password, 10);
    let otp = makeOtp()
    let otpUntil = new Date(Date.now() + 10 * 60 * 1000);

    let photoFile = "";
    if(req.file){
      photoFile = req.file.filename;
    }

    let user = await User.findOne({email: email });
    let brandNew = false;

    if(user && user.role !== "visitor"){
      return res.status(400).json({message: "This email is already exists"})
    }

    if(user && user.role === "visitor" && user.isEmailVerified){
      return res.status(400).json({message: "Your account already exists. Please log in"});
    }

    if(!user){
      user = await User.create({
        name: name,
        email: email,
        password: hash,
        phone: phone,
        role: "visitor",
        isEmailVerified: false,
        otpCode: otp,
        otpExpiresAt: otpUntil
      })
      brandNew = true;
    } 
    else{
      user.name = name;
      user.phone = phone;
      user.password = hash;
      user.isEmailVerified = false;
      user.otpCode = otp;
      user.otpExpiresAt = otpUntil;
      await user.save();
    }

    //visitor document
    let v = null;
    if(user.visitorId){
      v = await Visitor.findById(user.visitorId);
    }
    if(!v){
      v = await Visitor.findOne({email: email}).sort({ createdAt: -1 });
    }
    if(!v){
      v = new Visitor({status: "pending"})
    }

    v.userId = user._id;
    v.name = name;
    v.email = email;
    v.phone = phone;
    if(purpose){
      v.purpose = purpose;
    } 
    else{
      v.purpose = "General Visit";
    }
    if(photoFile){
      v.photo = photoFile;
    }
    await v.save();

    if(!user.visitorId || String(user.visitorId) !== String(v._id)){
      user.visitorId = v._id;
      await user.save();
    }

    let mailOk = await sendMail.sendOtpEmail(email, otp, name);

    console.log("Visitor registration was saved for " + email);
    res.status(brandNew ? 201 : 200).json({
      message: mailOk  ? "OTP has sent to your email."  : "Registered, but OTP could not be sent. Please resend OTP."
    })
  } 
  catch(err){
    console.error("Could not save visitor registration", err.message);
    res.status(500).json({message: "Visitor registration failed" });
  }
}

//for sending otp
const verifyVisitorOtp = async(req, res) =>{
  try{
    const {email, otp} = req.body;

    let user = await User.findOne({email: email, role: "visitor"})
    if(!user){
      return res.status(404).json({message: "Visitor account not found"})
    }

    if(user.isEmailVerified){
      return res.json({message: "Email is already verified. Please log in." })
    }

    if(!user.otpCode || user.otpCode !== otp){
      return res.status(400).json({message: "Invalid OTP" });
    }

    if(!user.otpExpiresAt || user.otpExpiresAt < new Date()){
      return res.status(400).json({message: "OTP is expired. Please request a new OTP" });
    }

    user.isEmailVerified = true;
    user.otpCode = "";
    user.otpExpiresAt = null;
    await user.save();

    if(user.visitorId){
      await Visitor.findByIdAndUpdate(user.visitorId, {emailVerifiedAt: new Date()})
    }

    console.log("Visitor email was verified for " + email);
    res.json({message: "Email verified successfully. You can now log in"});
  } 
  catch(err){
    console.error("Could not verify visitor email", err.message);
    res.status(500).json({message: "OTP verification failed"})
  }
}

//for resending otp
const resendVisitorOtp = async(req, res) =>{
  try{
    const {email} = req.body;
    let user = await User.findOne({ email: email, role: "visitor" })

    if(!user){
      return res.status(404).json({message: "Visitor account is not found"});
    }

    if(user.isEmailVerified){
      return res.status(400).json({message: "Email is already verified. Please log in" });
    }

    user.otpCode = makeOtp();
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    let mailOk = await sendMail.sendOtpEmail(user.email, user.otpCode, user.name);

    console.log("OTP was sent again to " + email);
    res.json({
      message: mailOk ? "new OTP has been sent to your email" : "Can't send OTP right now. Please try again later"
    })
  } 
  catch(err){
    console.error("Could not send OTP again", err.message);
    res.status(500).json({message: "Can't resend OTP"})
  }
}


//visitor login
const loginVisitor = async(req, res) =>{
  try{
    const {email, password } = req.body;

    let user = await User.findOne({email: email ,role: "visitor"})
    if(!user){
      return res.status(400).json({message: "Visitor account not found"});
    }

    if(!user.isEmailVerified){
      return res.status(403).json({message: "Please verify your email first"});
    }

    let ok = await bcrypt.compare(password, user.password);
    if(!ok){
      return res.status(400).json({message: "Invalid password" })
    }

    let token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        role: user.role,
        visitorId: user.visitorId || null
      },
      process.env.JWT_SECRET,
      {expiresIn: "24h"}
    )

    console.log("Visitor logged in " + user.email);

    res.json({
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        visitorId: user.visitorId || null
      }
    })
  } 
  catch(err){
    console.error("Visitor login did not work", err.message);
    res.status(500).json({message: "Visitor login failed" })
  }
}


//get user
const getUsers = async(req, res) =>{
  try{
    let list = await User.find({role: { $ne: "visitor" }})
      .select("-password -otpCode -otpExpiresAt")
      .sort({ role: 1, name: 1 });
    res.json(list);
  } 
  catch(err){
    console.error("Could not load staff users", err.message);
    res.status(500).json({message: "Error in fetching users"});
  }
}


//delete user
const deleteUser = async (req, res) =>{
  try{
    const {id} = req.params;

    if(!id){
      return res.status(400).json({message: "User id is required"})
    }

    if(!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400).json({message: "Invalid user id"});
    }

    if(String(req.user.id) === String(id)){
      return res.status(400).json({message: "You can'nt delete your own account" });
    }

    let user = await User.findById(id).select("_id name email role");
    if(!user){
      return res.status(404).json({message: "User not found"});
    }

    if(user.role === "visitor"){
      return res.status(400).json({message: "Use visitor records for visitor management"});
    }
    await User.findByIdAndDelete(id);
    
    console.log("Staff account was deleted for " + user.email);
    res.json({ message: "User deleted successfully" });
  } 
  catch(err){
    console.error("Can't delete staff account", err.message);
    res.status(500).json({ message: "Could not delete user"});
  }
}


module.exports = {
  registerUser,
  loginUser,
  registerVisitor,
  verifyVisitorOtp,
  resendVisitorOtp,
  loginVisitor,
  getUsers,
  deleteUser,
};
