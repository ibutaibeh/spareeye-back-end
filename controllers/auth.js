const express = require('express')
const router = express.Router();
const bcrypt = require('bcrypt')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const saltRounds = 12;

//Sign up
router.post('/sign-up', async(req,res)=>{
    try {
        const userInDatabase = await User.findOne({username: req.body.username})
        if(userInDatabase){
            return res.status(409).json({err: "user name is taken"})
        }

        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            hashedPassword: bcrypt.hashSync(req.body.password, saltRounds),
            role: req.body.role
        })

        const payload = {username: user.username, _id:user._id }
        const token = jwt.sign({payload},process.env.JWT_SECRET)

        res.status(201).json({token});

    } catch (error) {
        res.status(400).json({error: error.message})
    }
})

//sign in
router.post('/sign-in', async(req,res)=>{
    try {
        const user = await User.findOne({username: req.body.username})
        if(!user){
            return res.status(401).json({err: "invalid credentials"})
        }
        const isPasswordCorrect = bcrypt.compareSync(
            req.body.password,user.hashedPassword
        )
        if(!isPasswordCorrect){
            return res.status(401).json({err: 'invaliud credentials'})
        }

        const payload = {username: user.username, _id: user._id}

        const token = jwt.sign({payload},process.env.JWT_SECRET)

        res.status(200).json({token})

    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

module.exports = router;