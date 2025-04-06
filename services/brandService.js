/* eslint-disable import/no-extraneous-dependencies */
//CRUD operations of Brands
const sharp= require('sharp')
const {v4:uuidv4}= require('uuid')
const asyncHandler=require("express-async-handler");

const Brand = require('../models/brandModel');
const handlerFactory=require("./handlerFactory");
const {uploadSingleImage}=require("../middlewares/uploadImageMiddleware");


exports.uploadBrandImage=uploadSingleImage('image');


// @desc    Create brand
// @route   POST  /api/v1/brands
// @access  Private/admin-manager
exports.createBrand=asyncHandler(async(req, res, next)=>{
    const imageUrl = req.files?.image ? req.files.image[0].path : null;
    req.body.image = imageUrl;
    const brand = await Brand.create(req.body);
    if ( !brand){
        return next(new Error("Failed to create brand"));
    }
    res.status(201).json({
        success: true,
        data: brand
    });
})

// @desc    Get specific brand by id
// @route   GET /api/v1/brands/:id
// @access  Public
exports.getBrand = handlerFactory.getOne(Brand);
// @desc    Get list of brands
// @route   GET /api/v1/brands
// @access  Public
exports.getBrands = handlerFactory.getAll(Brand);


// @desc    Update specific brand
// @route   PUT /api/v1/brands/:id
// @access  Private/admin-manager
exports.updateBrand = asyncHandler(async(req,res,next)=>{
    if (req.files?.image) {
        req.body.image = req.files.image[0].path;
    }
    const updatedBrand = await Brand.findByIdAndUpdate(req.params.id,req.body,{
        new:true
    });
    if (!updatedBrand){
        return next(new Error("Failed to update brand"));
    }
    res.status(200).json({
        success: true,
        data: updatedBrand
    });
})


// @desc    Delete specific brand
// @route   DELETE /api/v1/brands/:id
// @access  Private/admin
exports.deleteBrand = handlerFactory.deleteOne(Brand);

