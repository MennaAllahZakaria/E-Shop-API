// CRUD operations of SubCatigories
const SubCategory = require('../models/supCategoryModel');
const handlerFactory=require("./handlerFactory");

exports.setCategoryIdToBody = (req, res, next) => {
  // Nested route
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// Nested route
// GET /api/v1/categories/:categoryId/subcategories
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};

// @desc    Create subCategory
// @route   POST  /api/v1/subcategories
// @access  Private/admin-manager
exports.createSubCategory = handlerFactory.createOne(SubCategory)


// @desc    Get specific subcategory by id
// @route   GET /api/v1/subcategories/:id
// @access  Public
exports.getSubCategory = handlerFactory.getOne(SubCategory)


// @desc    Get list of subcategories
// @route   GET /api/v1/subcategories
// @access  Public
exports.getSubCategories = handlerFactory.getAll(SubCategory);



// @desc    Update specific subcategory
// @route   PUT /api/v1/subcategories/:id
// @access  Private/admin-manager
exports.updateSubCategory = handlerFactory.updateOne(SubCategory);
// @desc    Delete specific subCategory
// @route   DELETE /api/v1/subcategories/:id
// @access  Private/admin
exports.deleteSubCategory = handlerFactory.deleteOne(SubCategory);