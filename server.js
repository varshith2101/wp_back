const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

mongoose.set('strictQuery', false); // Allow flexible filtering
// Database Connection
mongoose.connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("MongoDB Connected");
    // Optional: Add initial admin user check/setup here if needed
  })
  .catch(err => console.log("MongoDB connection error:", err));

// Routes
app.use("/api/articles", require("./routes/articles"));
app.use("/api/auth", require("./routes/Auth"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));