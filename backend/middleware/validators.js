const { body, query, validationResult } = require("express-validator");


//middleware to handle validation results.
const validate = (req, res, next) =>{
  const errors = validationResult(req);
  if(errors.isEmpty()){
    return next();
  }
  
  //mapping errors
  const extractedErrors = errors.array().map(err => ({ 
    field: err.path, 
    message: err.msg 
  }))

  console.warn("Form validation did not pass", extractedErrors);

  return res.status(422).json({
    success: false,
    errors: extractedErrors,
    message: extractedErrors[0].message
  })
}


const emailRule = ()=> body("email").trim().isEmail().withMessage("Provide a valid email address").normalizeEmail();
const passwordRule = (min = 6)=> body("password").isLength({ min }).withMessage(`Password must be at least ${min} characters`);
const phoneRule = ()=> body("phone").trim().isMobilePhone().withMessage("A valid 10-digit phone number is required");


//Staff validation
exports.registerValidation =[
  body("name").trim().notEmpty().withMessage("Name is required"),
  emailRule(),
  passwordRule(),
  body("role")
    .optional()
    .isIn(["employee", "security", "admin"])
    .withMessage("Role must be employee, security, or admin"),
  validate
];


exports.loginValidation = [
  emailRule(),
  body("password").notEmpty().withMessage("Password is required"),
  validate
];


//Visitor Validation
exports.visitorRegisterValidation = [
  body("name").trim().notEmpty().withMessage("Visitor name is required"),
  emailRule(),
  phoneRule(),
  passwordRule(),
  validate
];


exports.visitorOtpValidation = [
  emailRule(),
  body("otp")
    .trim()
    .isNumeric()
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be a 6-digit number"),
  validate
];


exports.visitorLoginValidation = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password is required"),
  validate
];

//Scanning & Passes validation
exports.scanValidation = [
  body("visitorId")
    .isMongoId() 
    .withMessage("Invalid Visitor ID format"),
  body("action")
    .isIn(["checkin", "checkout"])
    .withMessage("Action must be either 'checkin' or 'checkout'"),
  validate
];


exports.passViewValidation = [
  query("email").trim().isEmail().withMessage("Valid email required to view pass"),
  validate
];


exports.resendOtpValidation = [emailRule(), validate];
