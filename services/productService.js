// CRUD operations of Products
const sharp= require('sharp')
const {v4:uuidv4}= require('uuid')
const asyncHandler=require("express-async-handler");


const Product = require('../models/productModel');
const handlerFactory=require("./handlerFactory");
const {uploadMixOfImages}=require("../middlewares/uploadImageMiddleware");


exports.uploadProductImages = uploadMixOfImages([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);


// @desc    Create product
// @route   POST  /api/v1/products
// @access  Private/admin-manager
exports.createProduct =asyncHandler(async(req,res,next)=>{

  const imageCover = req.files?.imageCover?.[0]?.path || null;

  // Extract other image URLs
  const images = req.files?.images?.map(file => file.path) || [];

  // Add to request body
  req.body.imageCover = imageCover;
  req.body.images = images;

  // Create a new product
  const product = await Product.create(req.body);
  if (! product){
    return next(new Error("Failed to create product "));
  }
  res.status(201).json({ data: product });

})

// @desc    Get specific product  by id
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = handlerFactory.getOne(Product);
// @desc    Get list of products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = handlerFactory.getAll(Product);



// @desc    Update specific product
// @route   PUT /api/v1/products/:id
// @access  Private/admin-manager
exports.updateProduct = asyncHandler(async(req,res,next)=>{
  if (req.files?.imageCover) {
    req.body.imageCover = req.files.imageCover[0].path;
  }
  if (req.files?.images) {
    req.body.images = req.files.images.map(file => file.path);
  }
  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!updatedProduct) {
    return next(new ErrorResponse("Product not found", 404));
  }
  res.status(200).json({ data: updatedProduct });
})

// @desc    Delete specific product
// @route   DELETE /api/v1/products/:id
// @access  Private/admin
exports.deleteProduct =handlerFactory.deleteOne(Product);