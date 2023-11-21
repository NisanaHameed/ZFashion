const express = require('express');
const CategoryOffer = require('../models/categoryOfferModel');
const Category = require('../models/categoryModel');

const loadCategoryOffer = async (req, res) => {
    try {
        const offer = await CategoryOffer.find().populate('Category');
        res.render('categoryOffer', { offer });
    } catch (err) {
        console.log(err);
    }
}

const loadAddCategoryOffer = async (req, res) => {
    try {
        const category = await Category.find();
        res.render('addCategoryOffer', { category });
    } catch (err) {
        console.log(err);
    }
}

const addCategoryOffer = async (req, res) => {
    try {
        const { name, value, category, startdate, enddate } = req.body;
        let catgorycheck = await Category.findOne({ name: category })
        if (catgorycheck.Offer) {
            return res.json({ categoryexist: true });
        } 
        let newCategoryOffer = new CategoryOffer({
            Name: name,
            Value: value,
            Category: catgorycheck._id,
            startDate: startdate,
            endDate: enddate
        })
        let savedCategoryOffer = await newCategoryOffer.save()
        await Category.updateOne({ name: category }, { $set: { Offer: savedCategoryOffer._id } });
        res.json({ success: true });
    
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

const getEditCategoryOffer = async (req, res) => {
    try {
        let id = req.params.id;
        const offer = await CategoryOffer.findById(id);
        let category = await Category.find();
        res.render('editCategoryOffer', { category, offer })
    } catch (err) {
        console.log(err);
    }
}

const editCategoryOffer = async (req, res) => {
    try {
        let offerid = req.params.id;
        const { name, value, startdate, category, enddate } = req.body;
        let offer = await CategoryOffer.findById(offerid);
        let catgorycheck = await Category.findOne({ name: category })
        if (category && catgorycheck.Offer) {
            return res.json({ categoryexist: true });
        } 
            await CategoryOffer.updateOne({ _id: offerid }, { $set: { Name: name, Value: value, Category: catgorycheck._id, startDate: startdate, endDate: enddate } })
            await Category.updateOne({ name: category }, { $set: { Offer: offerid } });
            await Category.updateOne({ name: offer.Category }, { $unset: { Offer: 1 } });
            res.json({ success: true });    

    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

const blockCategoryOffer = async (req,res)=>{
    try {
        let offerid = req.params.id;
        const offer = await CategoryOffer.findById(offerid);
        let isBlocked = offer.isBlock;
        await CategoryOffer.updateOne({ _id: offerid }, { $set: { isBlock: !isBlocked } });
        res.redirect('/admin/categoryOffer');
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    loadCategoryOffer,
    loadAddCategoryOffer,
    addCategoryOffer,
    getEditCategoryOffer,
    editCategoryOffer,
    blockCategoryOffer
}