const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/**
 * Task Schema
 */
var TaskSchema = new Schema({
  description: {
    type: String,
    trim: true,
    required: true,
  },
  faite: {
    type: Boolean,
    required: true,
  },
  crééePar: {
    type: Number,
  },
});

mongoose.model("Task", TaskSchema);
