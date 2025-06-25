const passport = require('passport');

/**
 * Middleware to protect routes using JWT authentication.
 * It verifies the token and attaches the user object to the request.
 */
const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error during authentication.' });
    }
    if (!user) {
      // Check for specific messages from passport-jwt
      if (info && info.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
      }
      if (info && info.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Unauthorized: Token has expired.' });
      }
      return res.status(401).json({ message: 'Unauthorized: Access token is missing or invalid.' });
    }
    req.user = user;
    return next();
  })(req, res, next);
};

/**
 * Middleware to protect and authorize admin-level roles.
 * It first authenticates the user via JWT and then checks the role.
 */
const isAdmin = (req, res, next) => {
  authenticate(req, res, () => {
    const authorizedRoles = ['ADMIN', 'SUPERADMIN', 'DEVELOPER'];
    if (authorizedRoles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ message: 'Forbidden: You do not have the required admin privileges.' });
  });
};

module.exports = { authenticate, isAdmin }; 