require('dotenv').config()
const express = require('express')
const router = express.Router()
const argon2 = require('argon2')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const verifyToken = require('../middleware/auth')
const Post = require('../models/Post')

// @Router GET api/auth
// @desc check if user is logged in
// @access Public
router.get('/', verifyToken, async(req, res) => {
    try{
        const user = await User.findById(req.userId).select('.password')
        if (!user) return res.status(400).json({success: false, message: 'User not found'})
        res.json({success: true, user})
    }catch(err){
        console.log(err.message)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
})

// @route POST api/auth/register
// @desc Register user
// @access Public

router.post('/register', async (req, res) => {
    const { username, password } = req.body

    // Simple validation

    if (!username || !password)
        return res
            .status(400)
            .json({ success: false, message: 'Missing username and/or password' })

    try {
        //check for existing user
        const user = await User.findOne({ username })

        if (user) {
            return res.status(400).json({ success: false, message: 'Username already taken' })
        }
        else {
            //All good
            const hashedPassword = await argon2.hash(password)
            const newUser = new User({ username, password: hashedPassword })
            await newUser.save()

            // Return token
            const accessToken = jwt.sign(
                { userId: newUser._id },
                process.env.ACCESS_TOKEN_SECRET
            )
            res.json({ success: newUser._id, message: 'User create successful', accessToken })
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
})


// @route POST api/auth/login
// @desc Login user
// @access Public

router.post('/login', async (req, res) => {
    const { username, password } = req.body

    // simple validation
    if (!username || !password)
        return res
            .status(400)
            .json({ success: false, message: 'Missing username and/or password' })

    try {
        // check for exiting user
        const user = await User.findOne({ username })
        if (!user)
            return res.status(400).json({ success: false, message: 'Incorrect username or password' })

        // username found
        const passwordValid = await argon2.verify(user.password, password)
        if (!passwordValid)
            return res
                .status(400)
                .json({ success: false, message: 'Incorrect username or password' })

        //All good
        //return token
        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.ACCESS_TOKEN_SECRET
        )
        res.json({
            success: true,
            message: 'User logged in successful',
            accessToken,
            id:user._id
        })

    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal server error" })
    }

})


module.exports = router