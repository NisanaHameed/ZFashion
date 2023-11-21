const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Address = require('../models/addressModel');
const Product = require('../models/productModel');
const Wallet = require('../models/walletModel');
const Coupon = require('../models/couponModel');
var instance = new Razorpay({
    key_id: process.env.Razkeyid,
    key_secret: process.env.Razkeysecret,
});


const getCheckOut = async (req, res) => {
    try {
        let username = req.session.username;
        const user = req.session.userId;
        const cart = await Cart.findOne({ UserId: user }).populate({ path: 'Products.ProductId', populate: { path: 'Offer' } }).populate('isCoupon');
        const address = await Address.findOne({ UserId: user });
        let total = 0;

        var products = cart.Products;
        products.forEach(item => {
            if (item.ProductId.Offer) {
                if (new Date(item.ProductId.Offer.startDate) <= Date.now() && new Date(item.ProductId.Offer.endDate) >= Date.now() && item.ProductId.Offer.isBlock==false) {
                    let offerprice = Math.ceil(((item.ProductId.Price) - (item.ProductId.Price * item.ProductId.Offer.Value / 100))) * item.Quantity;
                    total += offerprice
                } else {
                    total += (item.ProductId.Price * item.Quantity);
                }
            } else {
                total += (item.ProductId.Price * item.Quantity);
            }
        });
        let discountedAmount = total;
        if (cart.isCoupon) {
            discountedAmount -= cart.isCoupon.discountAmount;
        }


        res.render('checkout', { cart, address, total, discountedAmount, message: '', username });
    } catch (error) {
        console.log(error);
    }
}

