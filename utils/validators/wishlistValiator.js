
const{check}=require("express-validator");
const validatorMiddleware=require("../../middlewares/validatorMiddleware");
const ProductModel=require('../../models/productModel');


exports.addProductToWishlistValidator = [
    check('productId')
                    .notEmpty().withMessage('product id is required')
                    .isMongoId().withMessage('Invalid product id format')
                    .custom((productId) => 
                        ProductModel.findById(productId).then((product) => {
                            if (!product) {
                                return Promise.reject(
                                    new Error(`No product found for productId: ${productId}`)
                                );
                            }
                        })
                    ),
    validatorMiddleware
];


