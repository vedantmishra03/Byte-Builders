// for creating model we need 2 things first is  modelname and schema
const mongoose=require('mongoose');

const courseProgressSchems=new mongoose.Schema({
   
    courseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    },
    compleatedVideos:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"SubSection"
    }]

});

 module.exports= mongoose.model("CourseProgress",courseProgressSchems);