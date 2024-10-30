const express = require('express');
const cors = require('cors');
const passport = require('passport');
const path = require('path');
const passportConfig = require('./config/passport-config');

const PORT = process.env.PORT || 3000;
const app = express();

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

passportConfig(passport);
app.use(passport.initialize());

// API Routes - ต้องอยู่ก่อน static files
app.use('/api/auth', require('./controller/authen.controller'));
app.use('/api', require('./controller/healthcheck.controller'));
app.use('/api/student', require('./controller/report.controller'));
app.use('/api/admin', require('./controller/admin/admin.controller'));

// Serve static files เฉพาะใน production mode
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/dist')));
    
    // Handle React routing in production
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/dist/index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something broke!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`);
});