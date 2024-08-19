require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
require("./config/passport")(passport);
const dotenv = require("dotenv");
const path = require("path");
const User = require("./models/User"); // Ensure User model is required

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

const session = require("express-session");

// Session middleware
app.use(
  session({
    secret: process.env.SECRET_OR_KEY, // Use the same secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using https
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set the view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Passport middleware
app.use(passport.initialize());
require("./config/passport")(passport);

// Routes
app.use("/", require("./routes/index"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
