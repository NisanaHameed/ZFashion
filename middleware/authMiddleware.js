const express = require("express");
const user = require("../models/userModel")

const adminAuth = (req, res, next) => {
    try {

        if (req.session.loggedIn) {
            next()
        } else {
            res.redirect('/admin/login')
        }

    } catch (error) {
        console.log(error);
    }
}

const userAuth = async (req, res, next) => {
    try {
        if (req.session.userId) {
            const data = await user.findOne({ _id: req.session.userId });
            if (data.isBlock == true) {
                res.render('userBlock');
            } else {
                next()
            }
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = { adminAuth, userAuth };