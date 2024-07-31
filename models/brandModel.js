const mongoose=require("mongoose");

const brandSchema = new mongoose.Schema({
    name:{
        type :String,
        trim:true,
        required :[true, 'Brand required'],
        unique:[true,'Brand must be unique'],
        minlenght :[3,"too short Brand name"],
        maxlenght:[32,"too long Brand name"],
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
        const imageUrl=`${process.env.BASE_URL}/brands/${doc.image}`;
        doc.image=imageUrl;
    }
}
brandSchema.post('init',(doc)=>{
    setImageURL(doc);
    
})


brandSchema.post('save',(doc)=>{
    setImageURL(doc);
})

// eslint-disable-next-line new-cap
const brandModel= new mongoose.model("Brand",brandSchema);
module.exports=brandModel;