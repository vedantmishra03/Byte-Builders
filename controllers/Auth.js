const User=require("../models/User");
const OTP=require("../models/OTP");
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { response } = require("express");
require("dotenv").config();
//sendOTP => for signup 
exports.sendOTP= async (req,res)=>{
    try {
         // fetch the email
         const {email}=req.body;
         //check for already exist
         const alreadyExists = await User.findOne({email});
         if(alreadyExists){
            return res.status(401).json({
                 success:false,
                 message:"User already registered , please login"
            });
         }
         // generate otp => npm i otp-generator
         var otp=otpGenerator.generate(6, { 
            upperCaseAlphabets: false, 
            specialChars: false ,
            lowerCaseAlphabets:false
        });
        console.log("OTP generated successfully", otp);
        //check for unique otp=> // not a good code 
        let result=await OTP.findOne({otp: otp});
        while(result){
            otp=otpGenerator(6, { 
                upperCaseAlphabets: false, 
                specialChars: false ,
                lowerCaseAlphabets:false});
            
            result=await OTP.findOne({otp: otp});
        }
        // now after having  a unique otp we save this in our db 
        const otpPayload={
            email,otp
        };
        const otpBody=await OTP.create({otpPayLoad});
        console.log(otpBody);

        //return response of succes
        return res.status(200).json({
           success:true,
           message:"OTP sended successfully",
           otp,
        })

    } catch (error) {
         console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong with otp , try again",
         });
    }
};



//signup=>
exports.signup= async (req,res)=>{
    
    try {
        // fetch the data from request body
          const {
            firstName,
            lastName,
            email,
            contactNumber,
            password,
            confirmPassword,
            accountType,
            otp
          }=req.body;

        // check all the fields are present in req ==> all fieldes are neccessory
        if(!firstName || !lastName || !email || !password || !otp || 
            !confirmPassword){
            return res.status(403).send({
                success: false,
                message: "All fields are requrired",
            });
        }

        //check for already registered 
        const alreadyRegistered =await User.findOne({email});
        if(alreadyRegistered){
            return res.status(401).json({
                success: false,
                messaage:"Email already registered, please login"
            })
        };

        // check the two passwords are same or not
        if(password!==confirmPassword){
            return res.status(400).json({
              success: false,
              messaage:"Password and confirm password do not match",
            })
        }

        //find the most recent otp=> cahiye  => cretaedAt k aadhar p decresing sort => and limit thwe documenent for 1 query only
        //findOne will return first query with same email and then we sort the query according to createdAt decreasing value => then we only select one document from db

        const recentOtp = await OTP.findOne({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);
        // validate the otp

        if(recentOtp.length===0){
            //OTP not found
            return res.status(404).json({
                success: false,
                message: 'Otp not found'
            })
        } else if(otp!=recentOtp.otp){
             return res.status(404).json({
                success: false,
                message:"Invalid otp",
             });
        }
         
        // hash the password
    const hashPassword = await bcrypt.hash(password,10);

        //// save imn db 

        const profileDetails=await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        });
        const user= await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashPassword,
            accountType,
            additionalDetails:profileDetails,
            //we use dicebear
            image:`https://api.dicebear.com/7.x/initials/svg?seed=${firstName} ${lastName}`

        })

        // send the response
        return response.status(200).json({
            success: true,
            message:"User is registered successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message:"User registration failed, please try again",
        });
    }
};


//login=>>>>
 
exports.login= async (req, res) => {
     try{ 
        // fetch the email,password
        const {email,password} = req.body;

        if(!email || !password) {
            return res.status(401).json({
                success: false,
                message:"Please enter all the details",
            });
        }
        // check if email not already exists
        const user = await User.findOne({email});
        if(!user) {
             return res.status(401).json({
                success: false,
                messager :"Please signup first",
             });
           }

           //validate password => then make jwt token=>

       if(await bcrypt.compare(password,user.password)) {
        // now password is verifired we can genrate token and can send in response;
         const payload={
            email:user.email,
            id:user._id,
            accountType:user.accountType,
         }
        const token=jwt.sign(payload,process.env.JWT_SECRET,{
            expiresIn:"2h",
        });
        user.token = token; 
        // hide password from the objected fetched from db not changing the data pressent in db
        password=undefined;
         
        const options={
            expires: new Date(Date.now() + 3*24*60*60*1000), 
            httpOnly: true
        }
        //create cookie and send response
        res.cookie("token",token,options).status(200).json({
             success: true,
             message: "Logged in successfully",
             token,
             user,
        });

       } else{
        //incorrect password , please try again
        return res.status(403).json({
            success: false,
            message: "Invalid password/ incorrect ",
        }); 
       }
     } catch(err){
        
        console.log(err);
        return res.status(500).json({
           success: false,
           message:"Login failed please try again",
        });
     }
};
 

//changePassword =>>>
  
exports.changePassword= async (req,res)=>{
    //flow-- fetch data from req..
    //get oldPassword, newPassword, confirnNewPassword
    //validation on password

    // update password in db
    //send mail-> password changed successfully

    try {
        const {email,oldPassword,newPassword,confirmPassword} = req.body;
        //
        if(!confirmPassword || !newPassword || !oldPassword) {
            return res.status(403).json({
                success: false,
                message:"Please fill all the fields below",
            });
        } 
        if(newPassword!==confirmPassword){
            return res.status(403).json({
                success: false,
                message:"new password and confirm password do not match",
            });
        }

        const user= await User.findOne({email});

        if(!user){
            return res.status(403).json({
                success: false,
                message:"Not a valid user, please signup first",
            });
        };

        // check the old password is correct or not 

        if(await bcrypt.compare(oldPassword, user.password)){
            // means old password is correct we can replace  the old with new one 

            const hashNewPassword=await bcrypt.hash(newPassword,10);

        await User.findOneAndUpdate(
            {email:email},
            {$set:{password:hashNewPassword}},
            {new:true},
            );
        
        // send mail 
        const mailSender=require("../utils/mailSender");

       await mailSender(email,"Password Updated","Password Updated successfully");

            return res.status(500).json({
                success: true,
                message:"Password updated successfully "
            })

        }
        else{
            // incorrect old password 
            return res.status(400).json({
               success:false,
               message:"Old password is incorrect, please fill correct password"
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success:false,
               message:"Somthing went wrong while Updating Password",
        });
    }
};