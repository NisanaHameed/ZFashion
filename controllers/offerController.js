const express = require('express');
const Offer = require('../models/offerModel');
const Category = require('../models/categoryModel');

const getOffer = async (req, res) => {
    try {
        const offer = await Offer.find();
        res.render('offer', { offer });
    } catch (err) {
        console.log(err);
    }
}

const loadAddOffer = (req, res) => {
    try {
        res.render('addOffer')
    } catch (err) {
        console.log(err);
    }
}

const addOffer = async (req, res) => {
    try {
        const { name, value, startdate, enddate } = req.body;
        let newOffer = new Offer({
            Name: name,
            Value: value,
            startDate: startdate,
            endDate: enddate
        })
        await newOffer.save()
            .then(() => {
                res.json({ success: true });
            })
            .catch((err) => {
                console.log(err);
                res.json({ error: true });
            })
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

const blockOffer = async (req, res) => {
    try {
        let offerid = req.params.id;
        const offer = await Offer.findById(offerid);
        let isBlocked = offer.isBlock;
        await Offer.updateOne({ _id: offerid }, { $set: { isBlock: !isBlocked } });
        res.redirect('/admin/offer');
    } catch (err) {
        console.log(err);
    }
}

const getEditOffer = async (req, res) => {
    try {
        let offerid = req.params.id;
        const offer = await Offer.findById(offerid);
        res.render('editOffer', { offer })
    } catch (err) {
        console.log(err);
    }
}

const editOffer = async (req, res) => {
    try {
        let offerid = req.params.id;
        const { name, value, startdate, enddate } = req.body;
        await Offer.updateOne({ _id: offerid }, { $set: { Name: name, Value: value, startDate: startdate, endDate: enddate } })
            .then(() => {
                res.json({ success: true });
            })
            .catch(() => {
                res.json({ error: true });
            })
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}



module.exports = {
    getOffer,
    loadAddOffer,
    addOffer,
    blockOffer,
    getEditOffer,
    editOffer
}