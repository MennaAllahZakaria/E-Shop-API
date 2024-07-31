const express=require('express');

const router=express.Router();

const {
    createCashOrder,
    filterOrderForLoggedUser,
    getOrder,
    getOrders,
    updateOrderToPaid,
    updateOrderToDelivered,
    checkoutSession,
    webhookCheckout


}=require("../services/orderService");
const{
    protect,
    allowedTo
}=require("../services/authService");

router.use(
            protect,
            allowedTo("user")
);

router.route('/:cartId')
                .post(
                    createCashOrder
                );

router.route('/:id').get(
                        getOrder
                    )



router.route('/').get(    
                    protect,
                    allowedTo("user","admin","manager"),
                    filterOrderForLoggedUser,
                    getOrders
                )
                


router.put('/:id/pay',
                    protect,
                    allowedTo("admin","manager"),
                    updateOrderToPaid
                );


router.put('/:id/delivered',
                            protect,
                            allowedTo("admin","manager"),
                            updateOrderToDelivered
);                       


router.get('/checkout-session/:cartId',
                        protect,
                        allowedTo("user"),
                        checkoutSession
);

router.post('/webhook-checkout',
                        protect,
                        allowedTo("user"),
                        webhookCheckout

)
                    
module.exports=router;