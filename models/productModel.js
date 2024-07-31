const mongoose=require("mongoose");

const productSchema= new mongoose.Schema(
    {
        title:{
            type:String,
            trim:true,
            required :[true, 'Product title required'],
            unique:[true,'Product title must be unique'],
            minlenght :[3,"Too short product title"],
            maxlenght:[100,"Too long product title"],
        },
        slug:{
            type:String,
            required :true,
            lowercase:true,
        },
        description:{
            type:String,
            trim:true,
            required :[true, 'Product description required'],
            minlenght :[20,"Too short product description"],
            
        },
        quantity:{
            type:Number,
            required :[true, 'Product quantity required'],
        },
        sold:{
            type:Number,
            default:0,
        },
        price:{
            type:Number,
            required :[true, 'Product price required'],
            trim:true,
            max:[1000000,"Too long product price"],
        },
        priceAfterDiscount:{
            type:Number,
        },
        colors:[String],
        imageCover:{
            type:String,
            required :[true, 'Product cover image required'],
        },
        images:[String],
        category:{
            type:mongoose.Schema.ObjectId,
            ref:'Category',
            required :[true, 'Product must be belong to category'],
        },
        subCategories:[{
            type:mongoose.Schema.ObjectId,
            ref:"SubCategory",
        }],
        brand:{
            type:mongoose.Schema.ObjectId,
            ref:'Brand',
        },
        ratingsAverage:{
            type:Number,
            min:[1,"Rating must be above or equal 1"],
            max:[5,"Rating must be below or equal 5"],
        },
        ratingsQuantity:{
            type:Number,
            default:0,
        },
        
        

},
{   
    timestamps: true,
    // to enable virtual populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true },

});

productSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'product',
    localField: '_id', 
  });

productSchema.pre(/^find/, function(next){
    this.populate({
        path:'category',
        select:'name -_id'
    })
    next();
})


const setImageURL=(doc)=>{
    if (doc.imageCover){
        const imageUrl=`${process.env.BASE_URL}/products/${doc.imageCover}`;
        doc.imageCover=imageUrl;
    }
    if (doc.images){
        const imagesList=[];
        doc.images.forEach((image)=>{
            const imageUrl=`${process.env.BASE_URL}/products/${image}`;
            imagesList.push(imageUrl);
        })
        doc.images=imagesList;
    }
}
productSchema.post('init',(doc)=>{
    setImageURL(doc);
    
})


productSchema.post('save',(doc)=>{
    setImageURL(doc);
})

module.exports=mongoose.model("Product",productSchema);