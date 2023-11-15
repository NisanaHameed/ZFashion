var express = require('express');
const user = require('../models/userModel');
const bcrypt = require('bcrypt');
const multer = require('multer');
const Order = require('../models/orderModel');
const User = require('../models/userModel');


const loadLogin = (req, res) => {
    try {
        res.render('login', { error: '' });
    } catch (err) {
        console.log(err)
    }
};

const registerLogin = async (req, res) => {

    try {
        const data = await user.findOne({ email: req.body.email, role: "admin" })
        if (data) {
            const isPasswordValid = await bcrypt.compare(req.body.password, data.password)
            if (isPasswordValid) {
                req.session.loggedIn = true;
                req.session.admin = data;
                let name = data.name
                console.log(name);
                res.redirect('/admin');
            } else {
                res.render('login', { error: "Password does not match!" })
            }
        } else {
            res.render('login', { error: "Email does not match!" })
        }
    } catch (err) {
        console.log(err);
        res.status(500)
    }
}

const loadDashboard = async (req, res) => {
    try {
        const data = req.session.admin;
        const orders = await Order.find({}, 'totalAmount Date').sort({ Date: 1 });
        const categories = orders.map(order => {
            const date = order.Date;
            return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
        });
        const seriesData = orders.map(order => order.totalAmount);
        let totalUsers = await User.countDocuments();
        let blockedUsers = await User.countDocuments({ isBlock: true });
        let cancelledOrder = await Order.countDocuments({ Status: "Cancelled" });
        let returnedOrder = await Order.countDocuments({ Status: "Returned" });
        let orderlist = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalSale: { $sum: '$totalAmount' },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);
        let refund = await Order.aggregate([
            {
                $match: {
                    Status: { $in: ["Cancelled", "Returned"] },
                    paymentMethod: { $in: ["Online Payment", "Wallet"] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRefund: { $sum: '$totalAmount' }
                }
            }
        ])
        let orderStats = await Order.aggregate([
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 }
                }
            }
        ]);
        console.log(orderStats)
        let orderPayment = orderStats.map(val=>{
            return val._id;
        })
        let paymentCount = orderStats.map(val=>{
            return val.count;
        })
        console.log(orderPayment)
        res.render('dashboard', {
            name: data.name,
            categories: JSON.stringify(categories),
            seriesData: JSON.stringify(seriesData),
            totalUsers,
            blockedUsers,
            totalSale: orderlist[0].totalSale,
            totalOrders: orderlist[0].totalOrders,
            totalRefund: refund[0].totalRefund,
            cancelledOrder,
            returnedOrder,
            orderPayment:JSON.stringify(orderPayment),
            paymentCount:JSON.stringify(paymentCount)
        });
    } catch (err) {
        console.log(err);
    }
}

const loadUsers = async (req, res) => {

    let name = req.session.admin.name
    user.find({ role: 'user' })
        .then(users => {

            res.render('users', { users, name })
        })
        .catch((err) => {

            console.log(err)
            res.status(500).send({ error: 'Something went wrong' })
        })
}

const blockUser = async (req, res) => {

    const { id } = req.params;
    try {
        const data = await user.findById(id);
        if (!data) {
            res.send('User not found');
        }
        const isBlocked = data.isBlock;

        await user.updateOne({ _id: id }, { $set: { isBlock: !isBlocked } });

        res.redirect('/admin/Users');
    } catch (err) {
        res.send(err);
    }
}


const adminLogout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/admin/login');
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadDashboard,
    loadLogin,
    registerLogin,
    loadUsers,
    blockUser,
    adminLogout,
}