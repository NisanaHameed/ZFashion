var express = require('express');
const user = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const Rate = require('../models/rateModel');

let generatedOTP;
let userdata;
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
}

// const otpform = (req,res)=>{
//     try{
//         res.render('otpverify');
//     }catch(err){
//         console.log(err);
//     }
// }

const sentotp = async (req, res) => {

    userdata = {
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
        password: await bcrypt.hash(req.body.password, 10)
    }

    const email = req.body.email;
    const check = await user.findOne({ email: email });
    if (check) {
        res.render('signup', { error: "Email already exists!!" })
    } else {
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
                res.render('otpverify');

            }
        });
        setTimeout(() => {
            generatedOTP = randomstring.generate(6)
        }, 300000);
    }

}

const verifyotp = async (req, res) => {

    try {
        const enteredotp = req.body.otp;
        if (generatedOTP == enteredotp) {
            const data = await user.insertMany([userdata]);
            req.session.userLoggedIn = true;
            req.session.userId = data._id;
            req.session.username = data.name;
            res.redirect('/');
        } else {
            res.send('incorrect otp');
        }

    } catch (err) {

        res.send(err);
        console.log(err)
    }
}

const home = async (req, res) => {
    try {
        let username = req.session.username;
        const product = await Product.find();
        const category = await Category.find();
        res.render('home', { product, category, username });
    } catch (error) {
        console.log(error);
    }

}

const loadLogin = function (req, res) {

    res.render('login', { error: "" });

}

const login = async (req, res) => {
    try {
        const finduser = await user.findOne({ email: req.body.email });
        if (finduser) {
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
        categorytoFront = findCategory.map(val => {
            return val.name;
        })
        let findBrand = req.query.searchbrand || "";
        if (!findBrand.length) {
            findBrand = brands;
        }
        let search = req.query.search || "";
        console.log("Datatype" + typeof (findCategory));
        console.log("Datatype" + typeof (findBrand));
        let sort = req.query.sort;
        console.log('sort...' + sort)
        let sortProduct;
        if (sort == 1) {
            sortProduct = { Price: 1 };
        } else if (sort == -1) {
            sortProduct = { Price: -1 };
        } else {
            sort = 0
        }

        const product = await Product.find({
            Category: categorytoFront,
            Brand: findBrand,
            $or: [
                // { Brand: { $regex: search, $options: 'i' } } ,
                { product_name: { $regex: search, $options: 'i' } },
            ]
        }).sort(sortProduct);
        // console.log(product)
        // const product = await Product.find({ $or: [{ product_name: { $regex: search, $options: 'i' } }, {Category:{ $in: findCategory }}, { Brand:{$in: findBrand }}] });

        // console.log(brands)
        res.render('shop', { product, category, brands, username });
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

// const loadBrandShop = async (req, res) => {
//     try {
//         let selectedBrand = req.params.id;
//         let category = await Category.find();
//         let brands = await Product.find({}, { Brand: 1 })
//         const product = await Product.find({ Brand: selectedBrand });
//         console.log(product)
//         res.render('shop', { product, category, brands })
//     } catch (error) {
//         console.log(error);
//     }
// }

const loadProductdDetail = async (req, res) => {
    try {
        let username = req.session.username;
        let id = req.params.id;
        const product = await Product.findOne({ _id: id });
        let catgry = product.Category;
        let similar = await Product.find({ Category: catgry, _id: { $ne: id } });
        const rate = await Rate.findOne({ ProductId: id }).populate('User.UserId');
        // console.log('Rate' + rate);
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
        res.render('profile', { user, username });
    } catch (error) {
        console.log(error);
    }
}
let editedData;
const editUserProfile = async (req, res) => {
    try {

        console.log('hii otp')
        let userid = req.session.userId;
        // console.log(req.body.email)
        // console.log(userid)
        let email = req.body.email;
        const finduser = await User.findById(userid);
        if(finduser.email==email){
            await User.updateOne({ _id: userid }, { $set: { name: req.body.name, mobile: req.body.mobile } });
            return res.json({edited:true});
        }
        const userexist = await User.findOne({ email: email, _id: { $ne: userid } });
        if (userexist) {
            return res.json({userExist:true});
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
                // res.render('otpverify');
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

module.exports = {
    loadSignup,
    sentotp,
    verifyotp,
    loadLogin,
    login,
    home,
    loadShop,
    loadProductdDetail,
    loadCategoryShop,
    // loadBrandShop,
    getProfile,
    editUserProfile,
    editVerifyOtp,
    changePassword,
    logout
}
