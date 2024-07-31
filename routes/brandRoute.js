const express=require('express');

const router=express.Router();
const {
    createBrandValidator,
    getBrandValidator,
    updateBrandValidator,
    deleteBrandValidator

}=require("../utils/validators/brandValidator")

const {
    createBrand,
    uploadBrandImage,
    resizeImage,
    getBrand,
    getBrands,
    updateBrand,
    deleteBrand
}=require("../services/brandService");
const{
    protect,
    allowedTo
}=require("../services/authService");

router.route('/')
                .get(getBrands)
                .post(
                    protect,
                    allowedTo("admin","manager"),
                    uploadBrandImage,
                    resizeImage,
                    createBrandValidator,
                    createBrand
                );

router.route('/:id')
                    .get(getBrandValidator,getBrand)
                    .put(
                        protect,
                        allowedTo("admin","manager"),
                        uploadBrandImage,
                        resizeImage,
                        updateBrandValidator,
                        updateBrand
                    )
                    .delete(
                        protect,
                        allowedTo("admin"),
                        deleteBrandValidator,
                        deleteBrand
                    );
                    
module.exports=router;