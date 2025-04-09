const { Schema, model } = require("mongoose");

const taskSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Fitness", "Wellbeing", "Weight Loss", "Less Stress"],
      required: true,
    },
    difficulty_level: {
      type: String,
      enum: ["Easy", "Medium", "Challenging"],
      required: true,
    },
    duration: {
      type: Number,
      enum: [5, 10, 15, 20, 30, 45, 60],
      required: true,
    },
    plan_task: {
      type: Boolean,
      // required: true,
      default: false,
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Task = model("Task", taskSchema);

module.exports = Task;
