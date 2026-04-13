const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const visitorSchema =new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  name: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  purpose: { 
    type: String, 
    default: "" 
  },
  photo: { 
    type: String,
    default: "" 
  },
  visitDate:{ 
    type: String, 
    default: "" 
  },
  visitTime: { 
    type: String, 
    default: "" 
  },
  isScheduled: { 
    type: Boolean, 
    default: false 
  },
  scheduledBy: { 
    type: String, default: "" ,
  },
  scheduledAt: { 
    type: Date 
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  approvedBy: String,
  approvedAt: { type: Date},
  passIssued: { 
    type: Boolean, 
    default: false 
  },
  passIssuedBy: { 
    type: String, 
    default: "" 
  },
  passIssuedAt: { type: Date },
  passFile: { 
    type: String, 
    default: "" 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  emailVerifiedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model("Visitor", visitorSchema);
