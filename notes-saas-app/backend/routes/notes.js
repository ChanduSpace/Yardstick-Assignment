const express = require("express");
const { auth } = require("../middleware/auth");
const Note = require("../models/Note");
const Tenant = require("../models/Tenant");

// Create router
const router = express.Router();

// Get all notes for current tenant
router.get("/", auth, async (req, res) => {
  try {
    const notes = await Note.find({ tenantId: req.user.tenantId });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single note
router.get("/:id", auth, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create note
router.post("/", auth, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user.tenantId);

    if (tenant.plan === "free") {
      const noteCount = await Note.countDocuments({
        tenantId: req.user.tenantId,
      });
      if (noteCount >= 3) {
        return res.status(400).json({
          message:
            "Free plan limit reached. Upgrade to Pro to create more notes.",
        });
      }
    }

    const newNote = new Note({
      title: req.body.title,
      content: req.body.content,
      tenantId: req.user.tenantId,
      createdBy: req.user.id,
    });

    const note = await newNote.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update note
router.put("/:id", auth, async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      { $set: req.body },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete note
router.delete("/:id", auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
