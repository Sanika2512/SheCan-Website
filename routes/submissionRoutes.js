const express = require("express");
const mongoose = require("mongoose");
const Submission = require("../models/Submission");

const router = express.Router();
const liveClients = new Set();
const memorySubmissions = [
  {
    _id: "sample-1",
    name: "Sanika",
    email: "demo@shecan.local",
    message: "Girls can achieve anything in tech.",
    createdAt: new Date(),
    updatedAt: new Date(),
    source: "demo"
  }
];

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

const cleanSubmission = (submission, includeEmail = false) => {
  const plain = typeof submission.toObject === "function" ? submission.toObject() : submission;

  return {
    _id: String(plain._id),
    name: plain.name,
    message: plain.message,
    createdAt: plain.createdAt,
    ...(includeEmail ? { email: plain.email } : {})
  };
};

const broadcastSubmission = (submission) => {
  const payload = JSON.stringify(cleanSubmission(submission));

  liveClients.forEach((client) => {
    client.write(`event: submission\n`);
    client.write(`data: ${payload}\n\n`);
  });
};

const getSubmissions = async (includeEmail = false) => {
  if (isDatabaseConnected()) {
    const fields = includeEmail ? "name email message createdAt" : "name message createdAt";
    const submissions = await Submission.find().sort({ createdAt: -1 }).select(fields);
    return submissions.map((submission) => cleanSubmission(submission, includeEmail));
  }

  return memorySubmissions
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((submission) => cleanSubmission(submission, includeEmail));
};

router.post("/submit", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim()
    };

    if (payload.name.length < 2 || payload.message.length < 5 || !/^\S+@\S+\.\S+$/.test(payload.email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid name, email, and motivation quote."
      });
    }

    let submission;
    let storage = "memory";

    if (isDatabaseConnected()) {
      submission = await Submission.create(payload);
      storage = "mongodb";
    } else {
      submission = {
        _id: `local-${Date.now()}`,
        ...payload,
        createdAt: new Date(),
        updatedAt: new Date(),
        source: "memory"
      };
      memorySubmissions.unshift(submission);
    }

    broadcastSubmission(submission);

    return res.status(201).json({
      success: true,
      message: "Form Submitted Successfully",
      storage,
      data: cleanSubmission(submission, true)
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while saving your submission."
    });
  }
});

router.get("/submissions", async (req, res) => {
  try {
    const adminSecret = req.headers["x-admin-secret"];
    const isAdminRequest = adminSecret === process.env.ADMIN_SECRET;
    const submissions = await getSubmissions(isAdminRequest);

    return res.json({
      success: true,
      storage: isDatabaseConnected() ? "mongodb" : "memory",
      total: submissions.length,
      data: submissions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch submissions right now."
    });
  }
});

router.get("/submissions/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  res.write(`event: connected\n`);
  res.write(`data: {"success":true}\n\n`);

  liveClients.add(res);

  req.on("close", () => {
    liveClients.delete(res);
  });
});

module.exports = router;
