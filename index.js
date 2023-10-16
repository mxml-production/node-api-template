require('dotenv').config();

const PORT = process.env.PORT || 5000;

const express = require('express');
const cors = require('cors');

const endpointsList = require('./src/utils/EndpointsList');
const connectDB = require('./src/config/database');

const { limiter } = require('./src/middlewares/rate-limiter.middleware');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(limiter)

app.use('/api', require('./src/routes'));

app.listen(PORT, () => {
    console.log(`✅ Server listening http://localhost:${PORT}`);
    if (process.env.NODE_ENV !== 'production') console.table(endpointsList(app));
});