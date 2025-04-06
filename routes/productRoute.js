const express=require('express');

const router=express.Router();
const {
    createProductValidator,
    getProductValidator,
    updateProductValidator,
    deleteProductValidator

}=require("../utils/validators/productValidator")

const {
    createProduct,
    getProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    uploadProductImages
}=require("../services/productService");

const{
    protect,
    allowedTo
}=require("../services/authService");

const reviewsRoute=require("./reviewRoute");

//nested route

// POST /products/productId/reviews
// GET /products/productId/reviews
// GET /products/productId/reviews/reviewId

router.use("/:productId/reviews",reviewsRoute);


router.route('/')
                .get(getProducts)
                .post(
                    protect,
                    allowedTo("admin","manager"),
                    uploadProductImages,
                    createProductValidator,
                    createProduct
                );

router.route('/:id')
                    .get(getProductValidator,getProduct)
                    .put(
                        protect,
                        allowedTo("admin","manager"),
                        uploadProductImages,
                        updateProductValidator,
                        updateProduct
                    )
                    .delete(
                        protect,
                        allowedTo("admin"),
                        deleteProductValidator,
                        deleteProduct
                    );
                    
module.exports=router;