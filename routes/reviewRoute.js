const express=require('express');

const router=express.Router({mergeParams:true});

const{
    createReviewValidator,
    getReviewValidator,
    updateReviewValidator,
    deleteReviewValidator
}=require('../utils/validators/reviewValidator');


const {
    createReview,
    getReviews,
    getReview,
    updateReview,
    deleteReview,
    createFilterObj,
    setProductIdAndUserIdToBody
}=require("../services/reviewService");
const{
    protect,
    allowedTo
}=require("../services/authService");

router.route('/')
                .get(createFilterObj,getReviews)
                .post(
                    protect,
                    allowedTo("user"),
                    setProductIdAndUserIdToBody,
                    createReviewValidator, 
                    createReview
                );

router.route('/:id')
                    .get(
                        getReviewValidator,
                        getReview
                    )
                    .put(
                        protect,
                        allowedTo("user"),
                        updateReviewValidator,
                        updateReview
                    )
                    .delete(
                        protect,
                        allowedTo("user","manager","admin"),
                        deleteReviewValidator,
                        deleteReview
                    );
                    
module.exports=router;