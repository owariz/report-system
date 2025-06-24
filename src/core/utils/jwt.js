const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign({ uid: user.uid }, process.env.JWT_SECRET, { expiresIn: '1m' });
};

const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };