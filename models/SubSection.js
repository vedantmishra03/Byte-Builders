// for creating model we need 2 things first is  modelname and schema
const mongoose=require('mongoose');

const subSectionSchema=new mongoose.Schema({
   
   title:{
    type:String,
   },
   timeDuration:{
    type:String,
   },
   description:{
    type:String,
   },
   videoUrl:{
    type:String,
   }
});

 module.exports= mongoose.model("SubSection",subSectionSchema);