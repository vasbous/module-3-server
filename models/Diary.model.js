const { Schema, model } = require("mongoose");

const diarySchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    ai_response: {
      type: String,
    },
    mood_score: {
      type: Number,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Diary = model("Diary", diarySchema);

module.exports = Diary;
