const dotenv= require('dotenv');
dotenv.config();
const express = require('express')
const app= express();
const mongoose = require('mongoose')
const cors = require('cors')
const PORT = process.env.PORT || 3000
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected',()=>{
    console.log(`Connected to MongoDB ${mongoose.connection.name}`)
});

app.use(cors({origin: 'http://localhost:5173'}))
app.use(express.json())


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