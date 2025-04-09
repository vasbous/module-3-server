const { Schema, model } = require("mongoose");
const weeklyFeedbackSchema = new Schema({
  ai_response: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});
const Weekly_feedback = model("Weekly_feedback", weeklyFeedbackSchema);
module.exports = Weekly_feedback;
