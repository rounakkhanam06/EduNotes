// Middleware to check if user is a Teacher
function isTeacher(req, res, next) {
    if (req.user && req.user.role === 'Teacher') {
        return next();
    }
    res.status(403).send('Access denied');
}
// Middleware to check if user is a admin
function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'Admin') {
        return next();
    }
    res.status(403).send('Access denied');
}
// Middleware to check if user is a student
function isStudent(req, res, next) {
    if (req.user && req.user.role === 'Student') {
        return next();
    }
    res.status(403).send('Access denied');
}


module.exports={isTeacher,isStudent,isAdmin};