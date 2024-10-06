const mongoose = require("mongoose");

const ClaimFormSchema = new mongoose.Schema({
  formData: { type: Object, required: true }, // The form data in JSON format
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the user submitting the form
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ClaimForm", ClaimFormSchema);
