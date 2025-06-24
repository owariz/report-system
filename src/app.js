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

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
      ? ['your-production-domain.com']  
      : ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
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