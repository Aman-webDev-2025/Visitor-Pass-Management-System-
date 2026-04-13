const express = require("express");
const router = express.Router();

const { auth, allowRoles } = require("../middleware/authMiddleware");
const { scanValidation } = require("../middleware/validators");
const { scanVisitor } = require("../controllers/checkController");


//scan route
router.post("/scan", auth, allowRoles("security", "admin"), scanValidation, scanVisitor);

module.exports = router;
