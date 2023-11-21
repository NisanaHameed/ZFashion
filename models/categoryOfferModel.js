const express = require('express');
const mongoose = require('mongoose');
const offerSchema = mongoose.Schema({
    Name:{
        type:String,
        required:true
    },
    Value:{
        type:Number,
        required:true
    },
    Category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true
    },
    isBlock:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model('CategoryOffer',offerSchema);