// for creating model we need 2 things first is  modelname and schema
const mongoose=require('mongoose');

const RatingAndReviewSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    rating:{
        type:Number,
        required:true
    },
    review:{
        type:String,
        required:true
    },
   
});

 module.exports= mongoose.model("RatingAndReview",RatingAndReviewSchema);