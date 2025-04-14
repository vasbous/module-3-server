const router = require("express").Router();
const mongoose = require("mongoose");
const Plan = require("../models/Plan.model");
const { isAuthenticated } = require("../middlewares/jwt.middleware");

// tasks currentDate
router.get("/tasks/:planId", isAuthenticated, async (req, res) => {
  try {
    const planId = req.params.planId;
    const dateString = req.query.date; // Récupère la date de la requête

    // Si aucune date n'est fournie, utilise la date d'aujourd'hui
    const dateToSearch = dateString ? new Date(dateString) : new Date();
    const startOfToday = new Date(dateToSearch);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(dateToSearch);
    endOfToday.setHours(23, 59, 59, 999);

    const result = await Plan.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(planId),
        },
      },
      {
        $project: {
          tasks: {
            $filter: {
              input: "$tasks",
              as: "task",
              cond: {
                $and: [
                  { $gte: ["$$task.date", startOfToday] },
                  { $lte: ["$$task.date", endOfToday] },
                ],
              },
            },
          },
        },
      },
      { $unwind: "$tasks" },
      {
        $lookup: {
          from: "tasks", //collectionne name
          localField: "tasks.task", // name ref inside this collection
          foreignField: "_id", // relative to this property inside TaskModel
          as: "taskDetails", //alias
        },
      },
      { $unwind: "$taskDetails" },
      {
        $project: {
          _id: 0,
          date: "$tasks.date",
          endDate: "$tasks.endDate",
          done: "$tasks.done",
          task: {
            _id: "$taskDetails._id",
            content: "$taskDetails.content",
            category: "$taskDetails.category",
            difficulty_level: "$taskDetails.difficulty_level",
            // duration: "$taskDetails.duration",
            plan_task: "$taskDetails.plan_task",
            createdAt: "$taskDetails.createdAt",
            updatedAt: "$taskDetails.updatedAt",
          },
        },
      },
      { $sort: { date: 1 } },
    ]);

    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    console.error("Erreur dans la route /tasks/:planId");
    res.status(500).json({
      error: "Erreur lors de la récupération des tâches du jour",
      message: error.message,
    });
  }
});

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
