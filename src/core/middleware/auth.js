const passport = require('passport');

/**
 * Middleware to protect routes using JWT authentication.
 * It verifies the token and attaches the user object to the request.
 */
const protect = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Unauthorized: Access token is missing or invalid.' });
    }
    req.user = user;
    return next();
  })(req, res, next);
};

/**
 * Middleware to protect and authorize admin-level roles.
 * It first authenticates the user via JWT (like 'protect') and then
 * checks if the authenticated user has ADMIN, SUPERADMIN, or DEVELOPER role.
 */
const isAdmin = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Unauthorized: Access token is missing or invalid.' });
    }
    req.user = user; // Attach user to the request object

    const authorizedRoles = ['ADMIN', 'SUPERADMIN', 'DEVELOPER'];
    if (authorizedRoles.includes(user.role)) {
      return next();
    }
    
    return res.status(403).json({ message: 'Forbidden: You do not have the required admin privileges.' });
  })(req, res, next);
};

module.exports = { protect, isAdmin }; 