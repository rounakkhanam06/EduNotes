const express = require('express');
const router = express.Router();
//require models
const User = require('../models/User'); 

const Note = require('../models/Note'); 
const Class = require('../models/Class'); 

const { isAdmin } = require('../middlewares/checkRole.js');

// Route to display all users to admin
router.get('/show-users', isAdmin, async (req, res) => {
    try {
        const users = await User.find().exec(); // Fetch all users

        res.render('admin/show-users', { 
            user: req.user, 
            users
        });
    } catch (err) {
        console.error(err);
        req.session.message = {
            type: 'error',
            message: 'An error occurred while fetching users. Please try again later.'
        };
        res.redirect('/login');
    }
});


// Route to display all classes
router.get('/show-classes', isAdmin, async (req, res) => {
    try {
      const classes = await Class.find()
        .populate('Teacher', 'username') // Populating the Teacher's username
        .exec();
  
      
      const filteredClasses = classes.filter(classItem => {
        return classItem.Teacher && classItem.Teacher.role !== 'Admin'; // Adjust as needed
      });
  
      res.render('admin/show-classes', {
        user: req.user,
        classes: filteredClasses,
      });
    } catch (err) {
      console.error(err);
      req.session.message = {
        type: 'error',
        message: 'An error occurred while fetching classes. Please try again later.'
      };
      res.redirect('/admin/show-classes');
    }
  });



// Route to delete a user
router.post('/delete-user/:id', isAdmin, async (req, res) => {
    try {
      // Ensure admin can't delete themselves
      if (req.params.id === req.user._id.toString()) {
        req.session.message = {
          type: 'error',
          message: 'Admin cannot delete themselves.'
        };
        return res.redirect('/admin/show-users');
      }
  
      await User.findByIdAndDelete(req.params.id);
      req.session.message = {
        type: 'success',
        message: 'User deleted successfully.'
      };
      res.redirect('/admin/show-users'); // Redirect to the show users page after deletion
    } catch (err) {
      console.error(err);
      req.session.message = {
        type: 'error',
        message: 'An error occurred while deleting the user. Please try again later.'
      };
      res.redirect('/admin/show-users'); // Redirect to the show users page
    }
  });


// Route to delete a class
router.post('/delete-class/:id', isAdmin, async (req, res) => {
    try {
      await Class.findByIdAndDelete(req.params.id);
      req.session.message = {
        type: 'success',
        message: 'Class deleted successfully.'
      };
      res.redirect('/admin/show-classes'); // Redirect to the show classes page after deletion
    } catch (err) {
      console.error(err);
      req.session.message = {
        type: 'error',
        message: 'An error occurred while deleting the class. Please try again later.'
      };
      res.redirect('/admin/show-classes'); // Redirect to the show classes page
    }
  });

  

// Export the router
module.exports = router;
