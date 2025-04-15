const router = require("express").Router();
const axios = require("axios");
require("dotenv").config();

// Get the API key from backend environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

// Middleware for checking API key
const checkApiKey = (req, res, next) => {
  if (!GEMINI_API_KEY) {
    return res
      .status(500)
      .json({ error: "Gemini API key is not configured on the server" });
  }
  next();
};

// Route for diary feedback
router.post("/diary-feedback", checkApiKey, async (req, res) => {
  try {
    const { content, moodScore, previousEntries, currentUser } = req.body;

    // Generate prompt using the data from the request
    const prompt = generateDiaryPrompt(
      content,
      moodScore,
      previousEntries,
      currentUser
    );

    const response = await axios.post(
      `${GEMINI_API_URL}/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }
    );

    // Extract and return the AI response
    let aiResponse = "";
    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates[0] &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts &&
      response.data.candidates[0].content.parts[0]
    ) {
      aiResponse = response.data.candidates[0].content.parts[0].text;
    }

    res.status(200).json({ aiResponse });
  } catch (error) {
    console.error("Error getting diary feedback:", error);
    res.status(500).json({
      error: "Failed to get AI feedback",
      message: error.message,
    });
  }
});

// Route for generating a plan
router.post("/create-plan", checkApiKey, async (req, res) => {
  try {
    const { currentUser, allGoalTasks } = req.body;

    // Generate prompt for plan creation
    const prompt = generatePlanPrompt(currentUser, allGoalTasks);

    const response = await axios.post(
      `${GEMINI_API_URL}/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
        },
      }
    );

    let aiResponse = "";
    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates[0] &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts &&
      response.data.candidates[0].content.parts[0]
    ) {
      aiResponse = response.data.candidates[0].content.parts[0].text;
    }

    // Process the response
    aiResponse = aiResponse
      .trim()
      .replace(/^\`\`\`json\s*/i, "")
      .replace(/\`\`\`$/, "")
      .trim();

    const planData = JSON.parse(aiResponse);

    res.status(200).json({ planData });
  } catch (error) {
    console.error("Error generating plan:", error);
    res.status(500).json({
      error: "Failed to generate plan",
      message: error.message,
    });
  }
});

// Route for chatbot responses
router.post("/chat", checkApiKey, async (req, res) => {
  try {
    const { userMessage, messages, currentUser } = req.body;

    // Generate prompt for chat
    const prompt = generateChatPrompt(userMessage, messages, currentUser);

    const response = await axios.post(
      `${GEMINI_API_URL}/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
        },
      }
    );

    let aiResponse = "";
    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates[0] &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts &&
      response.data.candidates[0].content.parts[0]
    ) {
      aiResponse = response.data.candidates[0].content.parts[0].text.trim();
    }

    res.status(200).json({ aiResponse });
  } catch (error) {
    console.error("Error getting chat response:", error);
    res.status(500).json({
      error: "Failed to get AI response",
      message: error.message,
    });
  }
});

// Helper functions for generating prompts
function generateDiaryPrompt(content, moodScore, previousEntries, currentUser) {
  // Extract goal details from user
  const goalDetails = currentUser.goal_details || {};
  const selectedGoal = goalDetails.selectedGoal || "No specific goal set";

  // Format goal-related questions and answers
  let questionsAndAnswers = "";
  if (goalDetails.questions && goalDetails.questions.length > 0) {
    questionsAndAnswers = goalDetails.questions
      .map(
        (q) =>
          `Question: ${q.question || q.title}\nAnswer: ${
            q.user_answer || "Not answered"
          }`
      )
      .join("\n");
  }

  // Format previous entries
  const lastEntries = previousEntries
    .slice(0, 7)
    .map(
      (entry) =>
        `Date: ${new Date(entry.createdAt).toLocaleDateString()}\nMood: ${
          entry.mood_score
        }/10\nContent: ${entry.content}`
    )
    .join("\n\n---\n\n");

  return `
You are a compassionate life coach providing feedback on a user's journal entry. Below, you'll find the following information:

Current Journal Entry: ${content}

Mood Rating: ${moodScore}/10

User Goal: ${selectedGoal}

Relevant Questions & User's Answers:

${questionsAndAnswers || "No specific questions answered yet"}

Last 7 Journal Entries:

${lastEntries || "No previous entries available"}

Using the above context, please provide friendly, motivating feedback broken into three sections:

Mood Reflection: Reflect on the user's current mood and acknowledge their feelings.

What Went Well Today: Identify and highlight any positive aspects or progress from their journal entry.

Suggestion for Tomorrow: Offer a kind, practical suggestion to help the user continue progressing towards their goal.

Keep the tone positive, human, and encouraging. Your feedback should be warm and supportive, aiming to empower the user while validating their experiences.

Don't start with any preamble. Just provide the feedback in the three sections.
`;
}

