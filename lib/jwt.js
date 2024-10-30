const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign({ uid: user.uid }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

module.exports = generateToken;