const express = require("express");
const router = express.Router();
const Class = require("../models/Class");
const Note = require("../models/Note");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const { authenticateUser } = require("../middlewares/auth.js");


// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 }, fileFilter });

// File filter to accept specific file types
function fileFilter(req, file, cb) {
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'video/mp4', // Allow MP4 video files
        'video/x-msvideo', // Allow AVI video files
        'video/quicktime', // Allow MOV video files
        // Add more video types as needed
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type')); // Reject file if type is not allowed
    }
    cb(null, true); // Accept the file
}




// Configure multer for file uploads
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage,
//   limits: {  fileSize: 100 * 1024 * 1024 },
//   fileFilter,
// });


// // File filter function to allow only specific file types
// function fileFilter(req, file, cb) {
//   const allowedTypes = [
//     "application/pdf",
//     "image/jpeg",
//     "image/png",
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//      "video/mp4",
//      "video/mkv",
//      "video/avi",
//      "video/webm" 
//   ];
//   if (!allowedTypes.includes(file.mimetype)) {
//     return cb(new Error("Invalid file type"));
//     // Reject file if not allowed
//   }
//   cb(null, true);
//   // Accept file if allowed
// }

// Use middleware to authenticate the user for all routes in this router
router.use(authenticateUser);

// Route to display the index page with classes
router.get("/index", async (req, res) => {
  try {
    const teacherId = req.user.role === "teacher" ? req.user._id : null;
    
    const classes = await Class.find().populate({ path: 'teacher', model: 'User' }).exec();
    // Render the view
    res.render('classes/index', { 
      user: req.user, 
      classes, 
    });

    // Clear the message after displaying it
    req.session.message = null;
  } catch (err) {
    console.log(err);
  }
});

// Route to render the add-class form
router.get("/add-class", (req, res) => res.render("classes/add-class"));

// Route to handle adding a new class
router.post("/add-class", async (req, res) => {
  try {
    const { name } = req.body;

    if (!req.user) return res.status(401).send("User not authenticated");
    if (!name) return res.status(400).send("Class name is required");

    await Class.create({ name, teacher: req.user._id });
    req.session.message = {
      type: "success",
      message: "Class added successfully!",
    };
    return res.redirect("/index");
  } catch (err) {
    console.log(err);
    res.redirect("/index");
  }
});
// Route to render the edit-class form
router.get("/edit-class/:id", async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      req.session.message = {
        type: "error",
        message: "Class not found.",
      };
      return res.redirect("/index");
    }
    res.render("classes/edit-class", { classData, user: req.user });
  } catch (err) {
    console.log(err);
    res.redirect("/index");
  }
});
// Route to handle editing a class
router.post("/edit-class/:id", async (req, res) => {
  try {
    const { name } = req.body;
    if (!req.user) return res.status(401).send("User not authenticated");
    if (!name) return res.status(400).send("Class name is required");

    const updatedClass = await Class.findByIdAndUpdate(req.params.id, { name });
    if (!updatedClass) {
      req.session.message = {
        type: "error",
        message: "Class not found.",
      };
      return res.redirect("/index");
    }

    req.session.message = {
      type: "success",
      message: "Class updated successfully!",
    };
    res.redirect("/index");
  } catch (err) {
    console.log(err);
    res.redirect("/index");
  }
});

//Route for specific class
router.get("/class/:id", async (req, res) => {
  try {
    // Fetch class data and populate related fields
    const classData = await Class.findById(req.params.id)
      .populate("teacher") // populate the teacher field in the Class document with the actual document fron user.
      .populate("notes"); //populates the notes field in the Class document with documents from the Note collection.

    if (!classData) {
      req.session.message = { type: "error", message: "Class not found." };
      return res.redirect("/index");
    }

    // Fetch all users
    const users = await User.find().exec();

    // Render the class details page
    res.render("classes/class", {
      classData,
      user: req.user,
      message: req.session.message,
      users // Pass users to the view if needed
    });

    // Clear the message after rendering
    req.session.message = null;

  } catch (err) {
    // Handle any errors
    console.error(err); // Log the error for debugging
    
    res.redirect("/index");
  }
});


// Route to delete a class by ID
router.delete("/class/:id", async (req, res) => {
  try {
    const removedClass = await Class.findByIdAndDelete(req.params.id);
    if (!removedClass) {
      req.session.message = { type: "error", message: "Class not found." };
      return res.redirect("/index");
    }
    req.session.message = {
      type: "success",
      message: "Class deleted successfully!",
    };
    res.redirect("/index");
  } catch (err) {
    console.log(err);
    res.redirect("/index");
  }
});

module.exports = router;
