/* eslint-disable import/no-extraneous-dependencies */
//CRUD operations of reviews

const Review = require('../models/reviewModel');
const handlerFactory=require("./handlerFactory");

exports.setProductIdAndUserIdToBody = (req, res, next) => {
    // Nested route
    if (!req.body.product) req.body.product = req.params.productId;
    if (!req.body.user)    req.body.user = req.user._id;
    next();
    };
// Nested route
// GET /api/v1/products/:productId/reviews
exports.createFilterObj = (req, res, next) => {
    let filterObject = {};
    if (req.params.productId) filterObject = { product: req.params.productId };
    req.filterObj = filterObject;
    next();
    };

// @desc    Create review
// @route   POST  /api/v1/reviews
// @access  Private/User
exports.createReview=handlerFactory.createOne(Review)

// @desc    Get specific review by id
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = handlerFactory.getOne(Review);
// @desc    Get list of reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = handlerFactory.getAll(Review);


// @desc    Update specific review
// @route   PUT /api/v1/reviews/:id
// @access  Private/protect/User
exports.updateReview = handlerFactory.updateOne(Review);


// @desc    Delete specific review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/protect/User-admin-manager 
exports.deleteReview = handlerFactory.deleteOne(Review);

