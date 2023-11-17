const express = require('express');
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    Image:{
        type:String,
        required:true
    },
    Type:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('Banner',bannerSchema)