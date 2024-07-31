const{check,body}=require("express-validator");
const slugify=require("slugify");
const validatorMiddleware=require("../../middlewares/validatorMiddleware");

exports.createBrandValidator=[
    check('name')
        .notEmpty().withMessage('Brand name is required')
        .isLength({min:3}).withMessage('Too short brand name ')
        .isLength({max:32}).withMessage('Too long brand name ')
        .custom((val,{req})=>{
            req.body.slug=slugify(val);
            return true;
        }),
    validatorMiddleware
];

exports.getBrandValidator=[
    check('id').notEmpty().withMessage("id is required")
                .isMongoId().withMessage('Invalid brand id format'),
    validatorMiddleware,
];


exports.updateBrandValidator=[
    check('id')
                .notEmpty().withMessage("id is required")
                .isMongoId().withMessage('Invalid Brand id format'),
    body("name")
                .optional()
                .custom((val,{req})=>{
                        req.body.slug=slugify(val);
                        return true;
                    }),
    validatorMiddleware,
];

exports.deleteBrandValidator=[
    check('id')
                .notEmpty().withMessage("id is required")
                .isMongoId().withMessage('Invalid Brand id format'),
    validatorMiddleware,
];