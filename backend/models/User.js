const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  phone: {
    type: String,
    default: ""
  },
  role: { 
    type: String, 
    enum: ["admin", "security", "employee", "visitor"], 
    default: "employee" ,
  },
  visitorId: {
    type: Schema.Types.ObjectId,
    ref: "Visitor",
    default: null
  },
  isEmailVerified: {
    type: Boolean,
    default: true
  },
  otpCode: {
    type: String,
    default: ""
  },
  otpExpiresAt: {
    type: Date,
    default: null
  }
})

module.exports = mongoose.model("User", userSchema);
