const { Schema, model } = require("mongoose");

const tasksPlanSchema = new Schema({
  task: {
    type: Schema.Types.ObjectId,
    ref: "Task",
  },
  done: {
    type: Boolean,
    default: false,
  },
  date: Date,
  time: Number,
});

const planSchema = new Schema({
  tasks: {
    type: [tasksPlanSchema],
    required: true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
});

const Plan = model("Plan", planSchema);

module.exports = Plan;
