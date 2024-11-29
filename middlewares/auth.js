// middlewares/auth.js
const passport = require('passport');

function addUserToRequest(req, res, next) {
    res.locals.user = req.user;
    next();
}

function authenticateUser(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = { addUserToRequest, authenticateUser };
