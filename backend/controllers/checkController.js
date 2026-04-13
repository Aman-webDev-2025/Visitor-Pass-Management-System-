const CheckLog = require("../models/CheckLog");
const Visitor = require("../models/Visitor");

//scan visitor
exports.scanVisitor =async (req, res) =>{
  try{
    const {visitorId, action } = req.body;
    let visitor = await Visitor.findById(visitorId);
    if(!visitor){
      return res.status(404).json({message: "Visitor not found"});
    }

    if(!visitor.passIssued){
      return res.status(400).json({message: "Pass is not issued yet"})
    }

    //for checking visitor is inside or not
    let open = await CheckLog.findOne({
      visitorId: visitor._id,
      checkOut: null
    })

    if(action === "checkin"){
      if(open){
        return res.status(400).json({message: "Already checked in"});
      }
      let row = new CheckLog({
        visitorId: visitor._id,
        checkIn: new Date(),
        checkedBy: req.user.id
      })
      await row.save();
      
      console.log("Visitor check-in was saved for " + visitor.email);
      return res.json({ message: "Check-in successful"});
    }

    if(action === "checkout"){
      if(!open){
        return res.status(400).json({ message: "visitor has not check-in yet"})
      }
      open.checkOut = new Date();
      await open.save();
      console.log("Visitor check-out was saved for " + visitor.email);
      return res.json({ message: "Check-out successful"});
    }

    return res.status(400).json({message: "Invalid action"});
  } 
  catch(err){
    console.error("Cant scan visitor", err.message);
    res.status(500).json({message: "Scanning failed"});
  }
}