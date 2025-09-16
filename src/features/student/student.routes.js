const express = require('express');
const router = express.Router();
const studentController = require('./student.controller');
const { protect, admin } = require('../../core/middleware/auth');

// @route   POST /api/v1/admin/students
// @desc    Create a new student
// @access  Private/Admin
router.post('/', protect, admin, studentController.createStudent);

module.exports = router;
