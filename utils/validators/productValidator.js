/* eslint-disable prefer-promise-reject-errors */
const slugify=require("slugify");

const{check,body}=require("express-validator");
const validatorMiddleware=require("../../middlewares/validatorMiddleware");
const categoryModel=require("../../models/categoryModel");
const subCategoryModel=require("../../models/supCategoryModel");
const brandModel=require("../../models/brandModel");

exports.createProductValidator=[
    check("title")
                .notEmpty().withMessage("Product title is required")
                .isLength({min:3}).withMessage("Product title must be more than or equle 3 chars")
                .custom((val,{req})=>{
                    req.body.slug=slugify(val);
                    return true;
                }),

    check("description")
                .notEmpty().withMessage("Product description is required")
                .isLength({max:2000}).withMessage("Too Long description")    ,
    check("quantity")
                .notEmpty().withMessage("Product quantity is required")
                .isNumeric().withMessage("Product quantity must be a number"),
    check("sold")
                .optional()
                .isNumeric().withMessage("Product sold must be a number"),
    check("price")
                .notEmpty().withMessage("Product price must be")
                .isNumeric().withMessage("Product price must be a number")
                .isLength({max:32}).withMessage("Product price must be less than or equle 10 chars").withMessage("Product price must be less than or equle 10 chars"),
    check("priceAfterDiscount")
                .optional()
                .toFloat()
                .isNumeric().withMessage("Product priceAfterDiscount must be a number")
                .custom((value,{req})=>{
                    if(value>=req.body.price){
                        throw new Error("Product priceAfterDiscount must be less than or equle Product price")
                    }
                    return true;
                }),
    check("colors")
                .optional()
                .isArray().withMessage("Product colors must be array of strings"),
    check("imageCover")
                .notEmpty().withMessage("Product imageCover is required"),
    check("images")
                .optional()
                .isArray().withMessage("Product images must be array of strings"),
    check("category")
                .notEmpty().withMessage("Product category is required")
                .isMongoId().withMessage('Invalid category id format')
                // validate the category in the database
                .custom((categoryId) =>
                    categoryModel.findById(categoryId).then((category) => {
                        if (!category) {
                        return Promise.reject(
                            new Error(`No category for this id: ${categoryId}`)
                            );
                        }
                    })
                ),
    check("subCategories")
                .optional()
                .isMongoId().withMessage('Invalid Subcategory id format')
                // validate the subCategories in the database
                .custom((subCategoriesIds)=>{
                    subCategoryModel.find({_id:{$exists: true, $in: subCategoriesIds}})
                                    .then((result)=>{
                                        if (result.length<1|| result.length!==subCategoriesIds.length){
                                            return Promise.reject(new Error(`Invalid Subcategories ids`));
                                        }
                    })
                })
                .custom((val,{req})=>{
                    //validate if subCategories is belong to that category or nat 
                    subCategoryModel.find({category:req.body.category}).then((result)=>{
                        const subCategoriesIdDb=[];
                        result.forEach((subCategory)=>{
                            subCategoriesIdDb.push(subCategory._id.toString());
                        })
                        const checker = (target, arr) => target.every((v) => arr.includes(v));
                                if (!checker(val, subCategoriesIdDb)) {
                                return Promise.reject(
                                            new Error(`subcategories not belong to category`)
                                );
                            }
                    })
                }),
    check("brand")
                .optional()
                .isMongoId().withMessage('Invalid Subcategory id format')
                .custom((brandId)=>{
                    brandModel.findById(brandId).then((result)=>{
                        if (!result){
                            return Promise.reject(new Error(`No brand for this id: ${brandId}`));
                        }
                    })
                }),
    check("ratingsAverage")
                .optional()
                .isNumeric().withMessage("Product ratingsAverage must be a number")
                .isLength({min:1}).withMessage("Product ratingsAverage must be more than or equle 1.0")
                .isLength({max:5}).withMessage("Product ratingsAverage must be less than or equle 5.0"),
    check("ratingsQuantity")
                .optional()
                .isNumeric().withMessage("Product ratingsQuantity must be a number"),
    validatorMiddleware,
];

exports.getProductValidator=[
    check('id')
                .notEmpty().withMessage("id is required")
                .isMongoId().withMessage('Invalid Product id format'),
    validatorMiddleware,
];


exports.updateProductValidator=[
    check('id')
                .notEmpty().withMessage("id is required")
                .isMongoId().withMessage('Invalid Product id format'),
    body("title")
                .optional()
                .custom((val,{req})=>{
                    req.body.slug=slugify(val);
                    return true;
                }),
    validatorMiddleware,
];

exports.deleteProductValidator=[
    check('id')
                .notEmpty().withMessage("id is required")
                .isMongoId().withMessage('Invalid Product id format'),
    validatorMiddleware,
];