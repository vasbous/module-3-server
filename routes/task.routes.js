const router = require("express").Router();
// import  model
const Task = require("../models/Task.model");

router.get("/", async (req, res, next) => {
  try {
    const tasks = await Task.find({});
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});
router.get("/category/:categoryType", async (req, res, next) => {
  try {
    const { categoryType } = req.params;
    const tasks = await Task.find({
      category: categoryType.split("%20").join(" "),
    });
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});
router.get("/:taskId", async (req, res, next) => {
  const { taskId } = req.params;
  try {
    const task = await Task.findById(taskId);
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
});

router.post("/", (req, res) => {
  Task.create(req.body)

    .then((createdTask) => {
      res.status(201).json(createdTask);
    })
    .catch((error) => {
      res.status(500).json({ error: "error while creating Task", error });
    });
});

router.patch("/:taskId", (req, res) => {
  Task.findByIdAndUpdate(req.params.taskId, req.body, { new: true })
    .then((updatedTask) => {
      res.status(200).json(updatedTask);
    })
    .catch((error) => {
      res.status(500).json({ error: "Task not updated", error });
    });
});

router.delete("/:taskId", (req, res) => {
  Task.findByIdAndDelete(req.params.taskId)
    .then(() => {
      res.status(204).send();
    })
    .catch((error) => {
      res.status(500).json({ message: "Error while deleting a Task", error });
    });
});
module.exports = router;
