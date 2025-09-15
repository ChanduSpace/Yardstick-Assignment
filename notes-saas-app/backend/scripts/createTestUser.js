const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const Tenant = require("../models/Tenant");

const createTestUser = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/notes_saas"
    );
    console.log("Connected to MongoDB");

    // Find or create Acme tenant
    let acme = await Tenant.findOne({ slug: "acme" });
    if (!acme) {
      acme = await Tenant.create({
        name: "Acme Inc",
        slug: "acme",
        plan: "free",
      });
    }

    // Create a test user with known password
    const testPassword = "password";
    const hashedPassword = await bcrypt.hash(testPassword, 12);

    const testUser = await User.create({
      email: "test@acme.test",
      password: hashedPassword,
      role: "admin",
      tenantId: acme._id,
    });

    console.log("Test user created:");
    console.log(`Email: test@acme.test`);
    console.log(`Password: password`);
    console.log(`Hashed password: ${hashedPassword}`);

    process.exit(0);
  } catch (error) {
    console.error("Error creating test user:", error);
    process.exit(1);
  }
};

createTestUser();