function generateUniqueID() {
    const timestamp = new Date().getTime().toString(36);
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${timestamp}${randomString}`;
}

const checkOut = async (req, res) => {
    let user = req.session.userId;
    let cart = await Cart.findOne({ UserId: user }).populate({ path: 'Products.ProductId', populate: { path: 'Offer' } }).populate('isCoupon');
    let totalamount = 0;
    cart.Products.forEach(item => {
        if (item.ProductId.Offer) {
            if (new Date(item.ProductId.Offer.startDate) <= Date.now() && new Date(item.ProductId.Offer.endDate) >= Date.now() && item.ProductId.Offer.isBlock==false) {
                let offerprice = Math.ceil(((item.ProductId.Price) - (item.ProductId.Price * item.ProductId.Offer.Value / 100))) * item.Quantity;
                console.log('offerprice' + offerprice)
                totalamount += offerprice
            } else {
                totalamount += (item.ProductId.Price * item.Quantity);
            }
        } else {
            totalamount += (item.ProductId.Price * item.Quantity);
        }
    });
    if (cart.isCoupon) {
        totalamount -= cart.isCoupon.discountAmount;
    }
    if (cart.Products.length) {
        try {
            let status;
            let Payment = req.body.payment;
            if (Payment == "Wallet") {
                const wallet = await Wallet.findOne({ UserId: user });
                if (wallet) {
                    if (wallet.Balance < totalamount) {
                        return res.json({ walletbal: false });
                    }
                } else if (!wallet) {
                    return res.json({ walletbal: false });
                }
            }
            if (Payment === "Online Payment") {
                status = "Pending";
            } else {
                status = "Placed";
            }

            let products = cart.Products;
            console.log(products);
            let addressindex = req.body.address;
            console.log('addressid' + addressindex);
            const address = await Address.findOne({ UserId: user }, { _id: 0, Address: 1 });
            console.log(address);
            let stocks = [];
            let orderedProducts = [];
            for (let i = 0; i < products.length; i++) {
                let a = products[i].ProductId;
                let b = products[i].Quantity;
                console.log(a, b)
                let c = { pId: a, qty: b };
                stocks.push(c);
                let productPrice = products[i].ProductId.Price;
                if(products[i].ProductId.Offer){
                    if(new Date(products[i].ProductId.Offer.startDate) <= Date.now() && new Date(products[i].ProductId.Offer.endDate) >= Date.now() && products[i].ProductId.Offer.isBlock==false){
                        productPrice = Math.ceil(((products[i].ProductId.Price) - (products[i].ProductId.Price * products[i].ProductId.Offer.Value / 100)));
                    }        
                }
                let p = {
                    ProductId: products[i].ProductId._id,
                    Price: productPrice,
                    Quantity: products[i].Quantity,
                    Totalprice: productPrice * (products[i].Quantity)
                }
                orderedProducts.push(p);
            }
            let orderData = new Order({
                UserId: user,
                deliveryDetails: address.Address[addressindex],
                Products: orderedProducts,
                deliveryDate: new Date('2023-10-31T00:00:00.000Z'),
                totalAmount: totalamount,
                Date: Date.now(),
                Status: status,
                paymentMethod: req.body.payment,
                OrderId:generateUniqueID()
            });
            await orderData.save()
                .then(async (neworder) => {
                    if (neworder.Status === "Placed") {
                        if (Payment == "Wallet") {
                            let newtransaction = {
                                Amount: -totalamount,
                                Date: new Date()
                            }
                            await Wallet.updateOne({ UserId: user }, { $inc: { Balance: -totalamount }, $push: { Transaction: newtransaction } });
                        }
                        if (cart.isCoupon) {
                            await Coupon.updateOne({ _id: cart.isCoupon._id }, { $push: { usedUsers: user } })
                        }
                        await Cart.updateOne({ UserId: user }, { $set: { Products: [] }, $unset: { isCoupon: 1 } });
                        for (let i = 0; i < stocks.length; i++) {
                            await Product.updateOne({ _id: stocks[i].pId }, { $inc: { Stock: -stocks[i].qty } });
                        }
                        res.json({ cod: true });
                    } else {
                        var options = {
                            amount: totalamount * 100,  // amount in the smallest currency unit
                            currency: "INR",
                            receipt: "" + neworder._id
                        };
                        instance.orders.create(options, function (err, order) {
                            console.log(order);
                            if (err) {
                                console.log(err);
                            } else {
                                res.json({ order });
                            }

                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                })
        } catch (error) {
            console.log(error);
        }
    } else {
        res.redirect('/');
    }

}

const verifyOrder = async (req, res) => {
    try {
        const { payment, order } = req.body;
        console.log('Your orderid-' + order.receipt);
        let user = req.session.userId;
        let cart = await Cart.findOne({ UserId: user }).populate('isCoupon');
        let products = cart.Products;
        let stocks = [];
        for (let i = 0; i < products.length; i++) {
            let stk = { pId: products[i].ProductId, qty: products[i].Quantity };
            stocks.push(stk);
        }

        const hmac = crypto.createHmac("sha256", process.env.Razkeysecret);
        hmac.update(
            payment.razorpay_order_id +
            "|" +
            payment.razorpay_payment_id
        );
        const hmacValue = hmac.digest("hex");
        if (hmacValue === payment.razorpay_signature) {

            await Order.updateOne({ _id: order.receipt }, { $set: { Status: "Placed" } });

            if (cart.isCoupon) {
                await Coupon.updateOne({ _id: cart.isCoupon._id }, { $push: { usedUsers: user } })
            }

            await Cart.updateOne({ UserId: user }, { $set: { Products: [] }, $unset: { isCoupon: 1 } });

            for (let i = 0; i < stocks.length; i++) {
                await Product.updateOne({ _id: stocks[i].pId }, { $inc: { Stock: -stocks[i].qty } });
            }
            res.json({ placed: true });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

const getOrdersUser = async (req, res) => {
    try {
        let username = req.session.username;
        let userid = req.session.userId;
        const order = await Order.find({ UserId: userid });
        res.render('orders', { order, username });
    } catch (error) {
        console.log(error);
    }
}

const getOrderDetails = async (req, res) => {
    try {
        let username = req.session.username;
        if (!username) {
            res.redirect('/login');
        }
        let orderid = req.params.order;
        console.log(orderid)
        const order = await Order.findOne({ _id: orderid }).populate('Products.ProductId');
        res.render('orderDetail', { order, username });

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

const cancelOrder = async (req, res) => {
    try {
        let user = req.session.userId;
        let orderid = req.body.orderId;
        const order = await Order.findById(orderid);
        let products = order.Products;
        let stocks = [];
        for (let i = 0; i < products.length; i++) {
            let a = products[i].ProductId;
            let b = products[i].Quantity;
            let c = { pId: a, qty: b };
            stocks.push(c);
        }
        await Order.updateOne({ _id: orderid }, { $set: { Status: "Cancelled" } });
        for (let i = 0; i < stocks.length; i++) {
            await Product.updateOne({ _id: stocks[i].pId }, { $inc: { Stock: stocks[i].qty } });
        }
        if (order.paymentMethod === "Online Payment" || order.paymentMethod === "Wallet") {
            let newtransaction = {
                Amount: order.totalAmount,
                Date: new Date()
            }
            await Wallet.updateOne({ UserId: user }, { $push: { Transaction: newtransaction }, $inc: { Balance: order.totalAmount } }, { upsert: true })
        }
        res.json({ cancelled: true });
    } catch (err) {
        console.log(err);
    }
}

const getAdminOrders = async (req, res) => {
    const pageNum = req.query.page;
    const perPage = 6;
    const page = '/';
    try {
        let docCount = await Order.find().countDocuments();
        let pages = Math.ceil(docCount / perPage);
        let order = await Order.find().skip((pageNum - 1) * perPage).limit(perPage).sort({ Date: -1 }).populate('UserId');
        res.render('orders', { order, page, pageNum, docCount, pages });
    } catch (err) {
        console.log(err);
    }
}

const adminOrderDetails = async (req, res) => {
    try {
        let orderid = req.params.id;
        let order = await Order.findById(orderid).populate('Products.ProductId');
        console.log(order);
        res.render('orderDetails', { order });
    } catch (err) {
        console.log(err);
    }
}

const adminCancelOrder = async (req, res) => {
    try {
        let orderid = req.params.id;
        const order = await Order.findById(orderid);
        let products = order.Products;
        let stocks = [];
        for (let i = 0; i < products.length; i++) {
            let a = products[i].ProductId;
            let b = products[i].Quantity;
            let c = { pId: a, qty: b };
            stocks.push(c);
        }
        await Order.updateOne({ _id: orderid }, { $set: { Status: "Cancelled" } });
        for (let i = 0; i < stocks.length; i++) {
            await Product.updateOne({ _id: stocks[i].pId }, { $inc: { Stock: stocks[i].qty } });
        }
        res.redirect('/admin/orders');
    } catch (err) {
        console.log(err);
    }
}

const adminchangeStatus = async (req, res) => {
    try {
        let status = req.query.q;
        let orderid = req.query.id;
        await Order.updateOne({ _id: orderid }, { $set: { Status: status } });
        res.redirect('/admin/orders');
    } catch (err) {
        console.log(err);
    }
}

const returnProduct = (req, res) => {
    try {
        let username = req.session.username;
        let orderId = req.params.id
        res.render('returnProduct', { orderId, username });
    } catch (err) {
        console.log(err);
    }
}

const submitReturnProduct = async (req, res) => {
    try {
        let user = req.session.userId;
        let returnreason = req.body.returnreason;
        let orderid = req.params.id;
        const order = await Order.findById(orderid);
        let products = order.Products;
        let stocks = [];
        for (let i = 0; i < products.length; i++) {
            let a = products[i].ProductId;
            let b = products[i].Quantity;
            let c = { pId: a, qty: b };
            stocks.push(c);
        }
        let amount = order.totalAmount;
        let newTransaction = {
            Amount: amount,
            Date: new Date()
        }
        await Order.updateOne({ _id: orderid }, { $set: { Status: "Returned", returnReason: returnreason } });
        await Wallet.updateOne({ UserId: user }, { $push: { Transaction: newTransaction }, $inc: { Balance: amount } }, { upsert: true });
        for (let i = 0; i < stocks.length; i++) {
            await Product.updateOne({ _id: stocks[i].pId }, { $inc: { Stock: stocks[i].qty } });
        }
        res.redirect('/orders');
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

const orderSuccess = (req, res) => {
    try {
        let username = req.session.username;
        res.render('orderSuccess', { username });
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    getCheckOut,
    checkOut,
    verifyOrder,
    getOrdersUser,
    getOrderDetails,
    cancelOrder,
    getAdminOrders,
    adminOrderDetails,
    adminCancelOrder,
    adminchangeStatus,
    returnProduct,
    submitReturnProduct,
    orderSuccess
}