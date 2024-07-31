const express=require('express');

const router=express.Router();
const {
    createCouponValidator,
    getCouponValidator,
    updateCouponValidator,
    deleteCouponValidator
}=require('../utils/validators/couponValidator')
const {
        createCoupon,
        getCoupon,
        getCoupons,
        updateCoupon,
        deleteCoupon
}=require("../services/couponService");
const{
    protect,
    allowedTo
}=require("../services/authService");

router.use(protect,
            allowedTo("admin","manager"));

router.route('/')
                .get(getCoupons)
                .post(
                    createCouponValidator,
                    createCoupon
                );

router.route('/:id')
                    .get(
                        getCouponValidator,
                        getCoupon
                    )
                    .put(
                        updateCouponValidator,
                        updateCoupon
                    )
                    .delete(
                        deleteCouponValidator,
                        deleteCoupon
                    );
                    
module.exports=router;