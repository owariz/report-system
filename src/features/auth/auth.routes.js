const express = require('express');
const router = express.Router();
const AuthRepository = require('./auth.repository');
const AuthService = require('./auth.service');
const AuthController = require('./auth.controller');
const { authenticate } = require('../../core/middleware/auth');

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authenticate, authController.logout); // Changed GET to POST
router.put('/status', authenticate, authController.updateStatus);
router.post('/refresh', authController.refreshToken);
router.get('/verifyemail', authController.verifyEmail);
router.get('/@me', authenticate, authController.getMe);

module.exports = router; 