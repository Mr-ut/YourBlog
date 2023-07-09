const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const adminLayout = '../views/layouts/admin';
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

// check login middleware

const awtMiddleware = (req,res,next)=>{
    const token = req.cookies.token;

    if(!token){
        res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token,jwtSecret);
        req.userId=decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
}



//GET
//Admin - login page

router.get('/admin', async (req, res) => {
  try {

    const locals = {
        title: "Admin Page",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
      }


    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }

});

//POST
//Admin - check login 

router.post('/admin', async (req, res) => {
    try {
        const { username,password } = req.body;
        const user = await User.findOne({ username });
        if(!user){
            res.status(401).json({ message: 'Invalid Credential'});
        }
        const isPassword = await bcrypt.compare(password,user.password);
        if(!isPassword){
            res.status(401).json({ message: 'Invalid Credential'});
        }

        const token = jwt.sign({ userId: user._id },jwtSecret)
        res.cookie('token', token, {httpOnly: true});
        res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }
  
  });

//GET
//Admin -Dashboard 

router.get('/dashboard',awtMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Admin Page",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
          }
        const data = await Post.find();
          res.render('admin/dashboard',{locals,data,layout: adminLayout});
    } catch (error) {
        console.log(error);
    }
});

//GET
//Admin Create new post
router.get('/add-post',awtMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Add Post",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
          }
        const data = await Post.find();
          res.render('admin/add-post',{locals,data,layout: adminLayout});
    } catch (error) {
        console.log(error);
    }
});


//POST
//Admin Create new post
router.post('/add-post',awtMiddleware, async (req, res) => {
    try {
        const newPost = new Post({
            title: req.body.title,
            body: req.body.body
        });
        await Post.create(newPost);
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});


//GET
//Admin Edit post
router.get('/edit-post/:id',awtMiddleware, async (req, res) => {
    try {
          const locals = {
            title: "Edit Post",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
          }
          const data = await Post.findOne({_id: req.params.id});
          res.render('admin/edit-post',{locals,data,layout: adminLayout});
    } catch (error) {
        console.log(error);
    }
});

//PUT
//Admin Edit post
router.put('/edit-post/:id',awtMiddleware, async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id,{
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        })
        res.redirect(`/edit-post/${req.params.id}`);
    } catch (error) {
        console.log(error);
    }
});



//DELETE
//Admin - Delete Post
router.delete('/delete-post/:id',awtMiddleware, async (req, res) => {
    try {
        await Post.deleteOne({ _id: req.params.id });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error)
    }
});


//GET
//Admin - Logout
router.get('/logout', (req,res)=>{
    res.clearCookie('token');
    //res.json({message: 'Logout successfully...'})
    res.redirect('/');
});



//   router.post('/admin', async (req, res) => {
//     try {
//         const { username,password } = req.body;
//         console.log(req.body);


//       res.redirect('/admin');
//     } catch (error) {
//       console.log(error);
//     }
  
//   });

/**
 * POST /
 * Admin - Register
*/
router.post('/register', async (req, res) => {
    try {
      const { username, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
  
      try {
        const user = await User.create({ username, password:hashedPassword });
        res.status(201).json({ message: 'User Created', user });
      } catch (error) {
        if(error.code === 11000) {
          res.status(409).json({ message: 'User already in use'});
        }
        res.status(500).json({ message: 'Internal server error'})
      }
  
    } catch (error) {
      console.log(error);
    }
  });







module.exports = router;