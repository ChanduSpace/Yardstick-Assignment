const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const Tenant = require("../models/Tenant");
const Note = require("../models/Note");

const completeReset = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/notes_saas"
    );
    console.log("Connected to MongoDB");

    // Clear ALL data
    await User.deleteMany({});
    await Tenant.deleteMany({});
    await Note.deleteMany({});
    console.log("Cleared all data");

    // Create tenants
    const acme = await Tenant.create({
      name: "Acme Inc",
      slug: "acme",
      plan: "free",
    });

    const globex = await Tenant.create({
      name: "Globex Corp",
      slug: "globex",
      plan: "free",
    });

    console.log("Tenants created");

    // Create proper password hashes
    const hashedPassword = await bcrypt.hash("password", 12);
    console.log("Password hash created:", hashedPassword);

    // Create users with proper hashes
    const users = [
      {
        email: "admin@acme.test",
        role: "admin",
        tenantId: acme._id,
        password: hashedPassword,
      },
      {
        email: "user@acme.test",
        role: "member",
        tenantId: acme._id,
        password: hashedPassword,
      },
      {
        email: "admin@globex.test",
        role: "admin",
        tenantId: globex._id,
        password: hashedPassword,
      },
      {
        email: "user@globex.test",
        role: "member",
        tenantId: globex._id,
        password: hashedPassword,
      },
    ];

    await User.insertMany(users);
    console.log("Users created with proper password hashes");

    // Verify everything works
    console.log("\n=== VERIFICATION ===");
    const testUser = await User.findOne({ email: "admin@acme.test" });
    const isValid = await bcrypt.compare("password", testUser.password);
    console.log("Password verification:", isValid ? "✅ SUCCESS" : "❌ FAILED");

    console.log("\n=== TEST ACCOUNTS ===");
    console.log('All accounts use password: "password"');
    console.log("admin@acme.test (Admin, Acme)");
    console.log("user@acme.test (Member, Acme)");
    console.log("admin@globex.test (Admin, Globex)");
    console.log("user@globex.test (Member, Globex)");

    process.exit(0);
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  }
};

completeReset();
