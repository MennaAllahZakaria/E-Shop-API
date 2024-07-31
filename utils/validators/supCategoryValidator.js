const{check,body}=require("express-validator");
const slugify=require("slugify");
const validatorMiddleware=require("../../middlewares/validatorMiddleware");


exports.createSubCategoryValidator=[
    check('name')
        .notEmpty().withMessage('SubCategory name is required')
        .isLength({min:2}).withMessage('Too short Subcategory name ')
        .isLength({max:32}).withMessage('Too long Subcategory name ')
        .custom((val,{req})=>{
            req.body.slug=slugify(val);
            return true;
        }),
    check('category')
        .notEmpty().withMessage("subCategory must be belong to parent category")
        .isMongoId().withMessage('Invalid category id format'),
    validatorMiddleware
];

exports.getSubCategoryValidator=[
    check('id').notEmpty().withMessage("id is required")
    .isMongoId().withMessage('Invalid Subcategory id format'),
    validatorMiddleware,
];


exports.updateSubCategoryValidator=[
    check('id')
                .notEmpty().withMessage("id is required")
                .isMongoId().withMessage('Invalid Subcategory id format'),

    body("name")
                .custom((val,{req})=>{
                        req.body.slug=slugify(val);
                        return true;
                    }),
    validatorMiddleware,
];

exports.deleteSubCategoryValidator=[
    check('id').notEmpty().withMessage("id is required")
    .isMongoId().withMessage('Invalid Subcategory id format'),
    validatorMiddleware,
];