const router = require("express").Router();
const mongoose = require("mongoose");
const Plan = require("../models/Plan.model");
const Task = require("../models/Task.model");
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
                  { $gte: ["$$task.startDate", startOfToday] },
                  { $lte: ["$$task.startDate", endOfToday] },
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
          startDate: "$tasks.startDate",
          endDate: "$tasks.endDate",
          done: "$tasks.done",
          task: {
            _id: "$taskDetails._id",
            content: "$taskDetails.content",
            category: "$taskDetails.category",
            description: "$taskDetails.description",
            duration: "$taskDetails.duration",
            plan_task: "$taskDetails.plan_task",
            createdAt: "$taskDetails.createdAt",
            updatedAt: "$taskDetails.updatedAt",
          },
        },
      },
      { $sort: { startDate: 1 } },
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

router.put("/:planId/replace-task", async (req, res, next) => {
  const { planId } = req.params;
  const { oldTaskId , category, startDate } = req.body.data;
  console.log(oldTaskId)
  try {
    // find plan
    const plan = await Plan.findById(planId);
    // no plan = error
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

       // find index of oldTask inside the plan using startDate
       const taskIndex = plan.tasks.findIndex(t => {
        // Compare dates as strings in ISO format for reliable comparison
        return new Date(t.startDate).toISOString() === new Date(startDate).toISOString();
      });
  
      console.log("Found task index:", taskIndex);

    // not inside the plan = error
    if (taskIndex === -1) {
      return res.status(404).json({ message: "Old task not found in plan" });
    }

    // find oldTask inside bdd
    const oldTask = await Task.findById(oldTaskId);
    if (!oldTask) {
      return res.status(404).json({ message: "Old task not found in DB" });
    }


    // find all other task with the same category
    const possibleTasks = await Task.find({
      category,
      _id: { $ne: oldTaskId }, // Exclut l’ancienne tâche
    });

    // if no task find error
    if (possibleTasks.length === 0) {
      return res.status(404).json({ message: "No other tasks available in this category" });
    }

    // create random index
    const randomIndex = Math.floor(Math.random() * possibleTasks.length);
    // chose a new task
    const newTask = possibleTasks[randomIndex];

    // Replace the task
    plan.tasks[taskIndex].task = newTask._id;
    // ! need to fix duration change
    // reset status
    plan.tasks[taskIndex].done = false; 

    // save new plan
    await plan.save();

    res.status(200).json({ message: "Task replaced", newTask, plan });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
