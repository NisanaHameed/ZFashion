const express = require('express');
const mongoose = require('mongoose');
const Rate = require('../models/rateModel');
const Product = require('../models/rateModel');

const productRating = async (req, res) => {
    try {
        let user = req.session.userId;
        let rate = req.body.rating;
        let productId = req.body.productId;
        console.log(typeof (productId))
        console.log('rate' + rate)
        console.log('productId' + productId)
        let data = {
            UserId: user,
            Rating: rate
        }

        const prate = await Rate.findOne({ ProductId: productId, 'User.UserId': user });

        if (prate) {
            await Rate.updateOne({ ProductId: productId, 'User.UserId': user }, { $set: { 'User.$.Rating': rate } });
        } else {
            await Rate.updateOne({ ProductId: productId }, { $push: { User: data } }, { upsert: true });
        }

        const result = await Rate.aggregate([
            {
                $match: { ProductId: new mongoose.Types.ObjectId(productId) }
            },
            {
                $unwind: '$User'
            },
            {
                $group: {
                    _id: '$_id',
                    averageRating: { $avg: '$User.Rating' }
                }
            }
        ])
        let newRate = result[0].averageRating
        console.log('averagerating-' + newRate);
        await Rate.updateOne({ ProductId: productId }, { $set: { totalRating: newRate } });

        res.redirect('/orders');


    } catch (err) {
        console.log(err)
    }
}

const submitproductReview = async (req, res) => {
    try {
        console.log("product review here!!!!!")
        let user = req.session.userId;
        let review = req.body.reviewInput;
        let productId = req.body.productId;
        console.log("Datatype" + typeof (productId))
        console.log('review' + review)
        console.log('productId' + productId)
        let data = {
            UserId: user,
            Review: review
        }

        const prate = await Rate.findOne({ ProductId: productId, 'User.UserId': user });
        if (prate) {
            await Rate.updateOne({ ProductId: productId, 'User.UserId': user }, { $set: { 'User.$.Review': review } });
        } else {
            const product = await Product.findById(productId)
            if (product) {
                await Rate.updateOne({ ProductId: productId }, { $push: { User: data } }, { upsert: true });
            } else {
                return res.json({ noproduct: true });
            }

        }

        res.json({ reviewsubmitted: true });

    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

module.exports = {
    productRating,
    submitproductReview
}