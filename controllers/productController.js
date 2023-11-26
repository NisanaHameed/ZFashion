const express = require('express');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Offer = require('../models/offerModel');
const path = require('path');
const fs = require('fs');
const Rate = require('../models/rateModel');

const loadProducts = async (req, res) => {
    const pageNum = req.query.page;
    const perPage = 5;
    const page = '/';
    try {
        let docCount = await Product.find().countDocuments();
        let pages = Math.ceil(docCount / perPage);
        const products = await Product.find().populate('Offer').skip((pageNum - 1) * perPage).limit(perPage)
        res.render('products', { products, page, pageNum, docCount, pages });
    } catch (error) {

        console.log(error);
    }
}

const loadaddProduct = async (req, res) => {

    try {
        const category = await Category.find();
        let date = Date.now();
        const offers = await Offer.find();
        let offer = offers.filter((val) => {
            if (new Date(val.endDate) >= date) {
                return val;
            }
        })
        res.render('addproduct', { category, offer });
    } catch (error) {
        console.log(error);
    }
}

const addProduct = async (req, res) => {
    try {

        const { pname, color, price, brand, category, sizes, pdetails, stock } = req.body;
        let selectedOffer = req.body.offer;

        const images = {
            image1: req.files['image1'][0].filename,
            image2: req.files['image2'][0].filename,
            image3: req.files['image3'][0].filename,
            image4: req.files['image4'][0].filename
        }
        console.log(images)

        const products = new Product({
            product_name: pname,
            Price: price,
            Size: sizes,
            Productdetails: pdetails,
            Image: images,
            Color: color,
            Category: category,
            Brand: brand,
            Stock: stock,
        })
        const newProduct = await products.save();
        console.log('newProduct' + newProduct);
        if (selectedOffer) {
            await Product.updateOne({ _id: newProduct._id }, { $set: { Offer: selectedOffer } });
        }
        console.log('product added successfully')
        res.json({ success: true })
    } catch (error) {
        console.log(error);
    }
}

const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id);
        const product = await Product.findById(id);
        const { image1, image2, image3, image4 } = product.Image;
        await Product.deleteOne({ _id: id });
        deleteImageFile(image1);
        deleteImageFile(image2);
        deleteImageFile(image3);
        deleteImageFile(image4);
        console.log('product deleted');
        res.redirect('/admin/products');

    } catch (error) {
        console.log(error);
    }
}

function deleteImageFile(filename) {
    const imagePath = path.join(__dirname, '../public/userImages', filename);
    fs.unlink(imagePath, (err) => {
        if (err) {
            console.log("Error deleting image.." + err);
        } else {
            console.log('image deleted');
        }
    })
}

const loadUpdateProduct = async (req, res) => {
    try {
        let id = req.params.id;
        const products = await Product.findById(id)
        const category = await Category.find();
        let date = Date.now();
        const offers = await Offer.find();
        let offer = offers.filter((val) => {
            if (new Date(val.endDate) >= date) {
                return val;
            }
        })
        res.render('updateProduct', { products, category, offer });
    } catch (error) {
        console.log(error);
    }
}

const updateProduct = async (req, res) => {
    try {
        let id = req.params.id;
        console.log(id)
        const data = await Product.findById(id)
        const { pname, color, price, brand, category, sizes, pdetails, stock, offer } = req.body;
        console.log('offfer..' + offer)
        const images = {
            image1: req.files['image1'] ? req.files['image1'][0].filename : data.Image.image1,
            image2: req.files['image2'] ? req.files['image2'][0].filename : data.Image.image2,
            image3: req.files['image3'] ? req.files['image3'][0].filename : data.Image.image3,
            image4: req.files['image4'] ? req.files['image4'][0].filename : data.Image.image4
        }
        console.log(images);
        const products = {
            product_name: pname,
            Price: price,
            Size: sizes,
            Productdetails: pdetails,
            Image: images,
            Color: color,
            Category: category,
            Brand: brand,
            Stock: stock,
        };
        await Product.updateOne({ _id: id }, { $set: products });
        if (offer == "nooffer") {
            await Product.updateOne({ _id: id }, { $unset: { Offer: 1 } });
        } else if (offer) {
            await Product.updateOne({ _id: id }, { $set: { Offer: offer } });
        }
        res.json({ success: true });
    } catch (error) {
        console.log(error);
    }
}

const productsearch = async (req, res) => {
    const pageNum = req.query.page;
    const perPage = 6;
    const page = '/'
    try {
        let query = req.query.query;
        const products = await Product.find({
            $or: [
                { product_name: { $regex: query, $options: 'i' } },
                { Category: { $regex: query, $options: 'i' } }
            ]
        });
        let docCount = products.length;
        let pages = Math.ceil(docCount / perPage);
        res.render('products', { products, page, pageNum, docCount, pages });
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    loadProducts,
    loadaddProduct,
    addProduct,
    deleteProduct,
    loadUpdateProduct,
    updateProduct,
    productsearch,
}