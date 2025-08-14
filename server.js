require('dotenv').config();
const express = require('express');
const app= express();
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  'https://spareeye.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json({ limit: '60kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors ());

const testJwtRouter = require('./controllers/test-jwt')
const authRouter = require('./controllers/auth')
const userRouter = require('./controllers/users')
const requestRouter = require('./controllers/requests')

app.use('/auth',authRouter)
app.use('/users',userRouter)
app.use('/requests',requestRouter)
app.use('/test-jwt',testJwtRouter)

app.listen(PORT,()=>{
    console.log('The Server is running on port 3000')
})