const mongoose=require("mongoose");

const categorySchema = new mongoose.Schema({
    name:{
        type :String,
        trim:true,
        required :[true, 'Category required'],
        unique:[true,'Category must be unique'],
        minlenght :[3,"too short category name"],
        maxlenght:[32,"too long category name"],
    },
    slug:{
        type:String,
        lowercase:true,
    },
    image:String,

},
{timestamps:true}
);

const setImageURL=(doc)=>{
    if (doc.image){
        const imageUrl=`${process.env.BASE_URL}/categories/${doc.image}`;
        doc.image=imageUrl;
    }
}
categorySchema.post('init',(doc)=>{
    setImageURL(doc);
    
})


categorySchema.post('save',(doc)=>{
    setImageURL(doc);
})

// eslint-disable-next-line new-cap
const CategoryModel= new mongoose.model("Category",categorySchema);
module.exports=CategoryModel;