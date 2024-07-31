const{check}=require("express-validator");

const validatorMiddleware=require("../../middlewares/validatorMiddleware");

exports.createCouponValidator=[
    check('name')
        .notEmpty().withMessage('Coupon name is required')
        .isLength({ min: 4, max: 10 }).withMessage('Coupon code must be between 4 and 10 characters'),

    check("expire")
                .notEmpty().withMessage('Coupon expire date is required')
                .isISO8601().withMessage('Invalid date format'),

    check('discount')
                    .notEmpty().withMessage('Coupon discount is required')
                    .isFloat({gt:0 ,lt:100}).withMessage('Invalid discount value')
    

    ,validatorMiddleware
];

exports.getCouponValidator=[
    check('id').notEmpty().withMessage("id is required")
                .isMongoId().withMessage('Invalid Coupon id format'),
    validatorMiddleware,
];


exports.updateCouponValidator=[
    check('id')
                .notEmpty().withMessage("id is required")
                .isMongoId().withMessage('Invalid Coupon id format'),
    check("name")
                .optional()
                .isLength({ min: 4, max: 10 }).withMessage('Coupon code must be between 4 and 10 characters'),
                
    check("expire")
                .isISO8601().withMessage('Invalid date format'),

    check('discount')
                    .isFloat({gt:0,lt:100}).withMessage('Invalid discount value'),
    

    validatorMiddleware,
];

exports.deleteCouponValidator=[
    check('id')
                .notEmpty().withMessage("id is required")
                .isMongoId().withMessage('Invalid Coupon id format'),
    validatorMiddleware,
];