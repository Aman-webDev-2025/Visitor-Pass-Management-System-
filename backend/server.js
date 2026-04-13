const express = require("express");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const apiRoutes = require("./routes/index");
const validateEnv = require("./utils/validateEnv");

dotenv.config();

try{
  validateEnv();
}
catch(error){
  console.error("Server could not start because env is missing", error.message);
  process.exit(1);
}


const app = express();
const uploadsPath = path.join(__dirname, "uploads");
const uploadDirs = [
  path.join(uploadsPath, "photos"),
  path.join(uploadsPath, "passes"),
];

const PORT = process.env.PORT || 5000;


uploadDirs.forEach((dir) =>{
  if(!fs.existsSync(dir)){
    fs.mkdirSync(dir, {recursive: true })
  }
})

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(mongoSanitize());

app.use("/uploads", express.static(uploadsPath));
app.use("/api", apiRoutes);


app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: err.message || "Server error" });
});



mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed", error.message);
  });
