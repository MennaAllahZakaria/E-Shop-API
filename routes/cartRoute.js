const express=require('express');

const router=express.Router();

const {
    addProductToCart,
    getLoggedUserCart,
    getAllCarts,
    updateCartQuantity,
    deleteItemFromCart,
    clearCart,
    applyCoupon

}=require("../services/cartService");

const{
    addToCartValidator,
    updateCartQuantityValidator,
    removeFromCartValidator,
    applyCouponValidator


}=require("../utils/validators/cartValidator")
const{
    protect,
    allowedTo
}=require("../services/authService");

router.use(
            protect,
            allowedTo("user")
);

router.route('/')
                .get(
                    getLoggedUserCart)
                .post(
                    addToCartValidator,
                    addProductToCart
                ).delete(
                    clearCart
                );

router.route('/:id')
                    .put(
                        updateCartQuantityValidator,
                        updateCartQuantity)
                    .delete(
                        removeFromCartValidator,
                        deleteItemFromCart);

router.route('/applyCoupon')
                    .put(
                        applyCouponValidator,
                        applyCoupon
                    );
                    


router.use(                        
    protect,
    allowedTo("admin","manager"),
);

//get all carts for admin or manager only
router.route('/all')
                    .get(
                        getAllCarts
                    );



                    
module.exports=router;