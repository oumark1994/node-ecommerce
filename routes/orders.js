const express = require("express");
const Order = require('../models/order');
const OrderItem = require('../models/order-item');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin')


const router = express.Router();
//create order
router.post('/orders',auth,async (req,res)=>{
    let orderItemsIds = Promise.all( req.body.orderItems.map(async orderItem=>{
        let newOrderItem = new OrderItem({
            quantity:orderItem.quantity,
            product:orderItem.product
        })
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id
    }))
    const orderItemIdsResolved = await orderItemsIds;
    const totalPrices = await Promise.all(orderItemIdsResolved.map(async(orderItemId)=>{
        const orderItem = await OrderItem.findById(orderItemId).populate('product','price');
        const totalPrice = orderItem.product.price *  orderItem.quantity;
        return totalPrice

    }))
    //get total amount
    const totalPrice = totalPrices.reduce((a,b)=>a +b ,0);
    console.log(totalPrice)
    let order =  new Order({
            orderItems:orderItemIdsResolved ,
            shippingAddress1:req.body.shippingAddress1,
            shippingAddress2:req.body.shippingAddress2,
            city:req.body.city,
            zip:req.body.zip,
            country:req.body.country,
            phone:req.body.phone,
            status:req.body.status,
            totalPrice:totalPrice,
            user:req.body.user,
 


        })
     order = await order.save();
     if(!order)
     return res.status(404).send('The order cannot be created!')
     res.send(order)
    });
    //get all order
    router.get('/orders',[auth,admin],async(req,res)=>{
        const orderList = await Order.find().populate('user','name').sort({'dateOrdered':-1});
        if(!orderList){
            res.status(500).json({success:false})
        }
        res.status(200).send(orderList);
    });
        //get  order by
        router.get('/order/:id',[auth,admin],async(req,res)=>{
        const order = await  Order.findById(req.params.id).populate('user','name')
        .populate({path:'orderItems',populate:{path:'product',populate:'category'}});
            if(!order){
                res.status(500).json({success:false})
            }
            res.status(200).send(order);
        });
    //delete order
    router.delete('/order/:id',[auth,admin],async(req,res)=>{
       let deleteorder = await Order.findByIdAndRemove(req.params.id).then(async order=>{
           if(order){
               await order.orderItems.map(async orderItem=>{
                       await OrderItem.findByIdAndRemove(orderItem)
                   })
                   return res.status(200).json({success:true,message:'The Order is deleted success'});
           }else{
            return res.status(404).json({success:false,message:"Order not found"})

           }

       }).catch(err=>{
        return res.status(500).json({success:false,error:err})

       })
          
        })
        //get user order by id
        router.get('/userorders/:id',auth,async(req,res)=>{
            const userOrderList = await Order.find({user:req.params.id})
            .populate({path:'orderItems',populate:{path:'product',populate:'category'}})
            .sort({'dateOrdered':-1});
            if(!userOrderList){
                res.status(500).json({success:false})
            }
            res.status(200).send(userOrderList);
        })
          //update order by id
          router.put('/order/:id',auth,async(req,res)=>{
            const order = await Order.findByIdAndUpdate(req.params.id,
                {status:req.body.status},{new:true});
            if(!order){
                res.status(500).json({message:'The order with the given ID was not found'})
            }
            res.status(200).send(order);  
        })
        //get totalsales
        router.get('/get/totalsales',[auth,admin],async(req,res)=>{
            const totalSales = await Order.aggregate([
                { $group:{_id:null,totalsales : { $sum:'$totalPrice'}}}
            ])
            if(!totalSales){
                return res.status(400).send('The order sales cannot be generated')
            }
            res.send({totalSales:totalSales.pop().totalsales})
        })
  //count number of orders
  router.get('/ordercount',[auth,admin],async(req,res)=>{
    const orderCount = await Order.countDocuments((count)=>count);
    if(!orderCount){
        res.status(500).json({success:false})
    }
    res.send({orderCount:orderCount});
})

module.exports  = router
