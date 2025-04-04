/* eslint-disable import/no-extraneous-dependencies */
const express=require('express');

const router=express.Router();
const {
    createCategoryValidator ,
    getCategoryValidator,
    updateCategoryValidator,
    deleteCategoryValidator
}=require("../utils/validators/categoryValidator")

const {
    createCategory,
    uploadCategoryImage,
    getCategories,
    getCategory,
    updateCategory,
    deleteCategory
}=require("../services/categoryService");

const{
    protect,
    allowedTo
}=require("../services/authService");
const supCategoryRoute=require("./subCategoryRoute")

//nested route
router.use("/:categoryId/subCategories",supCategoryRoute);

router.route('/')
                .get(getCategories)
                .post(
                    protect,
                    allowedTo("admin","manager"),
                    uploadCategoryImage,
                    createCategoryValidator
                    ,createCategory
                );

router.route('/:id')
                    .get(getCategoryValidator,getCategory)
                    .put(
                        protect,
                        allowedTo("admin","manager"),
                        uploadCategoryImage,
                        updateCategoryValidator,
                        updateCategory
                    )
                    .delete(
                        protect,
                        allowedTo("admin"),
                        deleteCategoryValidator,
                        deleteCategory
                    );
                    
module.exports=router;