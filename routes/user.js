const express = require("express");
const User = require('../models/user');
const generateAuthToken = require('../models/user');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

//new user
// router.post('/user',async (req,res)=>{
//     let user =  new User({
//             name:req.body.name,
//             email:req.body.email,
//             passwordHash:bcrypt.hashSync(req.body.password,10),
//             phone:req.body.phone,
//             isAdmin:req.body.isAdmin,
//             apartment:req.body.apartment,
//             zip:req.body.zip,
//             street:req.body.street,
//             city:req.body.city,
//             country:req.body.country
//         })
//         //register new user
        //new user
router.post('/register',async (req,res)=>{
    let user =  new User({
            name:req.body.name,
            email:req.body.email,
            passwordHash:bcrypt.hashSync(req.body.password,10),
            phone:req.body.phone,
            isAdmin:req.body.isAdmin,
            apartment:req.body.apartment,
            zip:req.body.zip,
            street:req.body.street,
            city:req.body.city,
            country:req.body.country
        })
        // const salt = await bcrypt.genSalt(10);
        // user.passwordHash = await bcrypt.hash(passwordHash,salt);
     user = await user.save();
     const token = user.generateAuthToken();
     res.header('x-auth-token',token).send({user:user.email,token:token});
     if(!user)
     return res.status(404).send('The user cannot be created!');
    
    });
     
    //get list of all users
    router.get('/users',[auth,admin],async(req,res)=>{
        const users = await User.find().select('-passwordHash');
        if(!users){
            res.status(500).json({success:false})
        }
        res.send(users);
    })
    //get user by id
    router.get('/user/:id',[auth,admin],async(req,res)=>{
        const user = await User.findById(req.params.id).select('-passwordHash');
        if(!user){
            res.status(500).json({message:'The user with the given ID was not found'})
        }
        res.status(200).send(user);
    })
    //user login
    router.post('/user/login',async(req,res)=>{
        const user = await User.findOne({email:req.body.email})
        const secret = process.env.secret
        if(!user){       
            return res.status(400).send('The user not found');
        }
        if(user && bcrypt.compareSync(req.body.password,user.passwordHash)){
            const token = user.generateAuthToken();
            res.status(200).send({user:user.email,token:token})
        }else{
            res.status(400).send('password is wrong!');
        }
        return res.status(200).send(user)
    
    })
      //count number of users
      router.get('/usercount',auth,async(req,res)=>{
        const userCount = await User.countDocuments((count)=>count);
        if(!userCount){
            res.status(500).json({success:false})
        }
        res.send({userCount:userCount});
    })
       //delete user
    router.delete('/user /:id',[auth,admin],async(req,res)=>{
        let deleteuser = await User.findByIdAndRemove(req.params.id);
             if(deleteuser){
                 return res.status(200).json({success:true,message:'The User is deleted success'});
 
             }else{
                 return res.status(404).json({success:false,message:"User not found"})
             }
             
         })
      

 
 
module.exports  = router