const express = require("express");
const router = express.Router();
const Class = require("../models/Class");
const Note = require("../models/Note");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const { authenticateUser } = require("../middlewares/auth.js");



// Use middleware to authenticate the user for all routes in this router
router.use(authenticateUser);


// Route to display the index page with classes
router.get("/index", async (req, res) => {
  try {
    // Ensure user is logged in before accessing this route
    if (!req.user) {
      return res.redirect('/login'); // Redirect to login if not authenticated
    }

    let classes;
    let users = []; // Initialize as empty array

    if (req.user.role === "Teacher") {
      // If the user is a Teacher, only show classes created by them
      classes = await Class.find({ Teacher: req.user._id })
        .populate({ path: 'Teacher', model: 'User' })
        .exec();

      // Render the view for Teachers
      return res.render('classes/index', { 
        user: req.user, 
        classes
      });
      
    } else if (req.user.role === "Admin") {
      // If the user is an admin, show all classes and all users
      classes = await Class.find().populate({ path: 'Teacher', model: 'User' }).exec();
      users = await User.find().exec();

      // Render the view for admins
      return res.render('admin/dashboard', { 
        user: req.user, 
        classes, 
        users
      });

    } else {
      // If the user is a student, show all classes
      classes = await Class.find().populate({ path: 'Teacher', model: 'User' }).exec();

      // Render the view for students
      return res.render('classes/index', { 
        user: req.user, 
        classes
      });
    }

    // Clear the message after displaying it
    req.session.message = null;
    
  } catch (err) {
    console.error(err); // Log the error for debugging
    req.session.message = {
      type: 'error',
      message: 'An error occurred while fetching classes. Please try again later.'
    };
    res.redirect('/login'); // Redirect to login or an error page
  }
})

// Route to render the add-class form
router.get("/add-class", (req, res) => res.render("classes/add-class"));

// Route to handle adding a new class
router.post("/add-class", async (req, res) => {
  try {
    const { name } = req.body;

    if (!req.user) return res.status(401).send("User not authenticated");
    if (!name) return res.status(400).send("Class name is required");

    await Class.create({ name, Teacher: req.user._id });
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
      .populate("Teacher") // populate the Teacher field in the Class document with the actual document fron user.
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
