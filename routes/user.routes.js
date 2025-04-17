const router = require("express").Router();
const User = require("../models/User.model");
const bcryptjs = require("bcryptjs");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer storage with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profile_pictures",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const upload = multer({ storage: storage });

// Get user by ID
router.get("/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId).populate([
      { path: "diaries" },
      { path: "goals" },
      { path: "feedbacks" },
      {
        path: "plan",
        populate: {
          path: "tasks.task",
          model: "Task",
        },
      },
    ]);
    const userCopy = currentUser;
    userCopy.password = null;

    res.status(200).json(userCopy);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// Update user properties
router.patch("/update/:property/:userId", async (req, res, next) => {
  const { userId, property } = req.params;
  switch (property) {
    case "email":
      try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
          res.status(500).json({ message: "Email already used" });
        } else {
          const updateUser = await User.findByIdAndUpdate(
            userId,
            { email: req.body.email },
            { new: true }
          );
          const userInDB = updateUser;
          userInDB.password = "********";
          res.status(200).json({ message: "Email update", userInDB });
        }
      } catch (error) {
        next(error);
      }
      break;
    case "password":
      try {
        const mysalt = bcryptjs.genSaltSync(12);
        const { oldPassword, newPassword } = req.body;
        const foundUser = await User.findById(userId);
        const doesPasswordMatch = bcryptjs.compareSync(
          oldPassword,
          foundUser.password
        );
        if (doesPasswordMatch) {
          // previous password != new password
          if (oldPassword != newPassword) {
            const updatePassword = bcryptjs.hashSync(newPassword, mysalt);
            const updateUser = await User.findByIdAndUpdate(
              userId,
              { password: updatePassword },
              { new: true }
            );
            const userInDB = updateUser;
            userInDB.password = "********";
            res
              .status(200)
              .json({ message: "Password updated with success", userInDB });
          } else {
            res.status(500).json({
              message:
                "The new password should be different than the previous password",
            });
          }
        } else {
          res.status(500).json({ message: "incorect password" });
        }
      } catch (error) {
        next(error);
      }
      break;
    case "username":
    case "goals":
    case "progression":
    case "level":
    case "diaries":
    case "plan":
    case "feedbacks":
    case "day_streak":
    case "previous_connexion":
    case "chat_history":
    case "google_connexion":
    case "goal_details":
    case "welcome_message":
    case "signupCompleted":
    case "chatbotPreference": // Add the new property
      const updateProperty = {
        [property]: req.body[property],
      };
      try {
        const updateUser = await User.findByIdAndUpdate(
          userId,
          updateProperty,
          { new: true }
        );
        const userInDB = updateUser;
        userInDB.password = "********";
        res.status(200).json({ message: `user ${property} update`, userInDB });
      } catch (error) {
        next(error);
      }
      break;
  }
});

// New route for handling profile picture upload
router.post(
  "/profilepic/:userId",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const { userId } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Update user with new profile pic URL
      const updateUser = await User.findByIdAndUpdate(
        userId,
        { profilepic: req.file.path },
        { new: true }
      );

      if (!updateUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const userInDB = updateUser;
      userInDB.password = "********";

      res.status(200).json({
        message: "Profile picture updated successfully",
        profilepic: req.file.path,
        userInDB,
      });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({ message: "Error updating profile picture" });
    }
  }
);

// Delete profile picture route
router.delete("/profilepic/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get current user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has a custom profile picture
    if (user.profilepic !== "defaultpic") {
      // Extract public ID from Cloudinary URL
      const publicId = user.profilepic.split("/").pop().split(".")[0];

      // Delete image from Cloudinary
      await cloudinary.uploader.destroy(`profile_pictures/${publicId}`);

      // Reset user profile pic to default
      const updateUser = await User.findByIdAndUpdate(
        userId,
        { profilepic: "defaultpic" },
        { new: true }
      );

      const userInDB = updateUser;
      userInDB.password = "********";

      res.status(200).json({
        message: "Profile picture deleted successfully",
        userInDB,
      });
    } else {
      res
        .status(400)
        .json({ message: "User already has default profile picture" });
    }
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    res.status(500).json({ message: "Error deleting profile picture" });
  }
});

// Delete user
router.delete("/:userId", (req, res) => {
  User.findByIdAndDelete(req.params.userId)
    .then(() => {
      res.status(204).send();
    })
    .catch((error) => {
      res.status(500).json({ message: "Error while deleting the user" });
    });
});

// Specific route to add a diary entry to user
router.patch("/:userId/diaries", async (req, res) => {
  try {
    const { userId } = req.params;
    const { diaryId } = req.body;

    if (!diaryId) {
      return res.status(400).json({ message: "diaryId is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { diaries: diaryId } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Diary added to user successfully" });
  } catch (error) {
    console.error("Error adding diary to user:", error);
    res.status(500).json({ message: "Error updating user with diary entry" });
  }
});

module.exports = router;
