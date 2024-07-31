const asyncHandler=require("express-async-handler");
const ApiError=require('../utils/ApiError')
const User = require('../models/userModel');

// @desc    Add address of user addresses list
// @route   POST  /api/v1/addresses
// @access  Private/User

exports.addAddressToLoggedUser = asyncHandler(async(req,res,next)=>{
    const user = await User.findByIdAndUpdate(req.user._id,{
        $addToSet:{ addresses:req.body}
    },{ 
        new:true
    });
    if ( !user) {
        return next(new ApiError (`User not found`,404));
    }

    res.status(201).json({
        status: 'success',
        data:user.addresses,
        message: "Address added sucessfully"
    });
});

// @desc    Get all addresses 
// @route   GET  /api/v1/addresses
// @access  Private/User

exports.getLoggedUserAddresses=asyncHandler(async(req,res,next)=>{
    const user = await User.findById(req.user._id).populate('addresses');
    if ( !user) {
        return next(new ApiError (`User not found`,404));
    }

    res.status(200).json({
        status: 'success',
        result: user.addresses.length,
        data: user.addresses
    });
})

// @desc    Remove address from user addresses list
// @route   DELETE  /api/v1/addresses/:addressId
// @access  Private/User

exports.removeAddressfromLoggedUser= asyncHandler(async(req,res,next)=>{
    const user = await User.findByIdAndUpdate(req.user._id,{
        $pull:{ addresses:{_id : req.params.addressId}}
    },{
        new:true
    });

    if (user.addresses.length === 0) {
        return next(new ApiError (`No addresses found for this user`,404));
    }

    const address = user.addresses.find(resulte => resulte._id.toString() === req.params.addressId);   
    if (!address){
        return next(new ApiError (`No address found for this id ${req.params.addressId}`,404));
    }
    if (!user) {
        return next(new ApiError (`User not found`,404));
    }
    res.status(200).send({
        status:'Success',
        data:user.addresses,
        message: "Address removed successfully."
    });
});



