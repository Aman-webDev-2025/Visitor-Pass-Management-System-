const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const checkLogSchema =new Schema({
  visitorId: { 
    type: Schema.Types.ObjectId,
    ref: "Visitor",
    required: true 
  },
  checkIn: { 
    type: Date, 
    default: Date.now, 
  },
  checkOut: { 
    type: Date 
  },
  checkedBy: { 
    type: String, 
    required: true 
  }
});

module.exports = mongoose.model("CheckLog", checkLogSchema);
