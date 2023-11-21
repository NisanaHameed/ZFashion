const express = require('express');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

const loadCart = async (req, res) => {
    try {
        let username = req.session.username;
        const userid = req.session.userId;
        console.log('user ' + userid)
        let total = 0;
        let discountedAmount = 0;
        const cart = await Cart.findOne({ UserId: userid }).populate({ path: 'Products.ProductId', populate: { path: 'Offer' } }).populate('isCoupon');
        if (cart) {
            var products = cart.Products;
            console.log(products)
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
            let discount = total;
            console.log('Total  ' + total)
            if (cart.isCoupon) {
                let date = new Date();
                if (cart.isCoupon.criteriaAmount > total || cart.isCoupon.usersLimit <= cart.isCoupon.usedUsers.length || cart.isCoupon.isBlock == true || cart.isCoupon.activationDate > date || cart.isCoupon.expiryDate < date) {
                    await Cart.updateOne({ UserId: userid }, { $unset: { isCoupon: 1 } });

                } else {
                    discount -= cart.isCoupon.discountAmount;
                }
            }
            discountedAmount = discount;
        }

        res.render('cart', { cart, total, discountedAmount, username });

    } catch (error) {
        console.log(error);

    }
}

const addCart = async (req, res) => {
    try {

        const userId = req.session.userId;
        if (!userId) {
            return res.json({ message: 'Please log in!!' });
        }
        let user = await User.findById(userId);
        if (user.isBlock == true) {
            return res.json({ blocked: true });
        }
        console.log(userId);
        const productId = req.body.productId;
        console.log(productId);
        const product = await Product.findOne({ _id: productId });
        if (product.Stock > 0) {
            // let total = 0;
            const cart = await Cart.findOne({ $and: [{ UserId: userId, 'Products.ProductId': productId }] })

            if (cart) {

                return res.json({ incart: true });

            } else {

                const pr = {
                    ProductId: productId,
                    Quantity: 1,
                    Size: req.body.size
                }
                console.log(product.Price)
                await Cart.updateOne({ UserId: userId }, { $push: { Products: pr } }, { upsert: true });

            }
            return res.json({ stock: true });
        } else {
            return res.json({ stock: false });
        }
    } catch (error) {
        console.log(error);
    }
}

const removeCartItem = async (req, res) => {
    try {
        let userId = req.session.userId;
        let productId = req.body.productId;
        let productprice = await Product.findById(productId)
        const cart = await Cart.findOne({ UserId: userId }).populate('isCoupon');
        await Cart.updateOne({ UserId: userId }, { $pull: { 'Products': { ProductId: productId } } });
        let total = 0;
        const newCart = await Cart.findOne({ UserId: userId }).populate({ path: 'Products.ProductId', populate: { path: 'Offer' } });
        newCart.Products.forEach(item => {
            if (item.ProductId.Offer) {
                if (new Date(item.ProductId.Offer.startDate) <= Date.now() && new Date(item.ProductId.Offer.endDate) >= Date.now() && item.ProductId.Offer.isBlock==false) {
                    let offerprice = Math.ceil(((item.ProductId.Price) - (item.ProductId.Price * item.ProductId.Offer.Value / 100))) * item.Quantity;
                    console.log('offerprice' + offerprice)
                    total += offerprice
                } else {
                    total += (item.ProductId.Price * item.Quantity);
                }
            } else {
                total += (item.ProductId.Price * item.Quantity);
            }
        });
        console.log('total  ' + total)
        if (cart.isCoupon) {
            if (total < cart.isCoupon.criteriaAmount) {
                await Cart.updateOne({ UserId: userId }, { $unset: { isCoupon: 1 } })
            }
        }
        res.json({ success: true });
    } catch (error) {
        console.log(error);
    }
}
const updateQuantity = async (req, res) => {
    try {

        let userId = req.session.userId;
        console.log(userId)
        const { productId, count } = req.body;
        console.log('datatype' + typeof (productId))
        const products = await Product.findOne({ _id: productId });
        const cart = await Cart.findOne({ UserId: userId }).populate('isCoupon');
        let product = cart.Products.filter(val => {
            if (val.ProductId == productId)
                return val;
        })
        console.log(product);
        if (product[0].Quantity + count >= 1 && product[0].Quantity + count <= products.Stock) {
            await Cart.updateOne({ UserId: userId, 'Products.ProductId': productId }, { $inc: { 'Products.$.Quantity': count } });

            if (cart.isCoupon) {
                let totalprice = 0;
                const updatedCart = await Cart.findOne({ UserId: userId }).populate({ path: 'Products.ProductId', populate: { path: 'Offer' } });
                updatedCart.Products.forEach(item => {
                    if (item.ProductId.Offer) {
                        if (new Date(item.ProductId.Offer.startDate) <= Date.now() && new Date(item.ProductId.Offer.endDate) >= Date.now() && item.ProductId.Offer.isBlock==false) {
                            let offerprice = Math.ceil(((item.ProductId.Price) - (item.ProductId.Price * item.ProductId.Offer.Value / 100))) * item.Quantity;
                            console.log('offerprice' + offerprice)
                            totalprice += offerprice
                        } else {
                            totalprice += (item.ProductId.Price * item.Quantity);
                        }
                    } else {
                        totalprice += (item.ProductId.Price * item.Quantity);
                    }
                });
                console.log('Totalprice=' + totalprice);
                if (totalprice < cart.isCoupon.criteriaAmount) {
                    await Cart.updateOne({ UserId: userId }, { $unset: { isCoupon: 1 } });
                }
            }
            res.json({ success: true });
        } else {
            if (product[0].Quantity + count <= 1) {
                res.json({ mincount: true });
            } else {
                res.json({ nostock: true });
            }
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadCart,
    addCart,
    removeCartItem,
    updateQuantity
}