const express = require('express');
const cors = require('cors');
const passport = require('passport');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const passportConfig = require('./core/config/passport-config');
const errorHandler = require('./core/middleware/errorHandler');
const apiRoutes = require('./api');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const defaultProductionOrigin = 'http://localhost:4000/'; // Fallback if CORS_ORIGIN is not set
const productionOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [defaultProductionOrigin];

const corsOptions = {
  origin: (origin, callback) => {
    if (process.env.NODE_ENV !== 'production') {
      if (!origin || origin === 'http://localhost:5173') {
        return callback(null, true);
      } else {
        return callback(null, true);
      }
    }
    // Production: Check against configured origins
    if (productionOrigins.indexOf(origin) !== -1 || (!origin && productionOrigins.includes('*'))) { // Also allow no origin if '*' is configured
      callback(null, true);
    } else {
      callback(new Error(`CORS policy does not allow access from origin ${origin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
// app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

passportConfig(passport);
app.use(passport.initialize());

// API Routes
app.use('/api/v1', apiRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client/dist/index.html'));
  });
}

app.use(errorHandler);

module.exports = app; 