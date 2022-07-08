const mongoose = require("mongoose");

////////////////////////////////////////////////////////////////////////////
// Goal 1: Create a model for tasks
//
// 1. Define the model with description and completed fields
// 2. Create a new instance of the model
// 3. Save the model to the database
// 4. Test your work!
////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////
// Goal 9: Add validation and sanitaization to task
//
// 1. Trim the description and make it required
// 2. Make completed optional and default it to false
// 3. Test your work with and without errors
////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////
// Goal 13: Refactor task model to add timestamps
//
// 1. Explicitly create schema
// 2. Setup timestamps
// 3. Create tasks from Postman to test work
////////////////////////////////////////////////////////////////////////////
const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
