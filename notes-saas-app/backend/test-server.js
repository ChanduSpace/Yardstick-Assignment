const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Simple test endpoint
app.get("/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
