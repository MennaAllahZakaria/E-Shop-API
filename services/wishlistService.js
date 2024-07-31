const asyncHandler=require("express-async-handler");
const ApiError=require('../utils/ApiError')
const User = require('../models/userModel');

// @desc    Add product to wishlist
// @route   POST  /api/v1/wishlist
// @access  Private/User

exports.addProductToWishlist = asyncHandler(async(req,res,next)=>{
    const user = await User.findByIdAndUpdate(req.user._id,{
        $addToSet:{ wishlist:req.body.productId}
    },{ 
        new:true
    });
    res.status(201).json({
        status: 'success',
        data:user.wishlist,
        message: "Product added to wishlist"
    });
});

// @desc    Get all wishlists 
// @route   GET  /api/v1/wishlist
// @access  Private/User

exports.getLoggedUserWishlist=asyncHandler(async(req,res,next)=>{
    const user = await User.findById(req.user._id).populate('wishlist');
    if ( !user) {
        return next(new ApiError (`User not found`,404));
    }

    res.status(200).json({
        status: 'success',
        result: user.wishlist.length,
        data: user.wishlist
    });
})

// @desc    Remove product from wishlist
// @route   DELETE  /api/v1/wishlist/:productId
// @access  Private/User

exports.removeProductFromWishlist = asyncHandler(async(req,res,next)=>{
    const user = await User.findByIdAndUpdate(req.user._id,{
        $pull:{ wishlist:req.params.productId}
    },{
        new:true
    });
    res.status(200).send({
        status:'Success',
        data:user.wishlist,
        message: "Product removed from wishlist"
    });
});



