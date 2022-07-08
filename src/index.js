const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();
const port = process.env.PORT;

// const multer = require("multer");
// const upload = multer({
//   dest: "images",
//   limits: {
//     fileSize: 1000000,
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(doc|docx)$/)) {
//       return cb(new Error("Please upload a Word document"));
//     }

//     cb(undefined, true);

//     // cb(new Error('File must be a PDF'))
//     // cb(undefined, true)
//     // cb(undefined, false)
//   },
// });

// app.post(
//   "/upload",
//   upload.single("upload"),
//   (req, res) => {
//     res.send();
//   },
//   (error, req, res, next) => {
//     res.status(400).send({ error: error.message });
//   }
// );

////////////////////////////////////////////////////////////////////////////
// Goal 8: Setup middleware for maintenance mode
//
// 1. Register a new middleware function
// 2. Send back maintenance message with a 503 status code
// 3. Try your requests from the server and confirm status/message shows
////////////////////////////////////////////////////////////////////////////

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log("Server is up on port " + port);
});

//
// Without middleware: new request -> run route handler
//
// With middleware: new request -> do something -> run route handler
//

////////////////////////////////////////////////////////////////////////////
// Goal 6: Create task router
//
// 1. Create new file that creates/exports new router
// 2. Move all the task routes over
// 3. Load in an use that router with the express app
// 4. Test your work
////////////////////////////////////////////////////////////////////////////
