const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");
const { auth, allowRoles } = require("../middleware/authMiddleware");
const {
  registerValidation,
  loginValidation,
  visitorRegisterValidation,
  visitorLoginValidation,
  visitorOtpValidation,
  resendOtpValidation,
} = require("../middleware/validators");


//path for visitor photos
const photosDir = path.join(__dirname, "../uploads/photos");
if(!fs.existsSync(photosDir)){
  fs.mkdirSync(photosDir, {recursive: true });
}
//storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, photosDir);
  },
  filename: (req, file, cb) => {
    let cleanName = file.originalname.replace(/\s+/g, "-");
    cb(null, Date.now() + "-" + cleanName);
  }
});

const upload = multer({ storage: storage });

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many auth attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authLimiter);


//user routes
router.post("/register", registerValidation, authController.registerUser);
router.post("/login", loginValidation, authController.loginUser);
router.get("/users", auth, allowRoles("admin"), authController.getUsers);
router.delete("/users/:id", auth, allowRoles("admin"), authController.deleteUser);



//visitor route
router.post("/visitor/register", upload.single("photo"), visitorRegisterValidation, authController.registerVisitor);
router.post("/visitor/verify-otp", visitorOtpValidation, authController.verifyVisitorOtp);
router.post("/visitor/resend-otp", resendOtpValidation, authController.resendVisitorOtp);
router.post("/visitor/login", visitorLoginValidation, authController.loginVisitor);



module.exports = router;
