const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../../core/middleware/auth');

const UserRepository = require('./user.repository');
const UserService = require('./user.service');
const UserController = require('./user.controller');

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.get('/', authenticate, isAdmin, userController.getAllUsers);
router.post('/', authenticate, isAdmin, userController.createUser);
router.get('/:email/logs', authenticate, isAdmin, userController.getUserLogs);
router.delete('/:id', authenticate, isAdmin, userController.deleteUser);
router.put('/:id', authenticate, isAdmin, userController.updateUser);

module.exports = router; 