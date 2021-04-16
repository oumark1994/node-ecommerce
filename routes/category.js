const express = require("express");
const Category = require('../models/category');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');


const router = express.Router();
//create category
router.post('/category',[auth,admin],async (req,res)=>{
    let category =  new Category({
            name:req.body.name,
            icon:req.body.icon,
            color:req.body.color
        })
     category = await category.save();
     if(!category)
     return res.status(404).send('The category cannot be created!')
     res.send(category)
    });
    //get all category
    router.get('/category',async(req,res)=>{
        const categoryList = await Category.find();
        if(!categoryList){
            res.status(500).json({success:false})
        }
        res.status(200).send(categoryList);
    });
    //delete category
    router.delete('/category/:id',[auth,admin],async(req,res)=>{
       let deletecategory = await Category.findByIdAndRemove(req.params.id);
            if(deletecategory){
                return res.status(200).json({success:true,message:'The Category is deleted success'});

            }else{
                return res.status(404).json({success:false,message:"Category not found"})
            }
            
        })
        //get category by id
        router.get('/category/:id',[auth,admin],async(req,res)=>{
            const category = await Category.findById(req.params.id);
            if(!category){
                res.status(500).json({message:'The category with the given ID was not found'})
            }
            res.status(200).send(category);
        })
          //update category by id
          router.put('/category/:id',[auth,admin],async(req,res)=>{
            const category = await Category.findByIdAndUpdate(req.params.id,
                {name:req.body.name,icon:req.body.icon,color:req.body.color});
            if(!category){
                res.status(500).json({message:'The category with the given ID was not found'})
            }
            res.status(200).send(category);
        })


module.exports  = router
