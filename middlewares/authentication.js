// Example of a simple authentication middleware

function isAuthenticated(req, res, next) {
    if (req.user) { // Check if req.user is set
        return next();
    }
    res.redirect('/login'); // Redirect if not authenticated
}

module.exports={isAuthenticated};