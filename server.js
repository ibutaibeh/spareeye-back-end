require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;



//connecting the MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch((error) => {
  console.log("MongoDB Connection Error:", err);
  process.exit(1);
});


//cors
const allowedOrigins = [
  'http://localhost:5173',
  'https://sparktadrib.onrender.com'
];


app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));


app.use(helmet());
app.use(express.json({ limit: '60kb' }));
app.use(express.urlencoded({ extended: true }));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);


const authRouter = require('./controllers/auth');
const userRouter = require('./controllers/users');
const requestRouter = require('./controllers/requests');
const testJwtRouter = require('./controllers/test-jwt');



app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/requests', requestRouter);
app.use('/test-jwt', testJwtRouter);


app.get('/', (req, res) => {
  res.json({ message: 'SpareEye API Is running' });
});


app.listen(PORT, () => {
  console.log(`The Server is running on port ${PORT}`);
});
