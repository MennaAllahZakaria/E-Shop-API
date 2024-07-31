// CRUD operations of Products
const sharp= require('sharp')
const {v4:uuidv4}= require('uuid')
const asyncHandler=require("express-async-handler");


const Product = require('../models/productModel');
const handlerFactory=require("./handlerFactory");
const {uploadMixofImages}=require("../middlewares/uploadImageMiddleware");


exports.uploadProductImages=uploadMixofImages([
  {
  name: 'imageCover',
  maxCount: 1
},{
  name: 'images',
  maxCount: 5,
  
}])

exports.resizeProductImages=asyncHandler(async(req,res,next)=>{
  
  if (req.files.imageCover){
    const imageCoverfilename = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 95 }) //to decreae size
        .toFile(`uploads/products/${imageCoverfilename}`);


    req.body.imageCover=imageCoverfilename;
  }


  if (req.files.images){
    req.body.images=[];
    await Promise.all(
      req.files.images.map(async (img,index)=>{
        const imagefilename = `product-${uuidv4()}-${Date.now()}-${index+1}.jpeg`;
      await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 95 }) //to decreae size
          .toFile(`uploads/products/${imagefilename}`);
  
  
      req.body.images.push(imagefilename);
      })
  
    )

    console.log(req.body.imageCover);
    console.log(req.body.images);

  }

  next();
})

// @desc    Create product
// @route   POST  /api/v1/products
// @access  Private/admin-manager
exports.createProduct =handlerFactory.createOne(Product) ;

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
exports.updateProduct = handlerFactory.updateOne(Product);

// @desc    Delete specific product
// @route   DELETE /api/v1/products/:id
// @access  Private/admin
exports.deleteProduct =handlerFactory.deleteOne(Product);