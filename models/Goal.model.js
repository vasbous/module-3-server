const { Schema, model } = require("mongoose");

const goalSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  questions: {
    type: [String],
    required: true,
  },
  goal_details: {
    type: Map,
    of: Schema.Types.Mixed,
    required: true,
  },
});

const Goal = model("Goal", goalSchema);

module.exports = Goal;
