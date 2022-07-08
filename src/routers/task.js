const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const router = new express.Router();

////////////////////////////////////////////////////////////////////////////
// Goal 10: Refactor task routes to use async/await
//
// 1. Refactor task routes to use async/await
// 2. Test all routes in Postman
////////////////////////////////////////////////////////////////////////////

router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/tasks", auth, async (req, res) => {
  // const task = new Task(req.body);
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });

  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }

  // Original code
  // task
  //   .save()
  //   .then(() => {
  //     res.status(201).send(task);
  //   })
  //   .catch((e) => {
  //     res.status(400).send(e);
  //   });
});

////////////////////////////////////////////////////////////////////////////
// Goal 13: Refactor GET /tasks
//
// 1. Add authentication
// 1. Return tasks only for the authenticatied user
// 2. Test your work!
////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////
// Goal 14: Setup support for skip
//
// 1. Setup "skip" option
//    - Parse query value to interger
// 1. Fire off some requests to test it's working
//    - Fetch the 1st page of 2 and then the 3rd page of 2
//    - Fetch the 1st page of 3 and then the 2nd page of 3
////////////////////////////////////////////////////////////////////////////

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    //                              if---^    ^--else
  }

  try {
    // const tasks = await Task.find({ owner: req.user._id });
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send();
  }

  // Original code
  // Task.find({})
  //   .then((tasks) => {
  //     res.send(tasks);
  //   })
  //   .catch((e) => {
  //     res.status(500).send();
  //   });
});

router.get("/tasks", auth, async (req, res) => {
  try {
    await req.user.populate("tasks").execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (e) {
    res.status(500).send();
  }

  // Original code
  // Task.findById(_id)
  //   .then((task) => {
  //     if (!task) {
  //       return res.status(404).send();
  //     }

  //     res.send(task);
  //   })
  //   .catch((e) => {
  //     res.status(500).send();
  //   });
});

/////////////////////////////////////////////////////////////////////////
// Goal 4: Allow for task updates
//
// 1. Setup the route handler
// 2. Send error if unknown updates
// 3. Attempt to update the task
//    - Handle task not found
//    - Handle validation errors
//    - Handle success
// 4. Test your work!
/////////////////////////////////////////////////////////////////////////
//
/////////////////////////////////////////////////////////////////////////
// Goal 7: Change how tasks are updated
//
// 1. Find the task
// 2. Alter the task properties
// 3. Save the task
// 4. Test your work by updating a task from Postman
/////////////////////////////////////////////////////////////////////////

router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,

      // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      //   new: true,
      //   runValidators: true,
      // });
    });

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

////////////////////////////////////////////////////////////////////////////
// Goal 5: Allow for removal of tasks
//
// 1. Setup the endpoint handler
// 2. Attempt to delete the task buy id
//    - Handle success
//    - Handle task not found
//    - Handle error
// 3. Test your work
////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////
// Goal 12: Refactor DELETE /tasks/:id
//
// 1. Add authentication
// 1. Find the task by _id/owner (findOneAndDelete)
// 2. Test your work!
////////////////////////////////////////////////////////////////////////////

router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      res.status(404).send();
    }

    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

////////////////////////////////////////////////////////////////////////////
// Goal 2: Setup the task creation endpoint
//
// 1. Create a separate file for the task model (load it into index.js)
// 2. Create the task creation endpoint (handle success and error)
// 3. Test the endpoint from postman with good and bad data
////////////////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////////////////
// Goal 3: Setup the task reading endpoint
//
// 1. Create an endpoint for fetching all tasks
// 2. Create an endpoint for fetching a task by its id
// 3. Set up new requests in postman and test your work
////////////////////////////////////////////////////////////////////////////

module.exports = router;
