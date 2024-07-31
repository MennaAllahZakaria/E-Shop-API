const mongoose=require('mongoose');

const orderSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    cartItems:[
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: Number,
            price: Number,
            color:String,
        }
    ],

    taxPrice:{
        type:Number,
        default:0,
    },
    
    shippingPrice:{
        type:Number,
        default:0,
    },
    shippingAddress:{
        details:String,
        phone:String,
        city:String,
        postalCode:String,
        
    },

    totalOrderPrice:Number,

    paymentMethodType:{
        type:String,
        enum:['cash','card'],
        defaulte:'cash',
    },
    isPaid:{
        type:Boolean,
        defaulte:false
    },
    paidAt:Date,
    
    isDelivered:{
        type:Boolean,
        defaulte:false
    },

    DeliveredAt:Date


},{
    timestamps:true
});

orderSchema.pre(/^find/,function(next){
    this.populate({path:'user', select:'name profileImage phone email -_id'})
    this.populate({path:'cartItems.product', select:'title imageCover -_id'});
    next();
})


module.exports=mongoose.model('Order',orderSchema);