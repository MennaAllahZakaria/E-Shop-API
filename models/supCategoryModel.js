const mongoose= require('mongoose');

const subCategorySchema=new mongoose.Schema(
    {
        name:{
            type:String,
            trim:true,
            required :[true, 'subCategory required'],
            unique:[true,'subCategory must be unique'],
            minlenght :[3,"Too short subCategory name"],
            maxlenght:[32,"Too long subCategory name"],
        },
        slug:{
            type:String,
            lowercase:true,
        },
        category:{
            type:mongoose.Schema.ObjectId,
            ref:'Category',
            required :[true, 'subCategory must be belong to parent category'],

        },
    },
{timestamps:true}
);

module.exports=mongoose.model('SubCategory',subCategorySchema);