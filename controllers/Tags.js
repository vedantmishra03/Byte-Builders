const Tag=require("../models/Tag");

//create tag ka handle function => only created by admin

exports.createtag= async (req , res)=>{
   
    try {
            //fetch data 
            const {title, description}=req.body;
            // validate data
            if(!title || !description){
                return res.status(404).json({
                    success: false,
                    message:"Please fill all the details"
                });
            }
            // create entry in db=> 
            const tagDetails= await Tag.create({
                name:title,
                description:description,
            });
            console.log(tagDetails);
            //send response 
            return res.status(200).json({
                success: true,
                message:"Tag created sucessfully",
            });

    } catch (error) {
          console.log(error);
          return res.status(500).json({
            success:false,
            message:"something went wrong with tag creation"
          });        
    }
};

// show all the tags

exports.showAlltags= async (req, res, next) => {
    try {
                    
         // fetch all tags => make sure all conatains name and description
        //  find({tell the input find criteria here}, {tell the fields you want to fetch here})
        const allTags=await Tag.find({},{name:true, description:true});
        return res.status(200).json({
            success:true,
            message:"Fetched all tags successfully",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
          success:false,
          message:"something went wrong , not able to fetch all the tags"
        });        
  }
};