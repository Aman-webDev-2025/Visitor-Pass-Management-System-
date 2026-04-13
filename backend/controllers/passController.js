const Visitor = require("../models/Visitor");
const User = require("../models/User");

//view visitor pass by email
exports.viewPassByEmail = async(req, res) =>{
  try{
    const {email} = req.query;

    let visitor = await Visitor.findOne({email: email}).sort({createdAt: -1});
    if(!visitor){
      return res.status(404).json({message: "No visitor found with this email"});
    }

    let baseUrl = req.protocol + "://" + req.get("host") + "/uploads";
    let photoUrl = "";
    let passUrl = "";

    if(visitor.photo){
      photoUrl = baseUrl + "/photos/" + encodeURIComponent(visitor.photo);
    }

    if(visitor.passFile){
      passUrl = baseUrl + "/passes/" + encodeURIComponent(visitor.passFile);
    }

    console.log("Pass details for " + email);

    res.json({
      id: visitor._id,
      name: visitor.name,
      email: visitor.email,
      phone: visitor.phone,
      purpose: visitor.purpose,
      status: visitor.status,
      isScheduled: visitor.isScheduled,
      visitDate: visitor.visitDate,
      visitTime: visitor.visitTime,
      photoUrl: photoUrl,
      passUrl: passUrl,
      passIssued: visitor.passIssued
    })
  }
  catch(err){
    console.error("Error in pass detail", err.message);
    res.status(500).json({message: "Server error"});
  }
}


exports.viewOwnPass =async (req, res) =>{
  try{
    let user = await User.findById(req.user.id);

    if(!user || user.role !== "visitor"){
      return res.status(403).json({message: "Access denied"});
    }

    if(!user.visitorId){
      return res.status(404).json({message: "Visitor is not found"});
    }

    let visitor = await Visitor.findById(user.visitorId);
    if(!visitor){
      return res.status(404).json({message: "Visitor is not found"});
    }

    let baseUrl = req.protocol + "://" + req.get("host") + "/uploads";
    let photoUrl = "";
    let passUrl = "";

    if(visitor.photo){
      photoUrl = baseUrl + "/photos/" + encodeURIComponent(visitor.photo);
    }

    if(visitor.passFile){
      passUrl = baseUrl + "/passes/" + encodeURIComponent(visitor.passFile);
    }

    console.log("Visitor opened own pass " + visitor.email);

    res.json({
      id: visitor._id,
      name: visitor.name,
      email: visitor.email,
      phone: visitor.phone,
      purpose: visitor.purpose,
      status: visitor.status,
      isScheduled: visitor.isScheduled,
      visitDate: visitor.visitDate,
      visitTime: visitor.visitTime,
      photoUrl: photoUrl,
      passUrl: passUrl,
      passIssued: visitor.passIssued
    })
  } 
  catch(err){
    console.error("Error in pass loading", err.message);
    res.status(500).json({ message: "Server error"})
  }
}
