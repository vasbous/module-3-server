const { Schema, model } = require("mongoose");

const taskSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    category: {
      type: [String],
      enum: [
        "Lose weight",
        "Get fitter",
        "Less stress",
        "Get happier",
        "Stop procrastinating",
        "Be more productive",
      ],
    },
    duration: {
      type: [Number],
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
