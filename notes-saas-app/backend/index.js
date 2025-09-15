const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");
const tenantsRoutes = require("./routes/tenants");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/tenants", tenantsRoutes);

// Health endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Initialize data
const initializeData = async () => {
  const Tenant = require("./models/Tenant");
  const User = require("./models/User");
  const bcrypt = require("bcryptjs");

  const acme = await Tenant.findOneAndUpdate(
    { slug: "acme" },
    { name: "Acme Inc", slug: "acme", plan: "free" },
    { upsert: true, new: true }
  );

  const globex = await Tenant.findOneAndUpdate(
    { slug: "globex" },
    { name: "Globex Corp", slug: "globex", plan: "free" },
    { upsert: true, new: true }
  );

  const hashedPassword = await bcrypt.hash("password", 12);

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

  for (const userData of users) {
    await User.findOneAndUpdate({ email: userData.email }, userData, {
      upsert: true,
    });
  }

  console.log("Database initialized with proper password hashes");
};

// ✅ Connect to MongoDB when function runs
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    initializeData();
  })
  .catch((err) => console.error(err));

// ✅ Export app for Vercel (NO app.listen here)
module.exports = app;
