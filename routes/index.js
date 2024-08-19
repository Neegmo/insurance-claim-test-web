const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/User");

const router = express.Router();

router.get("/", (req, res) => {
  res.redirect("/main");
});

// Render login page
router.get("/login", (req, res) => {
  res.render("login");
});

// Register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    user = new User({ username, email, password });
    await user.save();
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Login
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/main",
    failureRedirect: "/login",
    // failureFlash: true,
  })
);

// Render main page
router.get("/main", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("main", { user: req.user });
  } else {
    res.redirect("/login");
  }
});

// Render leaderboard page
router.get("/leaderboard", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const users = await User.find({ score: { $gt: 0 } }).sort({ score: -1 });
      const scores = users.map((user) => ({
        username: user.username,
        score: user.score,
      }));
      res.render("leaderboard", { users });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  } else {
    res.redirect("/login");
  }
});

// Route to update the user's score
router.post("/update-score", async (req, res) => {
  try {
    const { score } = req.body;

    // Find the currently logged-in user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's score
    if (user.score < score) user.score = score;
    await user.save();

    res.json({ success: true, message: "Score updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

module.exports = router;
