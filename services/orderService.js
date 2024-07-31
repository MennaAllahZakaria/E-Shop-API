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

// @desc    Get checkout session from stripe and send it as response
// @route   GET  /api/v1/orders/checkout-session/:cartId
// @access  Private/user
exports.checkoutSession = asyncHandler(async (req, res, next) => {
    // app settings
    const taxPrice = 0;
    const shippingPrice = 0;

    // 1) Get cart depend on cartId
    const cart = await Cart.findById(req.params.cartId);
    if (!cart) {
        return next(new ApiError(`There is no such cart with id ${req.params.cartId}`, 404));
        }

    // 2) Get order price depend on cart price "Check if coupon apply"
    const cartPrice = cart.totalPriceAfterDiscount
        ? cart.totalPriceAfterDiscount
        : cart.totalPrice;
        
    // Ensure cartPrice is a number
    if (isNaN(cartPrice)) {
        return next(new ApiError('Invalid cart price', 400));
    }

    const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

    // Ensure totalOrderPrice is a valid number and convert to integer amount in cents
    const amount = Math.round(totalOrderPrice * 100);

    // Ensure the final amount is a valid integer
    if (isNaN(amount) || !Number.isInteger(amount)) {
        return next(new ApiError('Invalid total order price', 400));
    }

    // 3) Create stripe checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
            price_data:{
                unit_amount: amount,
                currency: "egp",

                product_data:{
                    name: req.user.name,

                }
            },
            quantity: 1,
        },
    ],
        mode: "payment",
        success_url: `${req.protocol}://${req.get("host")}/orders`,
        cancel_url: `${req.protocol}://${req.get("host")}/cart`,
        customer_email: req.user.email,
        client_reference_id: req.params.cartId,
        metadata: req.body.shippingAddress,
    });

    // 4) send session to response
    res.status(200).json({ status: "success", session });
});

const createCardOrder = async (session) => {
    const cartId = session.client_reference_id;
    const shippingAddress = session.metadata;
    const orderPrice = session.amount_total / 100;
  
    const cart = await Cart.findById(cartId);
    const user = await User.findOne({ email: session.customer_email });
  
    // 3) Create order with default paymentMethodType card
    const order = await Order.create({
      user: user._id,
      cartItems: cart.cartItems,
      shippingAddress,
      totalOrderPrice: orderPrice ,
      isPaid: true,
      paidAt: Date.now(),
      paymentMethodType: "card",
    });
  
    // 4) After creating order, decrement product quantity, increment product sold
    if (order) {
      const bulkOption = cart.cartItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
        },
      }));
      await Product.bulkWrite(bulkOption, {});
  
      // 5) Clear cart depend on cartId
      await Cart.findByIdAndDelete(cartId);
    }
  };
  
// @desc    This webhook will run when stripe payment success paid
// @route   POST /webhook-checkout
// @access  Protected/User
exports.webhookCheckout=asyncHandler(async(req,res,next)=>{
    const signature = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Error with webhook: ${err.message}`);
        return res.status(400).send(`Webhook error: ${err.message}`);
    }   

    if (event.type === 'checkout-session-completed') {
    //  Create order
    createCardOrder(event.data.object);
    } else {
        console.log(`Unhandled event type: ${event.type}`);
     }

    res.status(200).json({ received: true });


})