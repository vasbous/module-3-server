// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

const app = express();

// Import the custom error handling middleware:
const {
  errorHandler,
  notFoundHandler,
} = require("./middlewares/error-handling");

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/api", indexRoutes);
// variable for the auth routes files
const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const diaryRoutes = require("./routes/diary.routes");
app.use("/diary", diaryRoutes);

const goalRoutes = require("./routes/goal.routes");
app.use("/goal", goalRoutes);

const planRoutes = require("./routes/plan.routes");
app.use("/plan", planRoutes);

const taskRoutes = require("./routes/task.routes");
app.use("/task", taskRoutes);

const userRoutes = require("./routes/user.routes");
app.use("/user", userRoutes);

const weeklyFeedbackRoutes = require("./routes/weeklyFeedback.routes");
app.use("/weekly-feedback", weeklyFeedbackRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);
// Set up custom error handling middleware:
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
