const router = require("express").Router();
// import  model
const Weekly_feedbak = require("../models/WeeklyFeedback.model");

router.post("/", (req, res) => {
  Weekly_feedbak.create(req.body)
    .then((createdWeeklyFeedback) => {
      res.status(201).json(createdWeeklyFeedback);
    })
    .catch((error) => {
      res.status(500).json({ error: "error while creating plan", error });
    });
});
module.exports = router;
