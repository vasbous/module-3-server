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
      // required: true,
    },
    difficulty_level: {
      type: String,
      enum: ["Easy", "Medium", "Challenging"],
      // required: true,
    },
    // duration: {
    //   type: Number,
    //   enum: [5, 10, 15, 20, 30, 45, 60],
      // required: true,
    // },
    plan_task: {
      type: Boolean,
      // required: true,
      default: false,
    },
    // hour: {
    //   type: String,
    //   enum: [
    //     "1 AM",
    //     "2 AM",
    //     "3 AM",
    //     "4 AM",
    //     "5 AM",
    //     "6 AM",
    //     "7 AM",
    //     "8 AM",
    //     "9 AM",
    //     "10 AM",
    //     "11 AM",
    //     "12 AM",
    //     "1 PM",
    //     "2 PM",
    //     "3 PM",
    //     "4 PM",
    //     "5 PM",
    //     "6 PM",
    //     "7 PM",
    //     "8 PM",
    //     "9 PM",
    //     "10 PM",
    //     "11 PM",
    //     "12 PM",
    //   ],
    // },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Task = model("Task", taskSchema);

module.exports = Task;
