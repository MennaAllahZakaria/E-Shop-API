const slugify=require("slugify");

const{check,body}=require("express-validator");
const validatorMiddleware=require("../../middlewares/validatorMiddleware");

exports.createCategoryValidator=[
    check('name')
                .notEmpty().withMessage('Category name is required')
                .isLength({min:3}).withMessage('Too short category name ')
                .isLength({max:32}).withMessage('Too long category name ')
                .custom((val,{req})=>{
                    req.body.slug=slugify(val);
                    return true;
                }),
    validatorMiddleware
];

exports.getCategoryValidator=[
    check('id').notEmpty().withMessage("id is required")
    .isMongoId().withMessage('Invalid category id format'),
    validatorMiddleware,
];


exports.updateCategoryValidator=[
    check('id')
                .notEmpty().withMessage("id is required")
                .isMongoId().withMessage('Invalid category id format'),
    body("name")
                .optional()
                .custom((val,{req})=>{
                        req.body.slug=slugify(val);
                        return true;
                    }),
    validatorMiddleware,
];

exports.deleteCategoryValidator=[
    check('id').notEmpty().withMessage("id is required")
    .isMongoId().withMessage('Invalid category id format'),
    validatorMiddleware,
];