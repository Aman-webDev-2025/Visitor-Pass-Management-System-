const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const visitorRoutes = require("./visitorRoutes");
const checkRoutes = require("./checkRoutes");
const passRoutes = require("./passRoutes");


//Mounting all routes
router.use("/auth", authRoutes);
router.use("/visitors", visitorRoutes);
router.use("/check", checkRoutes);
router.use("/pass", passRoutes);


module.exports = router;
