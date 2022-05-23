const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/**
 * User Schema
 */
var UserSchema = new Schema({
  username: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true,
  },
  motdepasse: {
    type: String,
  },
});

mongoose.model("User", UserSchema);
