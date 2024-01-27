//import the models
const Course = require("../models/Course");
const Tag = require("../models/Tag");
const User = require("../models/User");
const {uploadImageToCloudinary}=require("../utils/imageUploader");

//create course ka handle function => only created by Instructor

exports.createCourse = async (req, res) => {
    try{
        //data fetch from req body
        const {courseName, courseDescription, price, tag,whatYouWillLearn } = req.body;
         
        //fetch file from request
        const thumbnail=req.files.thumbnailImage;
        // validation
        if(!courseName || !courseDescription || !price || !tag  || !whatYouWillLearn || !thumbnail){
            return res.status(404).json({
                success:false,
                message:"Please fill all the details of course creation"
            });
        }
        // check for instructor 
        const userId=req.user.id;
        const instructorDetails=await User.findById(userId);
        console.log("The insructor details are",instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Not a valid instructor, please signup first"
            });
        }

        // check for tag validation => tag ki object id aaygi req.body me check course schemam
        const tagDetails=await Tag.findById(tag);
        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:"Not a valid tag"
            });
        }

        // upload the image on cloudinary

        const thumbnailImage=await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

        //create course entry to db 

        const newCourse=await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url
        })

        //its a instructor=> who is creating a course => so we have to 
        //push the course in instructor's course array

         const updatedCourse=await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {$push:{
                courses:newCourse._id
            }},
            {new:true});

            //update the tag schema 
        
            const tagUpdate=await Tag.findByIdAndUpdate(
                {_id:tagDetails._id},
                {$push:{
                    courses:newCourse._id
                }},
                {new:true},
            );

            return res.status(200).json({
                success:true,
                message:"Course created successfully",
                data:newCourse
            });

    } catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"something went wrong with course creation, unable to create course"
        });
    }
};



//get All courses controller 
exports.getAllCourses= async (req, res) => {
    try {
        //fetch all courses
        const allCourses=await Course.find({},{courseName:true,
                                               courseName:true,
                                               thumbnail:true,
                                               instructor:true,
                                               ratingAndReviews:true,
                                               studentEnrolled:true,
                                                 }).populate("instructor")
                                                 .exec();
                                                 
        return res.status(200).json({
            success:true,
            message:"Fetched all courses successfully",
            data:allCourses
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
          success:false,
          message:"something went wrong , not able to fetch all the courses"
        });        
  }
};
