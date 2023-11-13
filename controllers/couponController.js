const express = require('express');
const Coupon = require('../models/couponModel');
const Cart = require('../models/cartModel');

const getAdminCoupon = async (req, res) => {
    try {
        let coupon = await Coupon.find();
        res.render('coupon', { coupon });
    } catch (err) {
        console.log(err);
    }
}

const getAddCoupon = async (req, res) => {
    try {
        res.render('addCoupon');
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

const addCoupon = async (req, res) => {
    try {
        const findCoupon = await Coupon.findOne({couponCode:req.body.code});
        if(findCoupon){
            res.json({couponexist:true});
        }else{
            const data = new Coupon({
                Name: req.body.name,
                couponCode: req.body.code,
                discountAmount: req.body.discountamount,
                activationDate: req.body.activationdate,
                expiryDate: req.body.expirydate,
                criteriaAmount: req.body.criteriaamount,
                usersLimit: req.body.userslimit
            })    
            await data.save()
                .then(() => {
                    res.json({success:true});
                }).catch((err) => {
                    console.log(err);
                })
        }
        
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

const getUserCoupon = async (req, res) => {
    try {
        let username = req.session.username;
        let date = new Date();
        let user = req.session.userId;
        const coupons = await Coupon.find({ usedUsers: { $nin: [user] } });
        const coupon = coupons.filter(val => {
            if (val.activationDate <= date && val.expiryDate >= date) {
                return val;
            }
        })
        console.log(coupon);
        res.render('coupon', { coupon,username });

    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

const applyCoupon = async (req, res) => {
    try {
        let user = req.session.userId;
        let code = req.body.coupon;
        let date = new Date();
        const coupon = await Coupon.findOne({ couponCode: code });
        if (!coupon) {
            return res.json({ invalid: true })
        }
        const cart = await Cart.findOne({ UserId: user });
        let discount = coupon.discountAmount;
        let minAmount = coupon.criteriaAmount;

        if (minAmount <= cart.totalAmount) {
            if (coupon.usersLimit > coupon.usedUsers.length && coupon.isBlock == false) {
                if (coupon.activationDate <= date && date <= coupon.expiryDate) {
                    if (!coupon.usedUsers.includes(user)) {

                        await Cart.updateOne({ UserId: user }, { $set: { isCoupon: coupon._id }, $inc: { totalAmount: -discount } });
                        
                        return res.json({ couponapplied: true, code: code });

                    } else {
                        return res.json({ used: true });
                    }
                } else {
                    return res.json({ expired: true });
                }
            } else {
                return res.json({ invalid: true });
            }
            } else {
                return res.json({ maxamount: true });
            }

        } catch (err) {
            console.log(err);
            res.status(500)
        }
    }

const removeCoupon = async (req, res) => {
        try {
            let user = req.session.userId;
            let couponcode = req.body.code;
            const coupon = await Coupon.findOne({ couponCode: couponcode })
            await Cart.updateOne({ UserId: user }, { $unset: { isCoupon: 1 }, $inc: { totalAmount: coupon.discountAmount } });
            await Coupon.updateOne({ couponCode: couponcode }, { $pull: { usedUsers: user } });
            res.json({ success: true });
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    }

    const getEditCoupon = async (req, res) => {
        try {
            let couponId = req.params.id;
            const coupon = await Coupon.findOne({ _id: couponId });
            res.render('editCoupon', { coupon });
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    }

    const editCoupon = async (req, res) => {
        try {
            let couponId = req.params.id;
            const coupons = await Coupon.findOne({ _id: { $ne: couponId }, couponCode: req.body.code });
            if (coupons) {
                res.json({couponexist:true})
            } else {
                let data = {
                    Name: req.body.name,
                    couponCode: req.body.code,
                    discountAmount: req.body.discountamount,
                    activationDate: req.body.activationdate,
                    expiryDate: req.body.expirydate,
                    criteriaAmount: req.body.criteriaamount,
                    usersLimit: req.body.userslimit
                }
                await Coupon.updateOne({ _id: couponId }, { $set: data });
                res.json({success:true});
            }
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    }

    const blockCoupon = async (req, res) => {
        try {
            let couponid = req.params.id;
            const coupon = await Coupon.findById(couponid);
            let isBlocked = coupon.isBlock;
            await Coupon.updateOne({ _id: couponid }, { $set: { isBlock: !isBlocked } });
            res.redirect('/admin/coupon');
        } catch (err) {
            res.status(500).send(err);
            console.log(err);
        }
    }

    const deleteCoupon = async (req, res) => {
        try {
            let couponid = req.params.id;
            await Coupon.deleteOne({ _id: couponid });
            res.json({success:true});
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }
    }

    module.exports = {
        getAdminCoupon,
        getAddCoupon,
        addCoupon,
        getUserCoupon,
        applyCoupon,
        removeCoupon,
        getEditCoupon,
        editCoupon,
        blockCoupon,
        deleteCoupon
    }