function generatePlanPrompt(currentUser, allGoalTasks) {
  // Extract goal details from user
  const goalDetails = currentUser.goal_details || {};
  const selectedGoal = goalDetails.selectedGoal || "No specific goal set";

  // Format goal-related questions and answers
  let questionsAndAnswers = "";
  if (goalDetails.questions && goalDetails.questions.length > 0) {
    questionsAndAnswers = goalDetails.questions
      .map(
        (q) =>
          `Question: ${q.question || q.title}\nAnswer: ${
            q.user_answer || "Not answered"
          }`
      )
      .join("\n");
  }

  // Get current date and calculate one month from now
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);

  const allTasksLibraryString = JSON.stringify(allGoalTasks, null, 2);

  return `
You are an AI life coach creating a personalized action plan for a user. Below is the user information:

User Goal: ${selectedGoal}

Relevant Questions & User's Answers:

${questionsAndAnswers || "No specific questions answered yet"}

IMPORTANT: Instead of creating new tasks, you MUST select tasks ONLY from the provided task library below:

${allTasksLibraryString}

Create a 30-day action plan by selecting appropriate tasks from the library. Your plan should help the user achieve their goal progressively.

Your response should be in valid JSON format with the following structure:

{
  "plan": {
    "start_date": "${startDate.toISOString().split("T")[0]}",
    "end_date": "${endDate.toISOString().split("T")[0]}"
  },
  "tasks": [
    {
      "task":ObjectId(id)
      "startDate": YYYY-MM-DDTHH:mm,
      "endDate": YYYY-MM-DDTHH:mm,
    },
    // More tasks...
  ]
}

Guidelines:

1. Using the 1-3 tasks per day spread over the next month according to user answer about available days of the week.

2. Ensure tasks are specific, actionable, and directly related to the user's goal

3. Do not repeat the same tasks if more options are available or at least don't repeat them too close together.

4. If you schedule an easy or quick task, also assign another task on that day.

5. Schedule tasks at times that align with the user's preferences from their answers, as well as enough tasks to cover the user's available time.

6. Ensure each task's duration is reasonable (5-90 minutes).

7. Avoid scheduling tasks too close together on the same day

8. Your response MUST be valid JSON only, with no additional text or explanations

9. YOU MUST ONLY SELECT TASKS FROM THE PROVIDED LIBRARY - do not create new tasks

IMPORTANT: Return ONLY the JSON object with no additional explanation or text.
`;
}

function generateChatPrompt(userMessage, messages, currentUser) {
  // Get current date in user-friendly format
  const today = new Date();
  const formattedDate = today.toLocaleDateString();

  // Extract goal details and task information from user
  const goalDetails = currentUser?.goal_details || {};
  const selectedGoal = goalDetails.selectedGoal || "No specific goal set";

  // Extract tasks from plan
  const planTasks = extractTasksFromPlan(currentUser);

  // Format goal-related questions and answers
  let questionsAndAnswers = "";
  if (goalDetails.questions && goalDetails.questions.length > 0) {
    questionsAndAnswers = goalDetails.questions
      .map(
        (q) =>
          `Question: ${q.question || q.title}\nAnswer: ${
            q.user_answer || "Not answered"
          }`
      )
      .join("\n");
  }

  // Format conversation history (limit to last 10 exchanges)
  const recentMessages = messages
    .slice(-10)
    .map((msg) => {
      return `${msg.user ? "User: " + msg.user : ""}${
        msg.bot ? "\nAssistant: " + msg.bot : ""
      }`;
    })
    .join("\n\n");

  return `
You are a friendly, concise life coach assistant helping a user with their personal development journey.

TODAY'S DATE: ${formattedDate}

USER INFORMATION:

Goal: ${selectedGoal}

User's Tasks: ${planTasks}

Goal-Related Questions & Answers: ${
    questionsAndAnswers || "No specific questions answered yet"
  }

CONVERSATION CONTEXT:

${recentMessages}

USER'S CURRENT QUESTION: ${userMessage}

Guidelines for your response:

1. Keep answers concise - between one line and a short paragraph

2. Be supportive, empathetic, and motivational

3. Focus specifically on the user's goal and planned tasks when relevant

4. If you need clarification to give a good answer, ask ONE brief follow-up question

5. Don't introduce yourself or use unnecessary pleasantries - just answer directly

6. If asked about tasks, provide specific implementation advice when possible

7. Maintain a warm, personal coaching style

8. Always refer to today's date as ${formattedDate} when discussing today's tasks

Respond conversationally as if you're a supportive coach:
`;
}

function extractTasksFromPlan(currentUser) {
  if (!currentUser || !currentUser.plan || !currentUser.plan.tasks) {
    return "No tasks in current plan";
  }

  return currentUser.plan.tasks
    .map((taskItem) => {
      const taskDetails = taskItem.task;
      if (taskDetails) {
        const startDate = new Date(taskItem.startDate).toLocaleDateString();
        return `Task: ${taskDetails.content} (${startDate}) - ${
          taskItem.done ? "Completed" : "Pending"
        }`;
      }
      return null;
    })
    .filter(Boolean)
    .join("\n");
}

module.exports = router;
