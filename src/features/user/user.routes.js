const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../../core/middleware/auth');

const UserRepository = require('./user.repository');
const UserService = require('./user.service');
const UserController = require('./user.controller');

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.get('/', protect, isAdmin, userController.getAllUsers);
router.post('/', protect, isAdmin, userController.createUser);
router.get('/:email/logs', protect, isAdmin, userController.getUserLogs);
router.delete('/:id', protect, isAdmin, userController.deleteUser);
router.put('/:id', protect, isAdmin, userController.updateUser);

module.exports = router; 