var express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel');
const Rate = require('../models/rateModel');
const Wallet = require('../models/walletModel');
const Banner = require('../models/bannerModel');

let generatedOTP;
let userdata;
let referralcode;
const password = process.env.password

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nisana1994@gmail.com',
        pass: password
    }
});

const loadSignup = function (req, res) {
    res.render('signup');
    referralcode = req.query.ref;
    console.log(req.query)
}

function generateUniqueID() {
    const timestamp = new Date().getTime().toString(36);
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${timestamp}${randomString}`;
}

const sentotp = async (req, res) => {

    userdata = {
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        password: await bcrypt.hash(req.body.password, 10),
        referralCode: generateUniqueID()
    }
    const email = req.body.email;
    const check = await User.findOne({ email: email });
    if (check) {
        res.render('signup', { error: "Email already exists!!" })
    } else {
        generatedOTP = randomstring.generate(6);
        console.log('OTP  ' + generatedOTP)
        const mailOptions = {
            from: 'nisana1994@gmail.com',
            to: email,
            subject: 'Your OTP for Email Verification',
            text: `Your OTP for email verification is'${generatedOTP}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                res.status(500).send('Failed to send otp');

            } else {
                console.log('OTP sent');
                res.render('otpverify');

            }
        });
        setTimeout(() => {
            generatedOTP = randomstring.generate(6)
        }, 120000);
    }

}

const verifyotp = async (req, res) => {

    try {
        const enteredotp = req.body.otp;
        if (generatedOTP == enteredotp) {
            const data = await User.insertMany([userdata]);
            if (referralcode) {
                let referredUser = await User.findOne({ referralCode: referralcode });
                let newtransaction = {
                    Amount: 100,
                    Description: "Referral amount",
                    Date: new Date()
                }
                await Wallet.updateOne({ UserId: referredUser._id }, { $inc: { Balance: 100 }, $push: { Transaction: newtransaction } }, { upsert: true })
                await Wallet.updateOne({ UserId: data[0]._id }, { $inc: { Balance: 100 }, $push: { Transaction: newtransaction } }, { upsert: true })
            }
            req.session.userLoggedIn = true;
            req.session.userId = data[0]._id;
            req.session.username = data[0].name;
            res.redirect('/');
        } else {
            res.send('incorrect otp');
        }
    } catch (err) {
        res.send(err);
        console.log(err)
    }
}

