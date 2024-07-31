const{check}=require("express-validator");

const Review=require("../../models/reviewModel");
const validatorMiddleware=require("../../middlewares/validatorMiddleware");

exports.createReviewValidator=[
    check('title').optional(),
    check('ratings').notEmpty().withMessage('Rating is required').isFloat({min:1,max:5}).withMessage('Rating must be between 1-5'),
    check('user').isMongoId().withMessage('Invalid user id format'),
    check('product').isMongoId().withMessage('Invalid product id format')
                    .custom((val, { req }) =>
                        // Check if logged user create review before
                        Review.findOne({ user: req.user._id, product: req.body.product }).then(
                            (review) => {
                            console.log(review);
                            if (review) {
                                return Promise.reject(
                                    new Error("You already created a review before")
                                );
                                }
                            }
                        )
                        ),
                    
    validatorMiddleware
];

exports.getReviewValidator=[
    check('id').notEmpty().withMessage("id is required")
                .isMongoId().withMessage('Invalid Review id format'),
    validatorMiddleware,
];


exports.updateReviewValidator=[
    check("id")
                .isMongoId().withMessage("Invalid Review id format")
                .custom((val, { req }) =>
                    Review.findById(val).then((review) => {
                        if (!review) {
                        return Promise.reject(new Error(`There is no review with id ${val}`));
                        }
                        if (review.user._id.toString() !== req.user._id.toString()) {
                        return Promise.reject(
                            new Error(`Your are not allowed to perform this action`)
                        );
                        }
                    })

                ),
    validatorMiddleware,
];

exports.deleteReviewValidator=[
    check("id")
                .isMongoId().withMessage("Invalid Review id format")
                .custom((val, { req }) =>{
                    if ( req.user.role==='user'){
                        Review.findById(val).then((review) => {
                            if (review.user._id.toString() !== req.user._id.toString()) {
                            return Promise.reject(
                                new Error(`Your are not allowed to perform this action`)
                            );
                            }
                        })
                    }
                    return true;
                }
                    
                ),
    validatorMiddleware,
];