const router = require("express").Router();

const Goal = require("../models/Goal.model");

router.post("/", (req, res) => {
  Goal.create({
    name: req.body.name,
    questions: req.body.questions,
    goal_details: req.body.goal_details,
  })

    .then((createdGoal) => {
      res.status(201).json(createdGoal);
    })
    .catch((error) => {
      res.status(500).json({ error: "error while creating goal" });
    });
});

router.patch("/:goalId", (req, res) => {
  Goal.findByIdAndUpdate(req.params.goalId, req.body, { new: true })
    .then((updatedGoal) => {
      res.status(200).json(updatedGoal);
    })
    .catch((error) => {
      res.status(500).json({ error: "Goal not updated" });
    });
});

router.delete("/:goalId", (req, res) => {
  Goal.findByIdAndDelete(req.params.goalId)
    .then(() => {
      res.status(204).send();
    })
    .catch((error) => {
      res.status(500).json({ message: "Error while deleting a goal" });
    });
});

module.exports = router;
