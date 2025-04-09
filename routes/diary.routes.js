const router = require("express").Router();

const Diary = require("../models/Diary.model");

router.post("/", (req, res) => {
  Diary.create({
    content: req.body.content,
    ai_response: req.body.ai_response,
    mood_score: req.body.mood_score,
  })

    .then((createdDiary) => {
      res.status(201).json(createdDiary);
    })
    .catch((error) => {
      res.status(500).json({ error: "error while creating diary" });
    });
});

router.patch("/:diaryId", (req, res) => {
  Diary.findByIdAndUpdate(req.params.diaryId, req.body, { new: true })
    .then((updatedDiary) => {
      res.status(200).json(updatedDiary);
    })
    .catch((error) => {
      res.status(500).json({ error: "Diary not updated" });
    });
});

router.delete("/:diaryId", (req, res) => {
  Diary.findByIdAndDelete(req.params.diaryId)
    .then(() => {
      res.status(204).send();
    })
    .catch((error) => {
      res.status(500).json({ message: "Error while deleting a diary" });
    });
});

module.exports = router;
