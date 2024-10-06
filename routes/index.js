const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Importing the User model
const ClaimForm = require("../models/ClaimForm"); // Claim form model

const router = express.Router();

// Route for user registration
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
    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Route for user login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const payload = { id: user._id, username: user.username, isAdmin: user.isAdmin };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Route to create claim form (restricted to authenticated users)
router.post("/claim", passport.authenticate("jwt", { session: false }), async (req, res) => {
  const { formData } = req.body;
  try {
    const newClaim = new ClaimForm({ formData, user: req.user._id });
    await newClaim.save();
    res.status(201).json({ msg: "Claim form submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Route to retrieve claim forms (restricted to admins)
router.get("/claim", passport.authenticate("jwt", { session: false }), async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ msg: "Access denied" });

  try {
    const claims = await ClaimForm.find().populate("user", "username email");
    res.json(claims);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Route to delete claim form (restricted to admins)
router.delete("/claim/:id", passport.authenticate("jwt", { session: false }), async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ msg: "Access denied" });

  try {
    await ClaimForm.findByIdAndDelete(req.params.id);
    res.json({ msg: "Claim form deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
