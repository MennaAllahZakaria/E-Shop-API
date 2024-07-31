/* eslint-disable import/no-extraneous-dependencies */
//CRUD operations of Categories
const sharp= require('sharp')
const {v4:uuidv4}= require('uuid')

const asyncHandler=require("express-async-handler");
const Category = require('../models/categoryModel');
const handlerFactory=require("./handlerFactory");
const {uploadSingleImage}=require("../middlewares/uploadImageMiddleware");

    
exports.resizeImage = asyncHandler(async (req, res, next) => { //image processing to best preofrmance (buffer need memory storage not disckstorage)
    const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
    if (req.file){
            await sharp(req.file.buffer)//sharp library image processing for nodejs   sharp is a promise need a awit
            .resize(600, 600)
            .toFormat('jpeg')
            .jpeg({ quality: 95 }) //to decreae size
            .toFile(`uploads/categories/${filename}`);

        // Save image into our db
        req.body.image = filename;
    }
    

    next();
    });


exports.uploadCategoryImage=uploadSingleImage("image");
// @desc    Create category
// @route   POST  /api/v1/categories
// @access  Private/admin-manager
exports.createCategory=handlerFactory.createOne(Category);


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
exports.updateCategory =handlerFactory.updateOne(Category);

// @desc    Delete specific category
// @route   DELETE /api/v1/categories/:id
// @access  Private/admin
exports.deleteCategory =handlerFactory.deleteOne(Category);
