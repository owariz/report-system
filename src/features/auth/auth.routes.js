const express = require('express');
const router = express.Router();
const AuthRepository = require('./auth.repository');
const AuthService = require('./auth.service');
const AuthController = require('./auth.controller');
const authenticate = require('./auth.middleware');

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/logout', authenticate, authController.logout);
router.put('/status', authenticate, authController.updateStatus);
router.get('/refresh', authController.refreshToken);
router.get('/verifyemail', authController.verifyEmail);
router.get('/@me', authenticate, authController.getMe);

module.exports = router; 