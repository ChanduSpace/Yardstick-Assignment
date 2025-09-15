const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Tenant = require("./models/Tenant");

const fixDatabase = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/notes_saas"
    );
    console.log("Connected to MongoDB");

    // Clear all users
    await User.deleteMany({});
    console.log("Cleared all users");

    // Get tenants
    const acme = await Tenant.findOne({ slug: "acme" });
    const globex = await Tenant.findOne({ slug: "globex" });

    if (!acme || !globex) {
      console.log("Creating tenants...");
      // Create tenants if they don't exist
      const newAcme = await Tenant.create({
        name: "Acme Inc",
        slug: "acme",
        plan: "free",
      });
      const newGlobex = await Tenant.create({
        name: "Globex Corp",
        slug: "globex",
        plan: "free",
      });
    }

    // Create PROPER password hashes
    console.log("Creating proper password hashes...");
    const hashedPassword = await bcrypt.hash("password", 12);
    console.log("Proper hash created:", hashedPassword);
    console.log("Hash length:", hashedPassword.length);

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

    // Verify the fix
    console.log("\n=== VERIFICATION ===");
    const testUser = await User.findOne({ email: "admin@acme.test" });
    console.log("Stored hash:", testUser.password);
    console.log("Hash length:", testUser.password.length);

    const isValid = await bcrypt.compare("password", testUser.password);
    console.log("Password verification:", isValid ? "✅ SUCCESS" : "❌ FAILED");

    if (isValid) {
      console.log("\n🎉 Database fixed successfully!");
      console.log("You can now login with:");
      console.log("Email: admin@acme.test");
      console.log("Password: password");
    } else {
      console.log("\n❌ Fix failed. Manual intervention needed.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error fixing database:", error);
    process.exit(1);
  }
};

fixDatabase();
