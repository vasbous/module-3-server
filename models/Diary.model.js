const { Schema, model } = require("mongoose");

const diarySchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    ai_response: String,
    mood_score: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Diary = model("Diary", diarySchema);

module.exports = Diary;
