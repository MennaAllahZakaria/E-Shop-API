const express=require('express');

const router=express.Router();

const{
    addProductToWishlist,
    getLoggedUserWishlist,
    removeProductFromWishlist
}=require('../services/wishlistService');

const {
    addProductToWishlistValidator
}=require('../utils/validators/wishlistValiator');

const{
    protect,
    allowedTo
}=require('../services/authService');

router.use(protect,allowedTo("user"));

router.route('/').post(
                addProductToWishlistValidator,
                addProductToWishlist
                ).get(
                    getLoggedUserWishlist
                );
                    
router.delete('/:productId',
                            removeProductFromWishlist
                        );

                        


module.exports=router;