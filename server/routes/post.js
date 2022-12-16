const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')

const Post = require('../models/Post')

router.post('/',verifyToken, async (req, res) => {
    const { title, description, url, status } = req.body

    if (!title)
        return res
            .status(400)
            .json({ success: false, message: 'Title is required' })

    try {
        const newPost = new Post({ 
            title, 
            description, 
            url: url.startsWith('https://') ? url : `https://${url}` ,
            status: status || 'TO LEARN',
            user: req.userId,

        })
        await newPost.save()
        res.json({success: true, message: 'Happy learning!', post: newPost})
    }catch(err){
        res.status(500).json({ success: false, message: "Internal server error" })
    }

})
// @route GET api/posts
// @desc Get posts
// @access Private

router.get('/', verifyToken, async (req, res) => {
    try{
        const posts = await Post.find({user: req.userId}).populate('user',['username'])
        res.json({success: true, posts})
    }catch(err){
        console.log(err);
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
})


// @route Put api/posts
// @desc Update posts
// @access Private

router.put('/:id', verifyToken, async(req, res) => {
    const {title, description, url, status} = req.body
        console.log(req.body);
        if (!title)
            return res
                .status(400)
                .json({ success: false, message: 'Title is required' })

    try {
        let updatePost = { 
            title, 
            description: description || '',
            url: url.startsWith('https://') ? url : `https://${url}` || '',
            status: status || 'TO LEARN'
        }
        const postUpdateCondition = {_id: req.params.id, user: req.userId}
        updatePost = await Post.findOneAndUpdate(postUpdateCondition, updatePost, {new: true})
        console.log(updatePost);


        // user not authorised to update post

        if(!updatePost)
            return res.status(401)
                .json({
                    success:false,
                    message: 'Post not found or user not authorised'
                })
        res.json({success: true, message: 'Excellent progress!', post:updatePost})
            
        }catch(err){
            res.status(500).json({ success: false, message: "Internal server error" })
        }
    })

// @route Delete api/posts
// @desc Delete posts
// @access Private
router.delete('/:id', verifyToken, async(req, res) => {

    try {

        const postDeleteCondition = {_id: req.params.id, user: req.userId}
        const deletePost = await Post.findOneAndDelete(postDeleteCondition)

        console.log(deletePost);
        // user not authorised to update post

        if(!deletePost)
            return res
                .status(401)
                .json({
                    success:false,
                    message: 'Post not found or user not authorised'
                })
        res.json({success: true,post:deletePost})
            
    }catch(err){
            res.status(500).json({ success: false, message: "Internal server error" })
        }
    })



module.exports = router