const express = require("express");
const category = require("../models/category");
const Product = require('../models/product');
const Category = require('../models/category');
 const mongoose = require('mongoose');
 const multer = require('multer');
 const auth = require('../middleware/auth');
 const admin = require('../middleware/admin');
 mongoose.set('useFindAndModify', false);

 const FILE_TYPE_MAP ={
     'image/png':'png',
     'image/jpeg':'jpeg',
     'image/jpg':'jpg'
 }
 const storage = multer.diskStorage({
     destination:function(req,file,cb){
         const isValid = FILE_TYPE_MAP[file.mimetype];
         let uploadError = new Error('invalid image type');
         if(isValid){
             uploadError = null
         }
         cb(uploadError, 'public/uploads')
     },
     filename:function(req,file,cb){
         const filename = file.originalname.split('').join('-');
         const extention = FILE_TYPE_MAP[file.mimetype];
         cb(null,`${filename}-${Date.now()}.${extention}`)
     }
 })
 const uploadOptions = multer({storage:storage})
  const upload = multer({storage:storage})

const router = express.Router();
//create product
router.post('/product',uploadOptions.single('image'),[auth,admin], async(req,res)=>{
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category');
    const file = req.file;
    if(!file) return res.status(400).send('No image in the request')
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let product =  new Product({
       
            name:req.body.name,
            description:req.body.description,
            richDescription:req.body.richDescription,
            image:`${basePath}${fileName}`,
            brand:req.body.brand,
            price:req.body.price,
            category:req.body.category,
            countInStock:req.body.countInStock,
            rating:req.body.rating,
            numReview:req.body.numReview,
            isFeatured:req.body.isFeatured,

        })
       product  = await product.save();
       if(!product)
       return res.status(5000).send('The product cannot be created')
       res.send(product);
    });
    //get all product
    router.get('/product',async(req,res)=>{
        const productList = await Product.find();
        if(!productList){
            res.status(500).json({success:false})
        }
        res.send(productList);
    })
    //get single product by id
    router.get('/product/:id',async(req,res)=>{
        const product = await Product.findById(req.params.id).populate('category');
        if(!product){
            res.status(500).json({success:false})
        }
        res.send(product);
    })
         //update product by id
         router.put('/product/:id',[auth,admin],async(req,res)=>{
             if(!mongoose.isValidObjectId(req.params.id)){
               return res.status(400).send('Invalid Product id');

             }
            const category = await Category.findById(req.body.category);
            if(!category)
             return res.status(400).send('Invalid Category');
            const product = await Product.findByIdAndUpdate(req.params.id,
                {
                    name:req.body.name,
                    description:req.body.description,
                    richDescription:req.body.richDescription,
                    image:req.body.image,
                    brand:req.body.brand,
                    price:req.body.price,
                    category:req.body.category,
                    countInStock:req.body.countInStock,
                    rating:req.body.rating,
                    numReview:req.body.numReview,
                    isFeatured:req.body.isFeatured,    
                },{new:true});
            if(!product){
              return  res.status(500).json({message:'The product cannot be updated'})
            }
            res.status(200).send(product);
        })
           //delete product
    router.delete('/product/:id',[auth,admin],async(req,res)=>{
        let deleteproduct = await Product.findByIdAndRemove(req.params.id);
             if(deleteproduct){
                 return res.status(200).json({success:true,message:'The Product is deleted success'});
 
             }else{
                 return res.status(404).json({success:false,message:"Product not found"})
             }
             
         })
    //count number of product
    router.get('/productcount',[auth,admin],async(req,res)=>{
        const productCount = await Product.countDocuments((count)=>count);
        if(!productCount){
            res.status(500).json({success:false})
        }
        res.send({productCount:productCount});
    })
    //get featured product
    router.get('/productfeatured/:count',async(req,res)=>{
        const count = req.params.count ? req.params.count:0
        const products = await Product.find({isFeatured:true}).limit(+count);
        if(!products){
            res.status(500).json({success:false})
        }
        res.send({products});
    })
        //filter product by category
        router.get('/',async(req,res)=>{
            let filter = {};
            if(req.query.categories){
                filter = {category:req.query.categories.split(',')}
            }
            const productList = await Product.find(filter).populate('category');
            if(!productList){
                res.status(500).json({success:false})
            }
            res.send(productList);
        })
        //update image gallery
        // router.put('/gallery-images/:id',uploadOptions.array('images',10),async(req,res)=>{
        //     if(!mongoose.isValidObjectId(req.params.id)){
        //         return res.status(400).send('Invalid Product ID')
        //     }
        //     const files = req.files
        //     let imagesPaths =[];
        //     const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
        //     if(files){
        //         files.map(file=>{
        //             imagesPaths.push(`${basePath}${file.filename}`);
        //         })
        //     }
        //     const product = await Product.findByIdAndUpdate(req.params.id,{
        //         images:imagesPaths
        //     },{new:true})
        //     if(!product){
        //         return res.status(500).send('The product cannot be updated!')
        //         res.send(product)

        //     }
        // })


module.exports  = router
