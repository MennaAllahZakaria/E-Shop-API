const{check}=require("express-validator");
const validatorMiddleware=require("../../middlewares/validatorMiddleware");

exports.addToCartValidator =[
    check("productId")
                    .notEmpty().withMessage('Product id is required')
                    .isMongoId().withMessage('Invalid product id format')
    ,validatorMiddleware
];

exports.updateCartQuantityValidator=[
    check("id")
            .notEmpty().withMessage('Cart item id is required')
            .isMongoId().withMessage('Invalid cart item id format'),
    
    check("quantity")
                    .isInt({ gt: 0 }).withMessage('Quantity must be a positive integer')

    ,validatorMiddleware
];

exports.removeFromCartValidator=[
    check("id")
            .notEmpty().withMessage('Cart item id is required')
            .isMongoId().withMessage('Invalid cart item id format'),
            
    validatorMiddleware
];

exports.applyCouponValidator=[
    check("coupon")
                    .notEmpty().withMessage('Coupon code is required')
                    .isLength({ min: 4, max: 10 }).withMessage('Coupon code must be between 4 and 10 characters')
                    
    ,validatorMiddleware
];