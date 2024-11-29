require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const methodOverride = require('method-override');
const ejsLayouts = require('express-ejs-layouts');
const ejsMate = require('ejs-mate');
const passport = require('passport');
const { addUserToRequest, authenticateUser } = require('./middlewares/auth');
const passportConfig = require('./config/passport-config');

const app = express();

// Connect to MongoDB


mongoose.connect('mongodb://localhost:27017/classroom')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));



// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-default-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' } // Secure cookies in production
}));
// Middleware to handle session messages
app.use((req, res, next) => {
   // console.log('Session Message:', req.session.message); // Debugging line
    res.locals.message = req.session.message || {};
    delete req.session.message; // Clear the message after it has been set to locals
    next();
});


// Initialize Passport and restore authentication state
passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());

// Configure flash messages
// app.use(flash());

// Apply authentication middleware
app.use(addUserToRequest); // Apply globally



// Template engine setup
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.set('layout', 'layouts/boilerplate');

// Import route files
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const noteRoutes = require('./routes/noteRoutes');

// Root page
app.get('/', (req, res) => {
    res.render('home', { user: req.user });
});

// Authentication routes
app.use('/', authRoutes);

// Apply authentication middleware to class and note routes
app.use('/', authenticateUser, classRoutes);
app.use('/', authenticateUser, noteRoutes);

// Centralized error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
