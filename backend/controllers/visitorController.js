const path = require("path");
const QRCode = require("qrcode");
const Visitor = require("../models/Visitor");
const CheckLog = require("../models/CheckLog");
const sendMail = require("../utils/sendMail");
const generatePass = require("../utils/generatePass");


//visitor pre-regstation
exports.preregisterVisitor = async(req, res) =>{
  try{
    const {name ,phone, email, purpose} = req.body;

    if(!req.file){
      console.warn("Visitor pre-registration came without photo " + email);
    }

    let visitor = new Visitor({
      name: name,
      phone: phone,
      email: email,
      purpose: purpose || "General Visit",
      photo: req.file ? req.file.filename : "",
      visitDate: "",
      visitTime: "",
      isScheduled: false,
      status: "pending"
    })
    await visitor.save();
    
    console.log("Visitor pre-registration was saved for " + visitor.email);
    res.status(201).json({
      message: "Pre-registration done",
      visitor: visitor
    })
  } 
  catch(err){
    console.error("Error in pre-registration", err.message);
    res.status(500).json({message: "Can't register right now. Please try again later"});
  }
}

//add visitor from dashboard
exports.addVisitor= async (req, res) =>{
  try{
    const {name, phone, email , purpose} = req.body;

    if(!req.file){
      console.warn("Visitor was added without photo " + email);
    }

    let visitor =new Visitor({
      name: name,
      phone: phone,
      email: email,
      purpose: purpose || "General Visit",
      photo: req.file ? req.file.filename : "",
      visitDate: "",
      visitTime: "",
      isScheduled: false,
      status: "pending"
    })

    await visitor.save();

    console.log("visitor added successfully " + visitor.name);
    res.status(201).json({
      message: "Visitor added",
      visitor: visitor
    })
  } 
  catch(err){
    console.error("Error in adding visitor", err.message);
    res.status(500).json({message: "Failed to add visitor"})
  }
}


//get visitor by status or name
exports.getVisitors = async (req, res)=> {
  try{
    const {search, status} = req.query;
    let filter = {};

    if(search){
      filter.name = { $regex: search, $options: "i"}
    }

    if(status && status !== "all"){
      filter.status = status;
    }

    let visitors = await Visitor.find(filter).sort({ createdAt: -1 });
    let out = [];

    //dashboards cards
    let summary = {
      total: visitors.length,
      pending: 0,
      approved: 0,
      checkedIn: 0,
      checkedOut: 0,
    };

    for(let i=0 ; i<visitors.length ; i++){
      let row = visitors[i].toObject();

      let lastLog = await CheckLog.findOne({visitorId: row._id}).sort({checkIn: -1})

      row.checkStatus = "not-visited";
      row.lastCheckIn = null;
      row.lastCheckOut = null;

      if(row.status === "pending"){
        summary.pending++;
      }
      if(row.status === "approved"){
        summary.approved++;
      }
      if(lastLog){
        row.lastCheckIn = lastLog.checkIn;
        row.lastCheckOut = lastLog.checkOut || null;

        if(lastLog.checkOut){
          row.checkStatus = "checked-out";
          summary.checkedOut++;
        } 
        else{
          row.checkStatus = "checked-in";
          summary.checkedIn++;
        }
      }
      out.push(row);
    }

    res.json({
      visitors: out,
      summary: summary
    })
  } 
  catch(err){
    console.error("Error in loading visitor list", err.message);
    res.status(500).json({message: "Error in fetching data"});
  }
}


//approve visitor
exports.approveVisitor = async(req, res) =>{
  try{
    const {id} = req.params;
    let visitor = await Visitor.findById(id);
    if(!visitor){
      return res.status(404).json({message: "Not found"});
    }

    visitor.status = "approved";
    visitor.approvedBy = req.user.id;
    visitor.approvedAt = new Date();
    await visitor.save()

    console.log("Visitor is approved " + visitor.email);
    res.json({message: "Visitor is approved", visitor: visitor });
  } 
  catch(err){
    console.error("Error in approving visitor", err.message);
    res.status(500).json({message: "Approval failed"})
  }
}


//reject visitor
exports.rejectVisitor = async (req, res) => {
  try{
    const {id} = req.params;
    let visitor = await Visitor.findById(id);
    if(!visitor){
      return res.status(404).json({ message: "Not found"});
    }
    visitor.status = "rejected";
    await visitor.save();

    console.log("Visitor is rejected " + visitor.email);
    res.json({ message: "Visitor rejected", visitor: visitor});
  } 
  catch(err){
    console.error("Error in rejecting visitor", err.message);
    res.status(500).json({message: "Error in rejecting visitor"});
  }
};

