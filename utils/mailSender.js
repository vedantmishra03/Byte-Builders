  const nodemailer=require("nodemailer");
  require("dotenv").config();

  const mailSender=async (email,title,body) =>{
    try{ 
        let transporter= nodemailet.createTransporter({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
        })

        let info = await transporter.sendMail({
            from:'Byte-Builders || Vedant Mishra',
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`
        })
        console.log(info);
        return info;

    } catch(err){
        console.log(err.message);
    }
  }