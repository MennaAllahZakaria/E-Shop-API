/* eslint-disable import/no-extraneous-dependencies */
//CRUD operations of Categories

const asyncHandler=require("express-async-handler");
const Category = require('../models/categoryModel');
const handlerFactory=require("./handlerFactory");
const {uploadSingleImage}=require("../middlewares/uploadImageMiddleware");



// Middleware to upload a single image
exports.uploadCategoryImage = uploadSingleImage("image")
// @desc    Create category
// @route   POST  /api/v1/categories
// @access  Private/admin-manager
exports.createCategory=asyncHandler(async(req,res,next)=>{
    const imageUrl = req.files?.image ? req.files.image[0].path : null;
    req.body.image = imageUrl;

    const category = await Category.create(req.body);
    if (!category){
        return next(new ErrorResponse("Failed to create category",500));
    }
    res.status(201).json({
        success: true,
        data: category
    });
})


// @desc    Get specific category by id
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory =handlerFactory.getOne(Category);

// @desc    Get list of categories
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = handlerFactory.getAll(Category);

// @desc    Update specific category
// @route   PUT /api/v1/categories/:id
// @access  Private/admin-manager
exports.updateCategory =asyncHandler(async(req,res,next)=>{

    if (req.files?.image) {
        req.body.image = req.files.image[0].path;
    }
    const category = await Category.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
    });
    if (!category){
        return next(new ErrorResponse("Category not found",404));
    }
    res.status(200).json({
        success: true,
        data: category
    });
})

// @desc    Delete specific category
// @route   DELETE /api/v1/categories/:id
// @access  Private/admin
exports.deleteCategory =handlerFactory.deleteOne(Category);
