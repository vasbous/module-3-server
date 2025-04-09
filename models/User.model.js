const { Schema, model } = require("mongoose");

const oneChatHistorySchema = new Schema({
  user_message: String,
  ai_message: String,
});

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      // minlength: 8,
    },
    goals: {
      type: [Schema.Types.ObjectId],
      ref: "Goal",
    },
    level: {
      type: Number,
      default: 0,
    },
    progression: {
      type: Number,
      default: 0,
    },
    birthday: {
      type: Date,
      // required: true,
    },

    diary_entry: {
      type: [Schema.Types.ObjectId],
      ref: "Diary",
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
    },
    timezone: String,
    feedbacks: {
      type: [Schema.Types.ObjectId],
      ref: "Weekly_feedback",
    },
    day_streak: Number,
    previous_connexion: Date,
    chat_history: [oneChatHistorySchema],
    admin: {
      type: Boolean,
      default: false,
    },
    google_connexion: {
      type: Boolean,
      default: false,
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
