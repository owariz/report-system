const express = require('express');
const router = express.Router();

class HealthcheckController {
  health = (req, res) => {
    res.status(200).send('API is running');
  };
}

router.get('/healthcheck', (req, res) => {
    res.status(200).send('API is running');
});

module.exports = HealthcheckController;