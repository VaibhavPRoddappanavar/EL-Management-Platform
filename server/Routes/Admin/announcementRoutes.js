const express = require("express");
const router = express.Router();
const Announcement = require("../../Models/Announcement");

// Create announcement
router.post("/announcements", async (req, res) => {
  console.log("Creating announcement:", req.body); // Debug log
  try {
    const { title, description } = req.body;
    const announcement = new Announcement({
      title,
      description,
      createdBy: "Admin",
    });
    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ message: "Error creating announcement" });
  }
});

// Get all announcements
router.get("/announcements", async (req, res) => {
  console.log("Fetching announcements"); // Debug log
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ message: "Error fetching announcements" });
  }
});

// Update announcement
router.put("/announcements/:id", async (req, res) => {
  try {
    const { title, description } = req.body;
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true }
    );
    res.json(announcement);
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(500).json({ message: "Error updating announcement" });
  }
});

// Delete announcement
router.delete("/announcements/:id", async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ message: "Error deleting announcement" });
  }
});

module.exports = router;
