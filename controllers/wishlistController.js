var express = require('express');
const User = require('../models/userModel');
const Wishlist = require('../models/wishlistModel');
const Product = require('../models/productModel');

const getWishlist = async (req, res) => {
    try {
        let username = req.session.username;
        let user = req.session.userId;
        const wishlist = await Wishlist.findOne({ UserId: user }).populate({ path: 'Products.ProductId', populate: { path: 'Offer' } });
        res.render('wishlist', { wishlist, username });
    } catch (err) {
        console.log(err);
    }
}

const addWishList = async (req, res) => {
    try {
        let user = req.session.userId;
        const findUser = await User.findById(user);
        if (!findUser) {
            return res.json({ user: false })
        }
        if (findUser.isBlock) {
            return res.json({ blocked: true });
        }
        let productId = req.body.productId;
        const check = await Wishlist.findOne({ UserId: user, 'Products.ProductId': productId });
        if (!check) {
            await Wishlist.updateOne({ UserId: user }, { $push: { Products: { ProductId: productId } } }, { upsert: true })
            res.json({ added: true });
        } else {
            res.json({ inwishlist: true });
        }

    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

const moveToCart = async (req, res) => {
    try {
        let productId = req.body.productId;
        let userId = req.session.userId;
        const product = await Product.findOne({ _id: productId });
        const cart = await User.findOne({ $and: [{ _id: userId, 'Products.ProductId': productId }] })
        if (cart) {
            return res.json({ itemexist: true });
        } else {
            const pr = {
                ProductId: productId,
                Price: product.Price,
                Totalprice: product.Price,
                Quantity: 1
            }
            console.log(pr)
            await User.updateOne({ _id: userId }, { $push: { Products: pr }, $inc: { totalAmount: product.Price } });
        }
        await Wishlist.updateOne({ UserId: userId }, { $pull: { Products: { ProductId: productId } } });
        res.json({ stock: true });

    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

const removeItem = async (req, res) => {
    try {
        let productId = req.body.productId;
        let user = req.session.userId;
        await Wishlist.updateOne({ UserId: user }, { $pull: { Products: { ProductId: productId } } })
            .then(() => {
                res.json({ success: true });
            })
            .catch((err) => {
                console.log(err);
            })
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

module.exports = {
    getWishlist,
    addWishList,
    moveToCart,
    removeItem
};