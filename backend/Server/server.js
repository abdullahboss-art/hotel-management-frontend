/* eslint-disable */

const express = require('express');
const cors = require('cors');
require('dotenv').config(); // load environment variables

const dbconnect = require('./Config/dbconnect'); // DB connection
const userRouter = require('./Routes/UserRoute'); // User routes

const app = express();

// Middleware
app.use(express.json()); // parse JSON requests
app.use(cors()); // enable CORS

// Database connection
dbconnect();

// Routes
app.use('/users', userRouter);
// Mount user routes at /list

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started running on port ${PORT}`);
});
