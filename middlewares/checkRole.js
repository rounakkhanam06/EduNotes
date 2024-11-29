// Middleware to check if user is a teacher
function isTeacher(req, res, next) {
    if (req.user && req.user.role === 'teacher') {
        return next();
    }
    res.status(403).send('Access denied');
}

// Middleware to check if user is a student
function isStudent(req, res, next) {
    if (req.user && req.user.role === 'student') {
        return next();
    }
    res.status(403).send('Access denied');
}

module.exports={isTeacher,isStudent};