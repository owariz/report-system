require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 4400;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
}); 