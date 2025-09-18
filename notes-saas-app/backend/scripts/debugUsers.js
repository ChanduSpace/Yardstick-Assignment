const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");
const Tenant = require("../models/Tenant");

const debugUsers = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/notes_saas"
    );
    console.log("Connected to MongoDB");

    const users = await User.find().populate("tenantId");

    console.log("\n=== USERS IN DATABASE ===");
    users.forEach((user) => {
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Tenant: ${user.tenantId.name} (${user.tenantId.slug})`);
      console.log(`Password hash: ${user.password}`);
      console.log("---");
    });

    process.exit(0);
  } catch (error) {
    console.error("Error debugging users:", error);
    process.exit(1);
  }
};

debugUsers();
