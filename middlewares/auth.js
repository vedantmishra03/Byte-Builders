const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//4 middleware => same as last one 

//auth
exports.auth = (req, res, next) => {
  try {
    //abstract JWT token // login krte samay maine token bhej rkha hai response me =>check login controllers

    const token = req.body.token ||
                   req.cookie.token||
                   req.header("Autherisation").replace("Bearer ","");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token Missing",
      });
    }

    //verify the token
    try {
      // we use verify methode of jwt token
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);

      // we inserted the decoded token back in our req bcs we want it for autherization purpuse
      req.user = decode;
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "token is invalid",
      });
    }
    next(); // for calling the next middle ware check the route folder
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifying the token",
    });
  }
};

//isStudent
exports.isStudent=(req,res,next)=>{
    try{
           
        if(req.user.accountType!=="Student"){
            return res.status(401).json({
                success: false,
                message:"this is a protected route for student only fass gya "
            })
        }
        next();
    } catch(err){
           
        return res.status(500).json({
            success: false,
            message:"Something went wrong while verifying the student's role",
        });
    }
};

//isAdmin
exports.isAdmin=(req,res,next)=>{
    try{
           
        if(req.user.accountType!=="Admin"){
            return res.status(401).json({
                success: false,
                message:"this is a protected route for Admin only fass gya "
            })
        }
        next();
    } catch(err){
           
        return res.status(500).json({
            success: false,
            message:"Something went wrong while verifying the Admin's role",
        });
    }
};

//isInstructor

exports.isInstructor=(req,res,next)=>{
    try{
           
        if(req.user.accountType=="Instructor"){
            return res.status(401).json({
                success: false,
                message:"this is a protected route for Instructor only fass gya "
            })
        }
        next();
    } catch(err){
           
        return res.status(500).json({
            success: false,
            message:"Something went wrong while verifying the Instructor's role",
        });
    }
};
