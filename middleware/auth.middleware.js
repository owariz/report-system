const passport = require('passport');

const authenticate = (req, res, next) => {
    passport.authenticate('jwt', { session: false, failWithError: true }, (err, user, info) => {
        if (err || !user) {
            return res.status(401).json({ isErrror: true, message: 'Unauthorized: Invalid token' });
        }
        req.user = user;
        next();
    })(req, res, next);
};

module.exports = authenticate;
