const router = require("express").Router();

const Plan = require("../models/Plan.model");

router.post("/", (req, res) => {
  Plan.create(req.body)
    .then((createdPlan) => {
      res.status(201).json(createdPlan);
    })
    .catch((error) => {
      res.status(500).json({ error: "error while creating plan" });
    });
});

router.patch("/:planId", (req, res) => {
  Plan.findByIdAndUpdate(req.params.planId, req.body, { new: true })
    .then((updatedPlan) => {
      res.status(200).json(updatedPlan);
    })
    .catch((error) => {
      res.status(500).json({ error: "Plan not updated" });
    });
});

router.delete("/:planId", (req, res) => {
  Plan.findByIdAndDelete(req.params.planId)
    .then(() => {
      res.status(204).send();
    })
    .catch((error) => {
      res.status(500).json({ message: "Error while deleting a plan" });
    });
});

module.exports = router;
