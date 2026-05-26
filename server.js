require("dotenv").config();

const path = require("path");
const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");
const submissionRoutes = require("./routes/submissionRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "frontend")));
app.use("/", submissionRoutes);

app.get("/health", (req, res) => {
  res.json({ success: true, message: "She Can Foundation API is running." });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use.`);
    console.error("Close the other Node server or change PORT in the .env file, for example: PORT=5001");
    process.exit(1);
  }

  console.error("Server failed to start:", error.message);
  process.exit(1);
});
