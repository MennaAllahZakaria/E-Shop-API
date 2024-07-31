/* eslint-disable import/no-extraneous-dependencies */
//CRUD operations of Brands
const sharp= require('sharp')
const {v4:uuidv4}= require('uuid')
const asyncHandler=require("express-async-handler");

const Brand = require('../models/brandModel');
const handlerFactory=require("./handlerFactory");
const {uploadSingleImage}=require("../middlewares/uploadImageMiddleware");




exports.resizeImage=asyncHandler(async (req, res, next) => { 
    const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat('jpeg')
        .jpeg({ quality: 95 }) //to decreae size
        .toFile(`uploads/brands/${filename}`);

    // Save image into our db
    req.body.image = filename;

    next();
    });

exports.uploadBrandImage=uploadSingleImage('image');


// @desc    Create brand
// @route   POST  /api/v1/brands
// @access  Private/admin-manager
exports.createBrand=handlerFactory.createOne(Brand)

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
exports.updateBrand = handlerFactory.updateOne(Brand);


// @desc    Delete specific brand
// @route   DELETE /api/v1/brands/:id
// @access  Private/admin
exports.deleteBrand = handlerFactory.deleteOne(Brand);

