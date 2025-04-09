const { Schema, model } = require("mongoose");
const weeklyFeedbackSchema = new Schema({
  ia_response: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});
const Weekly_feedback = model("Weekly_feedback", WeeklyFeedbackSchema);
module.exports = Weekly_feedback;
