const express = require('express');
const user = require('../models/userModel');
const randomstring = require('randomstring');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const password = process.env.password

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nisana1994@gmail.com',
        pass:  password
    }
});
const sentotp =async (req,res,next)=>{

    let userdata = {
        name:req.body.name,
        email:req.body.email,
        mobile:req.body.mobile,
        password:await bcrypt.hash(req.body.password,10)
    }

    const email = req.body.email;
    const check = await user.findOne({email:email});
    if(check){
        res.render('signup',{error:"Email already exists!!"})
    }else{
        let generatedOTP = randomstring.generate(6);
        req.session.userdata = userdata;
        req.session.generatedOTP = generatedOTP;
        const mailOptions = {
            from: 'nisana1994@gmail.com',
            to:email,
            subject:'Your OTP for Email Verification',
            text:`Your OTP for email verification is'${generatedOTP}`
        };
    
        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.error(error);
                res.status(500).send('Failed to send otp');
                
            }else{
                console.log('OTP sent');
                // res.render('otpverify');
                next();
                
            }
        });
        setTimeout(()=>{
            generatedOTP = randomstring.generate(6)
        },300000);
    }  
   
}
module.exports = sentotp;