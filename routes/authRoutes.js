const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// Route to render the login page
router.get('/login', (req, res) => {
    res.render('login', { title: 'Login'});
});

// Route to render the signup page
router.get('/signup', (req, res) => {
    res.render('signup', { title: 'Signup'});
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