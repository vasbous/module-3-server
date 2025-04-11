const router = require("express").Router();
const Diary = require("../models/Diary.model");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middlewares/jwt.middleware");

// GET diary entry for today
router.get("/today", isAuthenticated, async (req, res) => {
  try {
    // Get user ID from auth token
    const userId = req.payload._id;

    // Get current date (beginning of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get tomorrow (for date range query)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log("Searching for diaries for user:", userId);
    console.log("Date range:", today, "to", tomorrow);

    // Find the user first
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user has no diaries, return null
    if (!user.diaries || user.diaries.length === 0) {
      console.log("User has no diaries");
      return res.status(200).json(null);
    }

    // Now search for diaries created today
    const todayDiary = await Diary.find({
      _id: { $in: user.diaries },
      createdAt: { $gte: today, $lt: tomorrow },
    })
      .sort({ createdAt: -1 })
      .limit(1);

    console.log("Today's diaries found:", todayDiary.length);

    if (todayDiary.length > 0) {
      res.status(200).json(todayDiary[0]);
    } else {
      res.status(200).json(null);
    }
  } catch (error) {
    console.error("Error fetching today's diary:", error);
    res.status(500).json({
      error: "Error fetching today's diary entry",
      details: error.message,
    });
  }
});

// Get a single diary entry
router.get("/:diaryId", isAuthenticated, (req, res) => {
  Diary.findById(req.params.diaryId)
    .then((diary) => {
      if (!diary) {
        return res.status(404).json({ message: "Diary entry not found" });
      }
      res.status(200).json(diary);
    })
    .catch((error) => {
      res.status(500).json({ error: "Error fetching diary entry" });
    });
});

// Create a new diary entry
router.post("/", isAuthenticated, (req, res) => {
  Diary.create({
    content: req.body.content,
    ai_response: req.body.ai_response || null,
    mood_score: req.body.mood_score,
  })
    .then((createdDiary) => {
      res.status(201).json(createdDiary);
    })
    .catch((error) => {
      res.status(500).json({ error: "Error while creating diary" });
    });
});

// Update a diary entry
router.patch("/:diaryId", isAuthenticated, (req, res) => {
  Diary.findByIdAndUpdate(req.params.diaryId, req.body, { new: true })
    .then((updatedDiary) => {
      if (!updatedDiary) {
        return res.status(404).json({ message: "Diary entry not found" });
      }
      res.status(200).json(updatedDiary);
    })
    .catch((error) => {
      res.status(500).json({ error: "Diary not updated" });
    });
});

// Delete a diary entry
router.delete("/:diaryId", isAuthenticated, async (req, res) => {
  try {
    // First remove the diary from any user that references it
    await User.updateMany(
      { diaries: req.params.diaryId },
      { $pull: { diaries: req.params.diaryId } }
    );

    // Then delete the diary
    const result = await Diary.findByIdAndDelete(req.params.diaryId);

    if (!result) {
      return res.status(404).json({ message: "Diary entry not found" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error while deleting a diary" });
  }
});

module.exports = router;
