const express=require('express');

const router=express.Router();

const{
        addAddressToLoggedUser,
        getLoggedUserAddresses,
        removeAddressfromLoggedUser
}=require('../services/addressService');

const{
    protect,
    allowedTo
}=require('../services/authService');

router.use(protect,allowedTo("user"));

router.route('/').post(
                        addAddressToLoggedUser
                ).get(
                    getLoggedUserAddresses
                );
                    
router.delete('/:addressId',
                            removeAddressfromLoggedUser
                        );

                        


module.exports=router;