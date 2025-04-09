const router = require("express").Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middlewares/jwt.middleware");

//first make a route to create a user with a hashed password
router.post("/signup", async (req, res) => {
  try {
    const salt = bcryptjs.genSaltSync(12);
    const hashedPassword = bcryptjs.hashSync(req.body.password, salt);
    const hashedUser = {
      ...req.body,
      password: hashedPassword,
    };

    //now we create the user in the DB
    const newUser = await User.create(hashedUser);
    console.log("user created successfully", newUser);
    res.status(201).json({ message: "user successfully created in DB" });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

//now a login route to find the user by their email and check if they know the password
router.post("/login", async (req, res) => {
  try {
    //we need to find the user based on their email
    const foundUser = await User.findOne({ email: req.body.email });
    if (!foundUser) {
      res.status(400).json({ errorMessage: "Email not found" });
    } else {
      //if you found the user based on the email then we compare the passwords
      const passwordFromFrontend = req.body.password; // '1234'
      const passwordHashedInDB = foundUser.password; //'ajdslfkjalkdfsjalsdfuoiajdfdsaf'
      const passwordsMatch = bcryptjs.compareSync(
        passwordFromFrontend,
        passwordHashedInDB
      );
      //   console.log("passwords match ? ", passwordsMatch);
      if (!passwordsMatch) {
        res.status(400).json({ errorMessage: "Password incorrect" });
      } else {
        //in this else block, the email exists and the password match
        //this the non secret data that we want to put into the jwt token
        const data = { _id: foundUser._id, username: foundUser.username };
        const authToken = jwt.sign(data, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });
        res.status(200).json({ message: "you logged in!", authToken });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

//this route checks if the token is present and valid
router.get("/verify", isAuthenticated, async (req, res) => {
  console.log("here in the verify route");
  res.status(200).json({ message: "Token valid", payload: req.payload });
});

module.exports = router;
