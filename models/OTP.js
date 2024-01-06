// for creating model we need 2 things first is  modelname and schema
const mongoose=require('mongoose');
const mailSender=require("../utils/mailSender")

const otpSchema=new mongoose.Schema({
    email:{
        type:String,
        trim:true,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60
    },
    otp:{
        type:String,
        required:true,
    }
});

// we have to create pre middleware for otp verification ... we have to create here,
// we have to write nodemailer => in Utils folder ...

// A function to send email=>>

async function sendVerificationEmail(email,otp){
    try{
        const mailResponse = await mailSender(email, "Verification Email by Byte-Builders", otp);
    console.log("Email sent successfully",mailResponse);

    }
    catch(err){
        console.log("error occured while sending email", err);
        throw err;
    }
}

// write pre middleware => db me save hone se phle mail send krega 

otpSchema.pre("save", async function(next){
await sendVerificationEmail(this.email,this.otp);
next();
})

 module.exports= mongoose.model("OTP",otpSchema);