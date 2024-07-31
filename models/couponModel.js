const mongoose=require("mongoose");

const couponSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'coupon name is required'],
        trim:true,
        unique:[true,'coupon name must be unique'],
    },
    expire:{
        type:Date,
        required:[true,'expiration date is required'],
    },
    discount:{
        type:Number,
        required:[true,'discount is required'],
    }


},{
    timestamps:true
});

module.exports=mongoose.model('Coupon',couponSchema);