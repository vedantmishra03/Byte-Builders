// here we connect our db  
 const mongoose= require('mongoose');
 require("dotenv").config();

 const connect= ()=>{
    mongoose.connect(process.env.DATABASE_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(()=>{console.log("Connection successful with Database")})
    .catch((err)=>{
        console.log("Connection failed with database");
        console.log(err.message); 
        process.exit(1);
    });
     
 }
 module.exports = connect;