const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/user");
const auth = require("../middleware/auth");
const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");
const router = new express.Router();

router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }

  // Original code
  // user
  //   .save()
  //   .then(() => {
  //     res.status(201).send(user);
  //   })
  //   .catch((e) => {
  //     res.status(400).send(e);
  //   });
});

/////////////////////////////////////////////////////////////////////////
// Goal 8: Have signup send back auth token
//
// 1. Generate a token fore the saved user
// 2. Send back both the token and the user
// 3. Create a new uesr from Postman and confirm the token is there
/////////////////////////////////////////////////////////////////////////

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

/////////////////////////////////////////////////////////////////////////
// Goal 9: Create a way to logout of all sessions
//
// 1. Setup POST /users/logout All
// 2. Create the router handler to wipe the tokens array
//    - Send 200 or 500
// 3. Test your work
//    - Login a few times and logout of all. Check database
/////////////////////////////////////////////////////////////////////////

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/users/me", auth, async (req, res) => {
  // get your own stuff
  res.send(req.user);

  // Get all users
  // try {
  //   const users = await User.find({});
  //   res.send(users);
  // } catch (e) {
  //   res.status(500).send();
  // }

  // Original code
  // User.find({})
  //   .then((users) => {
  //     res.send(users);
  //   })
  //   .catch((e) => {
  //     res.status(500).send();
  //   });
});

// router.get("/users/:id", async (req, res) => {
//   const _id = req.params.id;

//   try {
//     const user = await User.findById(_id);

//     if (!user) {
//       return res.status(404).send();
//     }

//     res.send(user);
//   } catch (e) {
//     res.status(500).send();
//   }

//   // Original code
//   // User.findById(_id)
//   //   .then((user) => {
//   //     if (!user) {
//   //       return res.status(404).send();
//   //     }

//   //     res.send(user);
//   //   })
//   //   .catch((e) => {
//   //     res.status(500).send();
//   //   });
// });

/////////////////////////////////////////////////////////////////////////
// Goal 10: Refactor the update profile route
//
// 1. Update the URL to /users/me
// 2. Add the authentication middleware into the mix
// 3. Use the existing user document instead of fetching via param id
// 4. Test your work in Postman!
/////////////////////////////////////////////////////////////////////////

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save();

    // Original code
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.status(500).send;
  }
});

/////////////////////////////////////////////////////////////////////////
// Goal 15: Setup endpoint for avatar upload
//
// 1. Add POST /users/me/avatar to user router
// 2. Setup multer to store uploads in an avatars directory
// 3. Choose name "avatar" for the key when registering the middleware
// 4. Send back a 200 response from route handler
// 4. Test your work. Create new Task App request and upload image
/////////////////////////////////////////////////////////////////////////
//
/////////////////////////////////////////////////////////////////////////
// Goal 16: Add validation to avatar upload route
//
// 1. Limit the upload size to 1 MB
// 2. Only allow jpg, jpeg, png
// 3. Test your work!
//    - Upload larger files (should fail)
//    - Upload non-images (should fail)
/////////////////////////////////////////////////////////////////////////

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }

    cb(undefined, true);

    // cb(new Error('File must be a PDF'))
    // cb(undefined, true)
    // cb(undefined, false)
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    // req.user.avatar = req.file.buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

/////////////////////////////////////////////////////////////////////////
// Goal 17: Clean up error handling
//
// 1. Setup an error handler function
// 2. Send back a 400 with the error message
// 3. Test your work!
/////////////////////////////////////////////////////////////////////////

router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

/////////////////////////////////////////////////////////////////////////
// Goal 18: Setup route to delete avatar
//
// 1. Setup DELETE /users/me/avatar
// 2. Add authentication
// 3. Set the field to undefined and save the user sending back a 200
// 3. Test your work by creating new request for Task App in Postman
/////////////////////////////////////////////////////////////////////////

module.exports = router;
