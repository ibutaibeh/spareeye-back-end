const express = require('express')
const router = express.Router()
const User = require('../models/user')
const verifyToken= require('../middlewares/verifyToken')


router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


router.get('/',verifyToken, async(req,res)=>{
    try {
        const users = await User.find({},'username')
        res.json(users)
                
    } catch (error) {
        res.status(500).json({error:error.message})
    }
})

router.get('/:userId',verifyToken, async(req,res)=>{
    try {
        if(req.user._id!==req.params.userId){
            res.status(403).json({error: 'unauthorized'})
        }

        const user= await User.findById(req.params.userId)
        
        if(!user){
            return res.status(404).json({error: 'user not found'})
        }

        res.json({user})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})


module.exports=router;