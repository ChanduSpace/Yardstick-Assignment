const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");

const fixAllPasswords = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/notes_saas"
    );
    console.log("Connected to MongoDB");

    const users = await User.find();
    console.log("Found", users.length, "users");

    for (const user of users) {
      const newHash = await bcrypt.hash("password", 12);
      user.password = newHash;
      await user.save();
      console.log(`Updated password for: ${user.email}`);
      console.log(`New hash: ${newHash}`);
      console.log("---");
    }

    console.log("All passwords updated with proper hashes");

    console.log("\n=== VERIFICATION ===");
    for (const user of users) {
      const isValid = await bcrypt.compare("password", user.password);
      console.log(
        `${user.email}: ${isValid ? "✅" : "❌"} Password verification`
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("Error fixing passwords:", error);
    process.exit(1);
  }
};

fixAllPasswords();
