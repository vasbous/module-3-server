const { Schema, model } = require("mongoose");

const questionSchema = new Schema({
  title: String,
  question: String,
  type: String,
  answer_choices: Array,
});

const goalSchema = new Schema({
  name: {
    type: String,
    enum: [
      "Lose weight",
      "Get fitter",
      "Less stress",
      "Get happier",
      "Stop procrastinating",
      "Be more productive",
    ],
    // required: true,
  },
  questions: {
    type: [questionSchema],
    // required: true,
  },
});

const Goal = model("Goal", goalSchema);

module.exports = Goal;
