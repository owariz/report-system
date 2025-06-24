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
const defaultProductionOrigin = 'your-production-domain.com'; // Fallback if CORS_ORIGIN is not set
const productionOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [defaultProductionOrigin];

const corsOptions = {
  origin: (origin, callback) => {
    if (process.env.NODE_ENV !== 'production') {
      // Allow all origins in development
      // or specific ones like 'http://localhost:5173'
      // For simplicity here, allowing if origin is localhost:5173 or not set (e.g. Postman)
      if (!origin || origin === 'http://localhost:5173') {
        return callback(null, true);
      } else {
        // For development, if you want to restrict to only localhost:5173 explicitly:
        // return callback(new Error(`CORS policy does not allow access from origin ${origin} in development`));
        // Allowing for flexibility in dev (e.g. other local ports, Postman) by allowing undefined origin
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
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

passportConfig(passport);
app.use(passport.initialize());

// API Routes
app.use('/api/v1', apiRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client/dist/index.html'));
  });
}

app.use(errorHandler);

module.exports = app; 