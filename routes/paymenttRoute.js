const express = require('express');

const {
    createPaymentIntent,
    confirmPaymentIntent,
    cancelPaymentIntent,
    retrievePaymentIntent,
    updatePaymentIntent,
    markAsPaidInCash
}=require('../services/paymentService');

const {idUserValidator}=require('../utils/validators/userValidator');
const { protect, allowedTo } = require("../services/authService");

const router = express.Router();

router.use(protect);

router.post('/create/:id', idUserValidator,createPaymentIntent);

router.post('/confirm/:id', idUserValidator,confirmPaymentIntent);

router.post('/cancel/:id', idUserValidator,cancelPaymentIntent);

router.get('/retrieve/:id', idUserValidator,retrievePaymentIntent);

router.put('/update/:id', allowedTo('admin'),idUserValidator, updatePaymentIntent);

router.put('/markAsPaidInCash/:id', allowedTo('admin'),idUserValidator, markAsPaidInCash);

module.exports = router;