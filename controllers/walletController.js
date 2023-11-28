const express = require('express');
const Wallet = require('../models/walletModel');

const getWallet = async (req, res) => {
    try {
        let username = req.session.username;
        let user = req.session.userId;
        const wallet = await Wallet.findOne({ UserId: user });
        res.render('wallet', { wallet, username });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

module.exports = {
    getWallet
}