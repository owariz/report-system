const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign({ uid: user.uid }, process.env.JWT_SECRET, { expiresIn: '5m' });
};

module.exports = generateToken;