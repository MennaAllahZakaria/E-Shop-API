const Coupon = require('../models/couponModel');

const handlerFactory=require("./handlerFactory");

// @desc    Create coupon
// @route   POST  /api/v1/coupons
// @access  Private/admin-manager
exports.createCoupon=handlerFactory.createOne(Coupon)

// @desc    Get specific coupon by id
// @route   GET /api/v1/coupons/:id
// @access  Private/admin-manager
exports.getCoupon = handlerFactory.getOne(Coupon);
// @desc    Get list of coupons
// @route   GET /api/v1/coupons
// @access  Private/admin-manager
exports.getCoupons = handlerFactory.getAll(Coupon);


// @desc    Update specific coupon
// @route   PUT /api/v1/coupons/:id
// @access  Private/admin-manager
exports.updateCoupon = handlerFactory.updateOne(Coupon);


// @desc    Delete specific coupon
// @route   DELETE /api/v1/coupons/:id
// @access  Private/admin-manager
exports.deleteCoupon = handlerFactory.deleteOne(Coupon);

