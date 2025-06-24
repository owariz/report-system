const express = require('express');
const router = express.Router();
const HealthcheckController = require('./healthcheck.controller');
const healthcheckController = new HealthcheckController();

router.get('/healthcheck', healthcheckController.health);

module.exports = router; 