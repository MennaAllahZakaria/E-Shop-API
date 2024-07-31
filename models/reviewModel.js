const mongoose = require('mongoose');

const Product=require('./productModel')

const reviewSchema= new mongoose.Schema({
    title:{
        type:String,
    },
    ratings:{
        type:Number,
        min:[1,"Min ratings value is 1"],
        max:[5,"Max ratings value is 5"],
        required:[true,"Ratings required"]
    },
    product:{
        type:mongoose.Schema.ObjectId,
        ref:'Product',
        required:true
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,"Review must be belong to user"]
    }



},

    {
        timestamps:true
    });

    reviewSchema.pre(/^find/,function(next){
        this.populate({path:'user', select:'name'});
        next();
    });


    reviewSchema.statics.calcAverageRatingsAndQuantity= async function(productId){
        const result = await this.aggregate([

            {
                $match: {product:productId}
            },

            {
                $group:{
                    _id: 'product',
                    avgRatings:{
                        $avg:'$ratings'
                    },
                    ratingsQuantity:{
                        $sum:1
                    }
                }
            },
        ]);
        if(result.length > 0){

            await Product.findByIdAndUpdate(productId,{
                ratingsAverage:result[0].avgRatings,
                ratingsQuantity:result[0].ratingsQuantity
            });

        }else{
            await Product.findByIdAndUpdate(productId,{
                ratingsAverage:0,
                ratingsQuantity:0
            });
        }



    }
    

    reviewSchema.post('save', async function(){
        await this.constructor.calcAverageRatingsAndQuantity(this.product);
    });
    reviewSchema.post('remove', async function(){
        await this.constructor.calcAverageRatingsAndQuantity(this.product);
    });

    

module.exports=mongoose.model('Review',reviewSchema);