const resendOTP = async (req,res)=>{
    try{
        generatedOTP = randomstring.generate(6);
        console.log('OTP  ' + generatedOTP)
        const mailOptions = {
            from: 'nisana1994@gmail.com',
            to: userdata.email,
            subject: 'Your OTP for Email Verification',
            text: `Your OTP for email verification is'${generatedOTP}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                res.status(500).send('Failed to send otp');

            } else {
                console.log('OTP sent');
                res.render('otpverify');
            }
        });
        setTimeout(() => {
            generatedOTP = randomstring.generate(6)
        }, 120000);
    }catch(err){
        console.log(err);
    }
}

const home = async (req, res) => {
    try {
        let username = req.session.username;
        const product = await Product.find({ Stock: { $ne: 0 } }).populate('Offer');
        const category = await Category.find();
        const banner = await Banner.find();
        res.render('home', { product, category, username, banner });
    } catch (error) {
        console.log(error);
    }
}

const loadLogin = function (req, res) {

    res.render('login', { error: "" });

}

const login = async (req, res) => {
    try {
        const finduser = await User.findOne({ email: req.body.email });

        if (finduser) {
            if (finduser.isBlock) {
                return res.render('userBlock');
            }
            const isPasswordValid = await bcrypt.compare(req.body.password, finduser.password);
            if (isPasswordValid) {
                req.session.userLoggedIn = true;
                console.log('session' + req.session.userLoggedIn)
                req.session.userId = finduser._id;
                req.session.username = finduser.name;
                console.log(req.session.userId);
                res.redirect('/');
            } else {
                res.render("login", { error: "Password does not match!" })
            }
        } else {
            res.render("login", { error: "Email does not match!" })
        }
    }
    catch (err) {
        res.send(err)
        console.log(err)
    }
}

const getforgotPassword = (req,res)=>{
    try{
        res.render('forgotPassword');
    }catch(err){
        console.log(err);
    }
}

const forgotPassword = async (req,res)=>{
    try{
        let email = req.body.email;
        let password = req.body.password;
        console.log(password);
        const checkemail = await User.findOne({email:email});
        if(!checkemail){
            res.json({nouser:true});
        }else{
            let hashedPassword = await bcrypt.hash(password, 10);
            await User.updateOne({email:email},{password:hashedPassword});
            res.json({success:true});
        } 
    }catch(err){
        console.log(err);
    }
}

const loadShop = async (req, res) => {
    try {

        let username = req.session.username;
        let category = await Category.find();
        let brands = await Product.distinct('Brand')
        let selectedCategory = req.query.searchcategory || "";
        let findCategory = await Category.find({ name: { $in: selectedCategory } });
        if (!findCategory.length) {
            findCategory = await Category.find();
        }
        let categorytoFront = findCategory.map(val => {
            return val.name;
        })
        let selectedBrand = req.query.searchbrand || ""
        let findBrand = req.query.searchbrand || "";
        if (!findBrand.length) {
            findBrand = brands;
        }
        let search = req.query.search || "";
        let sort = req.query.sort;
        let sortProduct;
        if (sort == 1) {
            sortProduct = { Price: 1 };
        } else if (sort == -1) {
            sortProduct = { Price: -1 };
        } else {
            sortProduct = {};
        }

        let product = await Product.find({
            Category: categorytoFront,
            Brand: findBrand,
            $or: [
                { product_name: { $regex: search, $options: 'i' } },
            ]
        }).populate('Offer').sort(sortProduct);
        console.log('selectedCategory' + selectedCategory + 'Datatype' + typeof (selectedCategory))
        res.render('shop', { product, category, brands, username, selectedCategory, selectedBrand, sort });
    } catch (error) {
        console.log(error);
    }
}

const loadCategoryShop = async (req, res) => {

    try {
        let id = req.params.id;
        const cat = await Category.findById(id);
        let category = await Category.find();
        const brands = await Product.find({}, { Brand: 1 })
        const product = await Product.find({ Category: cat.name });
        res.render('shop', { product, category, brands });
    } catch (error) {
        console.log(error);
    }

}

const loadProductdDetail = async (req, res) => {
    try {
        let username = req.session.username;
        let id = req.params.id;
        const product = await Product.findOne({ _id: id }).populate('Offer');
        let catgry = product.Category;
        let similar = await Product.find({ Category: catgry, _id: { $ne: id } }).populate('Offer');
        const rate = await Rate.findOne({ ProductId: id }).populate('User.UserId');
        res.render('productdetail', { product, similar, rate, username });

    } catch (error) {
        console.log(error);
    }
}

const getProfile = async (req, res) => {
    try {
        let username = req.session.username;
        const userid = req.session.userId;
        const user = await User.findById(userid);
        console.log(user)
        res.render('Profile', { user, username });
    } catch (error) {
        console.log(error);
    }
}
let editedData;
const editUserProfile = async (req, res) => {
    try {

        console.log('hii otp')
        let userid = req.session.userId;
        let email = req.body.email;
        const finduser = await User.findById(userid);
        if (finduser.email == email) {
            await User.updateOne({ _id: userid }, { $set: { name: req.body.name, mobile: req.body.mobile } });
            return res.json({ edited: true });
        }
        const userexist = await User.findOne({ email: email, _id: { $ne: userid } });
        if (userexist) {
            return res.json({ userExist: true });
        }
        editedData = {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
        }

        generatedOTP = randomstring.generate(6);

        const mailOptions = {
            from: 'nisana1994@gmail.com',
            to: email,
            subject: 'Your OTP for Email Verification',
            text: `Your OTP for email verification is'${generatedOTP}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                res.status(500).send('Failed to send otp');

            } else {
                console.log('OTP sent');
                res.json({ success: true });

            }
        });
        setTimeout(() => {
            generatedOTP = randomstring.generate(6)
        }, 300000);

    } catch (error) {
        console.log(error);
    }
}

const editVerifyOtp = async (req, res) => {
    try {
        console.log(editedData);
        let OTP = req.body.otp;
        console.log('OTP' + OTP)
        let user = req.session.userId;
        console.log('user' + user)
        if (generatedOTP == OTP) {
            await User.updateOne({ _id: user }, { $set: { name: editedData.name, email: editedData.email, mobile: editedData.mobile } });
            res.redirect('/profile');
        } else {
            res.send("Incorrect OTP");
        }


    } catch (err) {
        console.log(err);
    }
}

const changePassword = async (req, res) => {
    try {
        let id = req.session.userId;
        let currentpassword = req.body.currentpassword;
        let newpassword = req.body.newpassword;
        let userdata = await User.findById(id);
        const isPasswordValid = await bcrypt.compare(currentpassword, userdata.password);
        if (isPasswordValid) {
            let pass = await bcrypt.hash(newpassword, 10);
            await User.updateOne({ _id: id }, { $set: { password: pass } });
            res.json({ password: true });
        } else {
            res.json({ password: false });
        }
    } catch (err) {
        console.log(err);
    }
}

const logout = (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (err) {
        console.log(err);
    }
}

const getContact = (req, res) => {
    try {
        let username = req.session.username;
        res.render('contact', { username });
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    loadSignup,
    sentotp,
    verifyotp,
    resendOTP,
    loadLogin,
    login,
    getforgotPassword,
    forgotPassword,
    home,
    loadShop,
    loadProductdDetail,
    loadCategoryShop,
    getProfile,
    editUserProfile,
    editVerifyOtp,
    changePassword,
    logout,
    getContact
}
