const mongoose=require("mongoose");

const cartSchema =new mongoose.Schema({
    cartItems:[
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                default:1,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            color:String,
        }
    ],
    totalPrice: Number,
    totalPriceAfterDiscount: Number,
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }



},{
    timestamps: true,
    
});

module.exports = mongoose.model("Cart", cartSchema);