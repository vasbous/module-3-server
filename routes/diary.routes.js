const router = require("express").Router();
const Diary = require("../models/Diary.model");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middlewares/jwt.middleware");

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Get all diary entries for a user
router.get("/", (req, res) => {
  Diary.find({ user: req.payload._id })
    .sort({ createdAt: -1 })
    .then((diaryEntries) => {
      res.status(200).json(diaryEntries);
    })
    .catch((error) => {
      console.error("Error fetching diary entries:", error);
      res.status(500).json({ error: "Error fetching diary entries" });
    });
});

// Get today's diary entry
router.get("/today", (req, res) => {
  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  Diary.findOne({
    user: req.payload._id,
    createdAt: { $gte: today, $lt: tomorrow },
  })
    .then((todayEntry) => {
      res.status(200).json(todayEntry);
    })
    .catch((error) => {
      console.error("Error fetching today's diary entry:", error);
      res.status(500).json({ error: "Error fetching today's diary entry" });
    });
});

// Create a new diary entry
router.post("/", (req, res) => {
  // Create the diary entry
  Diary.create({
    content: req.body.content,
    ai_response: req.body.ai_response,
    mood_score: req.body.mood_score,
    user: req.payload._id,
  })
    .then((createdDiary) => {
      // Update the user with the diary entry reference
      return User.findByIdAndUpdate(
        req.payload._id,
        { $push: { diary_entry: createdDiary._id } },
        { new: true }
      ).then(() => {
        res.status(201).json(createdDiary);
      });
    })
    .catch((error) => {
      console.error("Error creating diary entry:", error);
      res.status(500).json({ error: "Error while creating diary" });
    });
});

// Update a diary entry
router.patch("/:diaryId", (req, res) => {
  // First verify that this diary belongs to the current user
  Diary.findById(req.params.diaryId)
    .then((diary) => {
      if (!diary) {
        return res.status(404).json({ error: "Diary entry not found" });
      }

      // Check if the diary belongs to the user
      if (diary.user.toString() !== req.payload._id) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this diary entry" });
      }

      // If authorized, update the diary
      return Diary.findByIdAndUpdate(req.params.diaryId, req.body, {
        new: true,
      });
    })
    .then((updatedDiary) => {
      if (updatedDiary) {
        res.status(200).json(updatedDiary);
      }
    })
    .catch((error) => {
      console.error("Error updating diary entry:", error);
      res.status(500).json({ error: "Diary not updated" });
    });
});

// Delete a diary entry
router.delete("/:diaryId", (req, res) => {
  // First verify that this diary belongs to the current user
  Diary.findById(req.params.diaryId)
    .then((diary) => {
      if (!diary) {
        return res.status(404).json({ error: "Diary entry not found" });
      }

      // Check if the diary belongs to the user
      if (diary.user.toString() !== req.payload._id) {
        return res
          .status(403)
          .json({ error: "Not authorized to delete this diary entry" });
      }

      // If authorized, delete the diary and remove the reference from user
      return Promise.all([
        Diary.findByIdAndDelete(req.params.diaryId),
        User.findByIdAndUpdate(req.payload._id, {
          $pull: { diary_entry: req.params.diaryId },
        }),
      ]);
    })
    .then(() => {
      res.status(204).send();
    })
    .catch((error) => {
      console.error("Error deleting diary entry:", error);
      res.status(500).json({ message: "Error while deleting a diary" });
    });
});

module.exports = router;
