const stripe = require('../config/stripe');
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");
const sendEmail = require("../utils/sendEmail");

const Order = require('../models/orderModel');

// @desc    Create Payment Intent
// @route   POST /payment/create/:id
// @access  Private/user
exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
                                            .populate("user");

    if (!order) {
        return next(new ApiError(`order with id ${req.params.id} not found`, 404));
    }

    if (!order.user.equals(req.user.id)) {
        return next(new ApiError("You are not authorized to create a payment intent for this order", 403));
    }

    const amount = order.totalOrderPrice * 100; // Convert EGP to cents
    const discount = req.body.discount || 0;
    // Ensure the discount is between 0 and 100
    if (discount < 0 || discount > 100) {
        return next(new ApiError("Discount must be between 0 and 100", 400));
    }

    const discountedAmount = amount - (amount * discount / 100); // Apply discount if provided

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: discountedAmount,
            currency: req.body.currency || 'egp',
            payment_method_types: ['card'],
            metadata: {
                orderId: order.id,
                userId: order.user.toString(),
            },
        });

        // Save payment ID to order
        order.payment_id = paymentIntent.id;
        await order.save();

        // Send verification email
        const message = `Hi ${order.user.name},\n\nWe received a request to pay for your order with ID ${order.id}. The total amount is EGP ${amount / 100}, and a discount of ${discount}% has been applied, bringing the amount to EGP ${discountedAmount / 100}.\n\nPlease proceed with payment to confirm your order.\n\nThank you!\nThe E-Shop Team`;

        await sendEmail({
            email: order.user.email,
            subject: "Payment for order",
            message,
        });

        res.status(201).json({
            success: true,
            data: {
                paymentIntent,
                originalAmount: amount / 100,
                discountApplied: discount,
                discountedAmount: discountedAmount / 100,
            },
        });
    } catch (error) {
        console.error(`Stripe Error: ${error.message}`);
        const errorMessage = error.type === 'StripeCardError' 
            ? "There was an issue with the card information. Please check your details and try again." 
            : "Error creating payment intent. Please try again.";
        return next(new ApiError(errorMessage, error.statusCode || 500));
    }
});
// @desc    Confirm Payment Intent
// @route   POST /payment/confirm/:id
// @access  Private/user
exports.confirmPaymentIntent = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ApiError(`Order with id ${req.params.id} not found`, 404));
    }

    if (!order.user.equals(req.user.id)) {
        return next(new ApiError("You are not authorized to confirm this payment intent", 403));
    }

    const paymentIntentId = order.payment_id;
    if (!paymentIntentId) {
        return next(new ApiError("Payment Intent ID is missing", 400));
    }

    try {
        const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
            return next(new ApiError("Payment confirmation failed", 400));
        }

        // Update order payment status
        order.isPaid = true;
        order.paidAt=new Date.now();
        await order.save();

        res.status(200).json({
            success: true,
            data: paymentIntent,
        });
    } catch (error) {
        console.error(`Stripe Error: ${error.message}`);
        return next(new ApiError("Error confirming payment intent. Please try again.", 500));
    }
});

// @desc    Cancel Payment Intent
// @route   POST /payment/cancel/:id
// @access  Private/user
exports.cancelPaymentIntent = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ApiError(`Order with id ${req.params.id} not found`, 404));
    }

    if (!order.user.equals(req.user.id)) {
        return next(new ApiError("You are not authorized to cancel this payment intent", 403));
    }

    const paymentIntentId = order.payment_id;
    if (!paymentIntentId) {
        return next(new ApiError("Payment Intent ID is missing", 400));
    }

    try {
        const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
        if (paymentIntent.status !== 'canceled') {
            return next(new ApiError("Payment cancellation failed", 400));
        }

        // Reset order payment status
        order.isPaid = false;
        await order.save();

        res.status(200).json({
            success: true,
            data: paymentIntent,
        });
    } catch (error) {
        console.error(`Stripe Error: ${error.message}`);
        return next(new ApiError("Error canceling payment intent. Please try again.", 500));
    }
});

// @desc    Retrieve Payment Intent
// @route   GET /payment/retrieve/:id
// @access  Private/user
exports.retrievePaymentIntent = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ApiError(`Order with id ${req.params.id} not found`, 404));
    }

    if (!order.user.equals(req.user.id)) {
        return next(new ApiError("You are not authorized to retrieve this payment intent", 403));
    }

    const paymentIntentId = order.payment_id;
    if (!paymentIntentId) {
        return next(new ApiError("Payment Intent ID is missing", 400));
    }

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        res.status(200).json({
            success: true,
            data: paymentIntent,
        });
    } catch (error) {
        console.error(`Stripe Error: ${error.message}`);
        return next(new ApiError("Error retrieving payment intent. Please try again.", 500));
    }
});

// @desc    Update Payment Intent Metadata
// @route   PUT /payment/update/:id
// @access  Private/user
exports.updatePaymentIntent = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return next(new ApiError(`Order with id ${req.params.id} not found`, 404));
    }

    if (!order.user.equals(req.user.id)) {
        return next(new ApiError("You are not authorized to update this payment intent", 403));
    }

    const paymentIntentId = order.payment_id;
    const { metadata } = req.body;

    if (!paymentIntentId || !metadata) {
        return next(new ApiError("Payment Intent ID and metadata are required", 400));
    }

    try {
        const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, { metadata });
        res.status(200).json({
            success: true,
            data: paymentIntent,
        });
    } catch (error) {
        console.error(`Stripe Error: ${error.message}`);
        return next(new ApiError("Error updating payment intent. Please try again.", 500));
    }
});

// @desc    Mark the order as payed in cash
// @route   PUT /payment/cash/:id
// @access  Private/provider

exports.markAsPaidInCash = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
        return next(new ApiError(`order with id ${req.params.id} not found`, 404));
    }
    
    if (!order.user.equals(req.user.id)) {
        return next(new ApiError("You are not authorized to mark this order as paid in cash", 403));
    }
    
    order.isPaid = true;
    order.paidAt = new Date();
    await order.save();
    
    res.status(200).json({
        success: true,
        data: order,
    });

});