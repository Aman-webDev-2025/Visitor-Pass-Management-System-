const express = require("express");
const router = express.Router();
const passController = require("../controllers/passController");
const { auth, allowRoles } = require("../middleware/authMiddleware");
const { passViewValidation } = require("../middleware/validators");


//route for view passes
router.get("/view", auth, allowRoles("admin", "employee", "security"), passViewValidation, passController.viewPassByEmail);
router.get("/my-pass", auth, allowRoles("visitor"), passController.viewOwnPass);

module.exports = router;
