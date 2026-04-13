require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Visitor = require("./models/Visitor");
const CheckLog = require("./models/CheckLog");

async function seedData(){
  if(!process.env.MONGO_URI){
    console.warn("MONGO_URI is missing in .env");
    return
  }

  try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected");

    await User.deleteMany({})
    await Visitor.deleteMany({});
    await CheckLog.deleteMany({});
    console.log("Old data deleted")

    const hashedPassword = await bcrypt.hash("password123", 10);

    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
    })

    await User.create({
      name: "Staff Member",
      email: "staff@gmail.com",
      password: hashedPassword,
      role: "employee",
    })

    const securityUser = await User.create({
      name: "Security Staff",
      email: "security@gmail.com",
      password: hashedPassword,
      role: "security"
    })

    console.log("Users added");

    await Visitor.create({
      name: "Rahul Sharma",
      email: "rahul@example.com",
      phone: "9876543210",
      purpose: "Project meeting",
      status: "pending"
    });

    await Visitor.create({
      name: "Neha Singh",
      email: "neha@example.com",
      phone: "9123456780",
      purpose: "Interview",
      visitDate: "2026-04-10",
      visitTime: "12:00",
      isScheduled: true,
      status: "approved",
      approvedBy: String(adminUser._id),
      approvedAt: new Date(),
      scheduledBy: String(adminUser._id),
      scheduledAt: new Date()
    })

    await Visitor.create({
      name: "Arjun Patel",
      email: "arjun@example.com",
      phone: "9988776655",
      purpose: "Vendor visit",
      visitDate: "2026-04-11",
      visitTime: "15:00",
      isScheduled: true,
      status: "approved",
      approvedBy: String(adminUser._id),
      approvedAt: new Date(),
      scheduledBy: String(adminUser._id),
      scheduledAt: new Date(),
      passIssued: true,
      passIssuedBy: String(securityUser._id),
      passIssuedAt: new Date()
    })

    console.log("Visitors added");
    console.log("Seeding complete")
  } 
  catch(error){
    console.error("Seeding failed", error.message);
  } 
  finally{
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

seedData();
