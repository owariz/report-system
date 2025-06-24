const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../../core/middleware/auth');
const DashboardController = require('./dashboard.controller');

const dashboardController = new DashboardController();

// @route   GET /api/v1/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/', protect, isAdmin, dashboardController.getDashboardStats);

module.exports = router; 