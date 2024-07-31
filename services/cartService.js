/* eslint-disable no-return-assign */

const asyncHandler=require("express-async-handler");
const ApiError = require("../utils/ApiError");

const Cart=require('../models/cartModel');
const Product=require('../models/productModel');
const Coupon = require('../models/couponModel');
const handlerFactory=require("./handlerFactory");

const calcTotalPrice=(cart)=>{
    let totalPrice=0;
    cart.cartItems.forEach(
        (item)=> totalPrice+=(item.price*item.quantity)
    );

    return totalPrice;

}

// @desc    Add product to cart
// @route   POST /api/v1/cart
// @access  Privete/user

exports.addProductToCart=asyncHandler(async (req,res,next)=>{
    const {productId,color}=req.body;
    const product =await Product.findById(productId)
    if (!product){
        return next(new ApiError("Product not found",404))
    }
    if (!product.quantity){
        return next(new ApiError("Product out of stock",400))
    }
    //find the user's cart or create a new one if it doesn't exist
    let cart =await Cart.findOne({user: req.user._id});
    if ( !cart){
        cart=await Cart.create({
            user: req.user._id,
            cartItems:[{product:productId ,color:color,price:product.price}]
        });
    }else{
        // if user has cart and the product is on it (inc quantity)
        const productIndex=cart.cartItems.findIndex(
            (item)=> item.product.toString()===productId && item.color===color
        );

        

        // if user has cart and the product is not on it (create new item)

        if (productIndex>-1){
            cart.cartItems[productIndex].quantity+=1;
        }else{
            cart.cartItems.push({product:productId,color:color,price:product.price})


        }
        
    }
    cart.totalPrice=calcTotalPrice(cart);

    cart=await cart.save();
    res.status(200).json({
        status:"success",
        message:"Product added to cart",
        cart:cart
    });

    
});


// @desc    Get logged user cart
// @route   GET /api/v1/cart
// @access  Privete/user

exports.getLoggedUserCart=asyncHandler(async(req,res,next)=>{

    const cart = await Cart.findOne({user:req.user._id});

    if (!cart){
        return next(new ApiError("Cart not found",404));
    }
    res.status(200).json({
        status: "success",
        numOfCartItems:cart.cartItems.length,
        data:cart
    });

});


// @desc    Get all carts for (admin,manager)
// @route   GET /api/v1/cart/all
// @access  Privete/admin-manager

exports.getAllCarts=handlerFactory.getAll(Cart); 

// @desc    Update cart quantity 
// @route   PUT /api/v1/cart/:id
// @access  Privete/user

exports.updateCartQuantity=asyncHandler(async(req,res,next)=>{
    const {id}=req.params
    const {quantity}=req.body;
    const cart = await Cart.findOne({user: req.user._id});

    if (!cart){
        return next(new ApiError("Cart not found",404));
    }

    const itemIndex=cart.cartItems.findIndex(
        (item)=> item._id.toString()===id
    );
    if (itemIndex===-1){
        return next(new ApiError("Item not found in cart",404));
    }

    const item = cart.cartItems[itemIndex];


    // Check quantity of product in stock
    const product = await Product.findById(item.product);
    if (product.quantity<quantity){
        return next(new ApiError("Product out of stock",400));
    }

    item.quantity=quantity;

    cart.totalPrice=calcTotalPrice(cart);

    await cart.save();

    res.status(200).json({
        status: "success",
        message: "Item quantity updated",
        numOfCartItems:cart.cartItems.length,
        cart: cart
    });


});


// @desc    Delete spicific cart item 
// @route   DELETE /api/v1/cart/:id
// @access  Privete/user

exports.deleteItemFromCart=asyncHandler(async(req,res,next)=>{
    const cart = await Cart.findOneAndUpdate({
        user:req.user._id,
    },{
        $pull:{cartItems:{_id:req.params.id}}
    },{
        new:true,
    }
);

    cart.totalPrice=calcTotalPrice(cart);

    await cart.save();

    res.status(200).json({
        status: "success",
        message: "Item deleted from cart",
        numOfCartItems:cart.cartItems.length,
        cart: cart
    });


});

// @desc    Delete all cart items
// @route   DELETE /api/v1/cart
// @access  Privete/user

exports.clearCart=asyncHandler(async(req,res,next)=>{
    const cart = await Cart.findOneAndDelete({user: req.user._id});

    if (!cart){
        return next(new ApiError("Cart not found",404));
    }

    res.status(200).json({
        status: "success",
        message: "All items deleted from cart",
        
    });

});

// @desc    Apply coupon on logged user cart
// @route   PUT /api/v1/applayCoupon
// @access  Privete/user

exports.applyCoupon=asyncHandler(async(req,res,next)=>{
    

    // validate coupon

    const coupon=Coupon.findOne({name:req.body.coupon,
        expire:{$gt:Date.now()}
    });

    if ( !coupon){
        return next(new ApiError("Coupon in invalid or expired"));
    }

    // calc total Price After Discount

    const cart= Cart.findOne({user:req.user._id});
    const {totalPrice} = cart;
    
    const totalPriceAfterDiscount=(totalPrice-((totalPrice*coupon.discount)/100)).toFixed(2);

    cart.totalPriceAfterDiscount=totalPriceAfterDiscount;

    await cart.save();


    res.status(200).json({
        status: "success",
        numOfCartItems:cart.cartItems.length,
        data: cart
    });


});



