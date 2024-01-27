// for creating model we need 2 things first is  modelname and schema
const mongoose=require('mongoose');

const tagSchema=new mongoose.Schema({
      name:{
        type:String,
        trim:true
      },
      description:{
        type:String,
        trim:true
      },
      courses :[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
      }],

   
});

 module.exports= mongoose.model("Tag",tagSchema);