//visitor appointment
exports.scheduleAppointment = async(req, res)=>{
  try{
    const {visitDate, visitTime} = req.body;

    if(!visitDate || !visitTime){
      return res.status(400).json({ message: "Date and time are required"});
    }

    const {id} = req.params;
    let visitor = await Visitor.findById(id);
    if(!visitor){
      return res.status(404).json({message: "Visitor not found "})
    }

    if(visitor.status !== "approved"){
      return res.status(400).json({message: "Approve visitor first"});
    }

    if(visitor.isScheduled){
      return res.status(400).json({message: "Appointment is already scheduled"})
    }

    visitor.visitDate = visitDate;
    visitor.visitTime = visitTime;
    visitor.isScheduled = true;
    visitor.scheduledBy = req.user.id;
    visitor.scheduledAt = new Date();

    await visitor.save();

    console.log("Meeting time was added for " + visitor.email);
    res.json({message: "Appointment scheduled", visitor: visitor});
  } 
  catch(err){
    console.error("Could not save meeting time", err.message);
    res.status(500).json({message: "Can't schedule appointment"});
  }
};

//issue pass
exports.issuePass = async (req, res) =>{
  try{
    const {id} = req.params;
    let visitor = await Visitor.findById(id);

    if(!visitor){
      return res.status(404).json({message: "Visitor not found"})
    }

    if(visitor.status !== "approved"){
      return res.status(400).json({message: "Visitor must be approved first"});
    }

    if(!visitor.isScheduled || !visitor.visitDate || !visitor.visitTime){
      return res.status(400).json({message: "Please schedule appointment first"});
    }

    if(visitor.passIssued && visitor.passFile){
      return res.json({
        message: "Pass already issued",
        visitor: visitor
      })
    }

    //decode qr for scan
    let qrData = await QRCode.toDataURL(visitor._id.toString());
    let pdfPath = await generatePass(visitor, qrData)

    visitor.passIssued = true;
    visitor.passIssuedBy = req.user.id;
    visitor.passIssuedAt = new Date();
    visitor.passFile = path.basename(pdfPath)

    await visitor.save();

    console.log("Pass was made for " + visitor.email);
    res.json({message: "Pass issued successfully", visitor: visitor});

    let subj = "Your Entry Pass";
    let txt = `Hi ${visitor.name}, your pass is ready for ${visitor.visitDate} at ${visitor.visitTime}`;

    sendMail(visitor.email, subj, txt, pdfPath, visitor.phone).catch(function (e){
      console.error("There was a problem sending pass message", e.message);
    })
  } 
  catch(err){
    console.error("Error in making visitor pass", err.message)
    res.status(500).json({ message: "Can't issue pass right now"});
  }
}

//export csv
exports.exportVisitorsCSV = async (req, res) =>{
  try{
    const visitors = await Visitor.find().sort({ createdAt: -1 });

    const headers = ["Name", "Email", "Phone", "Purpose", "Status", "VisitDate", "VisitTime"];
    
    const clean = (val) =>{
      if(val == null) return '""';
      const s = String(val).replace(/"/g, '""').replace(/\n|\r/g, " ");
      return `"${s}"`;
    }

    const rows = visitors.map(v => [
      clean(v.name),
      clean(v.email),
      clean(v.phone),
      clean(v.purpose || "General Visit"),
      clean(v.status),
      clean(v.visitDate),
      clean(v.visitTime)
    ].join(","))

    const csvContent = [headers.join(","), ...rows].join("\n");

    console.log("Visitor csv file was created");
    res.attachment("visitor_report.csv");
    res.status(200).send(csvContent);

  } 
  catch(err){
    console.error("Could not export visitor csv", err.message);
    res.status(500).json({message: "Could not export data"});
  }
};


//get visitor by id
exports.getVisitorById = async (req, res) =>{
  try{
    const {id} = req.params;
    const visitor = await Visitor.findById(id);

    if(!visitor){
      return res.status(404).json({message: "Visitor not found"})
    }

    const data = visitor.toObject()
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads`;

    data.photoUrl = data.photo ? `${baseUrl}/photos/${encodeURIComponent(data.photo)}` : "";
    data.passUrl = data.passFile ? `${baseUrl}/passes/${encodeURIComponent(data.passFile)}` : "";

    console.log("Visitor details were opened " + data.email);
    res.json(data);
  }
   catch(err){
    console.error("Error in loading visitor details", err.message);
    res.status(500).json({message: "Error in loading details"})
  }
}