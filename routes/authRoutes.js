const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Route to render the login page
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login'});
});

// Route to render the signup page
router.get('/signup', (req, res) => {
    res.render('signup', { title: 'Signup'});
});

// Profile route using Passport's isAuthenticated method
router.get('/profile', (req, res) => {
    console.log('Rendering profile page');
    if (req.isAuthenticated()) {
        const user = req.user;
        console.log('User:', user); // Check user info
        res.render('profile', { title: 'Profile', user });
    } else {
        req.session.message = {
            type: 'error',
            message: 'Please log in to view your profile.'
        };
        res.redirect('/login');
    }
    console.log("Authenticated?", req.isAuthenticated());
console.log("User object:", req.user);
});


router.post('/login', passport.authenticate('local', {
    successRedirect: '/index',
    failureRedirect: '/login',

}), (req, res) => {
    try {
        req.session.message = {
            type: 'success',
            message: 'You are now logged in.'
        };
        console.log('Session Data:', req.session); 
        res.redirect('/index',{message:req.session.message});
    } catch (error) {
        req.session.message = {
            type: 'error',
            message: 'Invalid email and password'
        };
        res.redirect('/login');
    }
   
});


// Route to handle user signup
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password || !role) {
            req.session.message = {
                type: 'error',
                message: 'All fields are required.'
            };
            return res.redirect('/signup');
        }

        const user = new User({ username, email, password, role });
        await user.save()
        .then(()=>{
            req.session.message = {
            type: 'success',
            message: 'You are now registered. Please log in.'
        };
        res.redirect('/login');
        }).catch((err) => {
            // Handle database save error
            return res.status(500).json({ message: err.message, type: "danger" });
        }); 
    } catch (error) {
        console.log('error')
        res.redirect('/signup');
    }
});

//password change in the profile page
router.post('/change-password', async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
  
      const user = await User.findById(req.user._id);
  
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).send('Incorrect current password.');
      }
  
      user.password = newPassword; // pre-save hook will hash this
      await user.save();
  
      req.session.message = {
        type: 'success',
        message: 'Password changed successfully.'
      };
      res.redirect('/profile');
    } catch (err) {
      console.error(err);
      req.session.message = {
        type: 'error',
        message: 'Something went wrong.'
      };
      res.redirect('/profile');
    }
  });
// Route to handle user logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.session.message = {
            type: 'success',
            message: 'You are now logged out.'
        };
        res.redirect('/');
    });
});

module.exports=router;