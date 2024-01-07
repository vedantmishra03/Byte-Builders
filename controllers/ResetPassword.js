const { response } = require("express");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt=require("bcrypt");

//logic yeh hai ==>
// we want to do 2 things
//1=>if i forget the password  => i generate a link and send it to mail => that link has unique token expire time
//2=>on clicking link ui is open there we can update password and update in dase after verification of token

//resetPasswordToken=> for mail send => generat a frontend link

exports.resetPasswordToken = async (req, res) => {
  try {
    //1.get email from req body
    const { email } = req.body;
    //2.verify the email from db interaction =>
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email does not exist/ not registered with us",
      });
    }
    //3.generate token
    const token = crypto.randomUUID();

    //4.update user buy adding token and expiration time in db
    const updateData = await User.findOneAndUpdate(
      { email },
      { token: token, resetPasswordExpires: Date.now() + 5 * 60 * 1000 },
      { new: true }
    );

    //5.create url for front end using crypto token
    const url = `http://localhost:3000/update-password/${token}`;
    //6.send mail having url
    await mailSender(
      email,
      "Password Reset Mail",
      `Password reset link : ${url} will expires in 5 minutes`
    );

    //7. return response
    return res.status(200).json({
      success: true,
      message:
        "Email send successfully , please check email and change password ",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wromg while resetting the password",
    });
  }
};

//resetPassword =>for reset the password in db => update new password

// now we open the url and update password if token is valid =>having valid time and correct value

exports.resetPassword = async (req, res) => {
  try {
    // fetch newpassword ,confirmnewpassword, token from req body => front end send all the 3 things in req from link => token
    const { newPassword, confirmNewPassword, token } = req.body;
    //validate newPassword
    if (newPassword !== confirmNewPassword) {
      return res.status(403).json({
        success: false,
        message: "New password and confirmNewPassword does't match",
      });
    }
    // we dont have email now check unique token exist in db => or not for updating password
    const user = await User.findOneByEmail({token: token });
    if (!user) {
      return response.status(404).json({
        success: false,
        message: "Invalid Linkn for reset password",
      });
    }
    // check for time  exceed the limit of 5 min
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(403).send({
        success: false,
        message:
          "Time limit exceeded, please resend the link for reset the password",
      });
    }
    //  if every thing is ok then hash the new password
    const hashNewPassword = await bcrypt.hash(newPassword, 10);
    // upadte the password
    const updatePassword = await User.findOneAndUpdate(
      { token: token },
      { password: hashNewPassword },
      { new: true }
    );
    //send the response
    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while updating password , Error while updating password",
    });
  }
};
