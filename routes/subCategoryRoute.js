const express = require('express');

const {
    createSubCategory,
    getSubCategory,
    getSubCategories,
    updateSubCategory,
    deleteSubCategory,
    setCategoryIdToBody,
    createFilterObj
} = require("../services/subCategoryService");

const {
    createSubCategoryValidator,
    getSubCategoryValidator,
    updateSubCategoryValidator,
    deleteSubCategoryValidator
} = require("../utils/validators/supCategoryValidator");

const{
    protect,
    allowedTo
}=require("../services/authService");


const router = express.Router({ mergeParams: true });

router.route('/')
    .post(
        protect,
        allowedTo("admin","manager"),
        setCategoryIdToBody, 
        createSubCategoryValidator,
        createSubCategory
    )
    .get(createFilterObj, getSubCategories);

router.route('/:id')
    .get(getSubCategoryValidator, getSubCategory)
    .put(
        protect,
        allowedTo("admin","manager"),
        updateSubCategoryValidator,
        updateSubCategory
    )
    .delete(protect,
        allowedTo("admin"),
        deleteSubCategoryValidator,
        deleteSubCategory
    );

module.exports = router;