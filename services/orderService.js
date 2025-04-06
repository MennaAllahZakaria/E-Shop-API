/* eslint-disable no-restricted-globals */
/* eslint-disable import/no-extraneous-dependencies */
const stripe=require('stripe')(process.env.STRIPE_SECRET)

const asyncHandler=require("express-async-handler");
const handlerFactory=require("./handlerFactory");
const ApiError = require("../utils/ApiError")

const Order=require('../models/orderModel');
const Cart =require('../models/cartModel');
const Product=require('../models/productModel')

// @desc    create cash order
// @route   POST  /api/v1/orders/:cartId
// @access  Private/User

exports.createCashOrder=asyncHandler(async(req,res,next)=>{
    const taxPrice=0;
    const shippingPrice=0;

    const cart=await Cart.findById(req.params.cartId);
    if ( !cart){
        return next(new ApiError("Cart not found",404));
    }

    const cartPrice=(cart.totalPriceAfterDiscount?cart.totalPriceAfterDiscount:cart.totalPrice);

    const totalOrderPrice=cartPrice+taxPrice+shippingPrice;

    const order=await Order.create({
        user:req.user._id,
        cartItems:cart.cartItems,
        shippingAddress:req.body.shippingAddress,
        totalOrderPrice,
    });

    if (order){

        // make multiple opresiones on database
    const bulkOption=cart.cartItems.map((item)=>({
        updateOne:{
            filter:{_id:item.product},
            update:{$inc:{quantity:-item.quantity, sold:+item.quantity}}
            }
        })
    );

    await Product.bulkWrite(bulkOption,{})

    await Cart.findByIdAndDelete(req.params.cartId); 

    }
    

    res.status(201).json({
        success: true,
        data: order,
    });


});


// @desc    Get specific order 
// @route   GET  /api/v1/orders/:id
// @access  Private/User

exports.getOrder=handlerFactory.getOne(Order);


// @desc    filter orders based on user
exports.filterOrderForLoggedUser=asyncHandler(async(req,res,next)=>{

    if ( req.user.role==="user"){
        req.filterObj={user:req.user._id}
    }
    next();
})

// @desc    Get all orders 
// @route   GET  /api/v1/orders
// @access  Private/admin-manager

exports.getOrders=handlerFactory.getAll(Order);

// @desc    Update order paid status 
// @route   GET  /api/v1/orders/:id/pay
// @access  Private/admin-manager

exports.updateOrderToPaid=asyncHandler(async(req,res,next)=>{

    const order=await Order.findByIdAndUpdate(req.params.id,{isPaid:true,paidAt:Date.now()},{new:true});

    if (!order){
        return next(new ApiError("Order not found",404));
    }

    res.status(200).json({
        status:"success",
        data: order,
    });


});



// @desc    Update order delivered status 
// @route   GET  /api/v1/orders/:id/delivered
// @access  Private/admin-manager

exports.updateOrderToDelivered=asyncHandler(async(req,res,next)=>{

    const order=await Order.findByIdAndUpdate(req.params.id,{isDelivered:true,DeliveredAt:Date.now()},{new:true});

    if (!order){
        return next(new ApiError("Order not found",404));
    }

    
    res.status(200).json({
        status:"success",
        data: order,
    });


});
