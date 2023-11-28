const express = require('express');
const multer = require('multer');
const Banner = require('../models/bannerModel');
const fs = require('fs');
const path = require('path');

const getBanner = async (req, res) => {
    try {
        let banner = await Banner.find();
        res.render('banner', { banner });
    } catch (err) {
        console.log(err)
    }
}

const loadAddbanner = (req, res) => {
    try {
        res.render('addBanner');
    } catch (err) {
        console.log(err);
    }
}

const addBanner = async (req, res) => {
    try {
        let newBanner = new Banner({
            Image: req.file.filename,
            Type: req.body.type,
            Description: req.body.description
        })
        await newBanner.save()
            .then(() => {
                res.json({ success: true });
            })
            .catch((err) => {
                console.log(err);
                res.json({ error: true });
            })
    } catch (err) {
        console.log(err);
    }
}

const deleteBanner = async (req, res) => {
    try {
        let bannerid = req.params.id;
        let banner = await Banner.findById(bannerid);
        await Banner.deleteOne({ _id: bannerid })
            .then(() => {

                const imagePath = path.join(__dirname, '../public/bannerImages', banner.Image);
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.log("Error deleting image.." + err);
                    } else {
                        console.log('image deleted');
                    }
                })

                res.json({ success: true })
            })
            .catch((err) => {
                console.log(err);
                res.json({ error: true });
            })
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    getBanner,
    loadAddbanner,
    addBanner,
    deleteBanner
}