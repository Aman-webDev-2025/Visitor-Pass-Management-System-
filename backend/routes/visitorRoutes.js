const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const visitorController = require("../controllers/visitorController");
const { auth, allowRoles } = require("../middleware/authMiddleware");
const { visitorRegisterValidation } = require("../middleware/validators");


//path for photos
const photosDir = path.join(__dirname, "../uploads/photos");
if(!fs.existsSync(photosDir)){
  fs.mkdirSync(photosDir, {recursive: true })
}

//storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) =>{
    cb(null, photosDir);
  },
  filename: (req, file, cb) =>{
    let cleanName = file.originalname.replace(/\s+/g, "-");
    cb(null, Date.now() + "-" + cleanName);
  }
});

const upload = multer({storage: storage});

// post Routes for visitor
router.post("/preregister", upload.single("photo"), visitorRegisterValidation, visitorController.preregisterVisitor);
router.post("/", auth, allowRoles("employee", "admin"), upload.single("photo"), visitorRegisterValidation, visitorController.addVisitor);


//get routes for visitor
router.get("/", auth, visitorController.getVisitors);
router.get("/export", auth, allowRoles("admin"), visitorController.exportVisitorsCSV);
router.get("/:id", auth, visitorController.getVisitorById);


//update routes for visitor
router.patch("/:id/approve", auth, allowRoles("employee", "admin"), visitorController.approveVisitor);
router.patch("/:id/reject", auth, allowRoles("employee", "admin"), visitorController.rejectVisitor);
router.patch("/:id/schedule", auth, allowRoles("employee", "admin"), visitorController.scheduleAppointment);
router.patch("/:id/issue-pass", auth, allowRoles("security", "admin"), visitorController.issuePass);

module.exports = router;
