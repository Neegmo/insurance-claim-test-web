const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/User");

const router = express.Router();

// Redirect root to the main page
router.get("/", (req, res) => {
  res.redirect("/main");
});

// Render login page
router.get("/login", (req, res) => {
  res.render("login");
});

// Register new user
router.post("/register", async (req, res) => {
  const { username, email, password, isAdmin } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    user = new User({
      username,
      email,
      password,
      isAdmin: isAdmin ? true : false,
    });

    await user.save();
    res.redirect("/main");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Login user
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/main",
    failureRedirect: "/login",
  })
);

// Render main page with user list
router.get("/main", async (req, res) => {
  try {
    const users = await User.find({});
    res.render("main", { users });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Delete user
router.post("/delete/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect("/main");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Logout user
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

module.exports = router;
